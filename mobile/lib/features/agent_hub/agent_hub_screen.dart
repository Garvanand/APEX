import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../core/app_config.dart';
import '../../services/websocket_service.dart';
import 'sensor_engine.dart';
import 'agent_detail_screen.dart';

class AgentHubScreen extends StatefulWidget {
  const AgentHubScreen({super.key});

  @override
  State<AgentHubScreen> createState() => _AgentHubScreenState();
}

class _AgentHubScreenState extends State<AgentHubScreen> with WidgetsBindingObserver {
  final _ws = WebSocketService();
  final _sensorEngine = SensorEngine();

  int _selectedTabIndex = 0; // 0: Live Link, 1: Pulse, 2: Agents, 3: Directive, 4: Telemetry, 5: Settings
  final TextEditingController _brainDumpController = TextEditingController();
  bool _isTriggering = false;

  final List<String> _tabs = [
    "LIVE LINK",
    "PULSE",
    "AGENTS",
    "DIRECTIVE",
    "TELEMETRY",
    "SETTINGS"
  ];

  final List<Map<String, dynamic>> _agents = [
    {
      "id": "sculptor",
      "name": "Environment Sculptor",
      "desc": "Active Workspace Dimming & Audio Shield",
      "status": "PRODUCTION",
      "icon": Icons.tune,
      "color": const Color(0xFF10B981),
      "trigger": "COGNITIVE_STATE_COMMITTED",
      "action": "Adjust dark mode, mute notifications, lock distractions",
    },
    {
      "id": "state",
      "name": "State Agent",
      "desc": "Temporal Hysteresis & Feature Classification",
      "status": "PRODUCTION",
      "icon": Icons.psychology,
      "color": const Color(0xFF6366F1),
      "trigger": "SENSOR_FEATURE_VECTOR",
      "action": "Smooth 3-cycle window, commit cognitive state",
    },
    {
      "id": "sentinel",
      "name": "Deadline Sentinel",
      "desc": "Risk Estimation & Task Velocity Tracker",
      "status": "OPERATIONAL",
      "icon": Icons.timer_outlined,
      "color": const Color(0xFFF59E0B),
      "trigger": "TIME_WINDOW_TICK",
      "action": "Calculates failure probability index",
    },
    {
      "id": "radar",
      "name": "Peer Radar",
      "desc": "Proximity Mesh & Focus Coordination",
      "status": "PROTOTYPE",
      "icon": Icons.radar,
      "color": const Color(0xFF8B5CF6),
      "trigger": "BLE_BEACON_DISCOVERY",
      "action": "Broadcasts focus shield to local peers",
    },
    {
      "id": "socratic",
      "name": "Socratic Challenger",
      "desc": "Cognitive Breakthrough Assistant",
      "status": "ON-DEMAND",
      "icon": Icons.lightbulb_outline,
      "color": const Color(0xFFEC4899),
      "trigger": "USER_MANUAL_REQUEST",
      "action": "Breaks down blockers via guided inquiry",
    }
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _ws.addListener(_onWsUpdate);
    if (!_ws.isConnected && _ws.connectionState != WsConnectionState.connecting) {
      _ws.connect();
    }

    _sensorEngine.addListener(_onSensorUpdate);
    _sensorEngine.start();

    // Route sensor committed state through production transport with dynamic confidence
    _sensorEngine.onStateCommitted = (newState, reason, confidence) {
      _ws.triggerCognitiveState(newState, reason: reason, confidence: confidence / 100.0);
    };

    _sensorEngine.onFeatureVectorCalculated = (sma, jerk, spectral, touchDensity, appSwitches) {
      _ws.sendEvent("SENSOR_FEATURE_VECTOR", {
        "sma": sma,
        "jerk_variance": jerk,
        "spectral_energy": spectral,
        "touch_density": touchDensity,
        "app_switches": appSwitches,
        "timestamp": DateTime.now().toIso8601String(),
      });
    };
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _sensorEngine.registerBackground();
    }
  }

  void _onWsUpdate() {
    if (mounted) setState(() {});
  }

  void _onSensorUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _ws.removeListener(_onWsUpdate);
    _sensorEngine.removeListener(_onSensorUpdate);
    _brainDumpController.dispose();
    super.dispose();
  }

  String _formatTime(DateTime? dt) {
    if (dt == null) return "--:--:--";
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    final s = dt.second.toString().padLeft(2, '0');
    return "$h:$m:$s";
  }

  Color _getStateColor(String state) {
    switch (state.toUpperCase()) {
      case "FLOW":
        return const Color(0xFF10B981);
      case "DISTRACTED":
        return const Color(0xFFEF4444);
      case "FATIGUED":
        return const Color(0xFFF59E0B);
      case "OVERLOADED":
        return const Color(0xFFEC4899);
      default:
        return const Color(0xFF3B82F6);
    }
  }

  void _handleTrigger(String state, String reason) {
    if (_isTriggering) return;
    setState(() => _isTriggering = true);

    final double conf = (_sensorEngine.flowConfidence / 100.0).clamp(0.5, 0.99);
    _ws.triggerCognitiveState(state, reason: reason, confidence: conf);

    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) setState(() => _isTriggering = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090A0F),
      body: Listener(
        onPointerDown: (_) => _sensorEngine.registerTouch(),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildTopStatusBar(),
              _buildNavigationTabBar(),
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  child: _buildSelectedTabContent(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ==========================================
  // TOP STATUS BAR (Executive & Real-time)
  // ==========================================
  Widget _buildTopStatusBar() {
    final isConn = _ws.isConnected;
    final connColor = isConn
        ? const Color(0xFF10B981)
        : (_ws.connectionState == WsConnectionState.connecting
            ? const Color(0xFFF59E0B)
            : const Color(0xFFEF4444));

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Color(0xFF0E1118),
        border: Border(bottom: BorderSide(color: Color(0xFF1F2937))),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFF1E2638),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: const Color(0xFF374151)),
            ),
            child: const Text(
              "APEX",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 12,
                letterSpacing: 2.0,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: connColor,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: connColor.withValues(alpha: 0.5),
                        blurRadius: 6,
                        spreadRadius: 1,
                      )
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  isConn ? "LIVE LINK ACTIVE" : _ws.connectionState.name.toUpperCase(),
                  style: TextStyle(
                    color: connColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.0,
                  ),
                ),
                if (isConn) ...[
                  const SizedBox(width: 8),
                  Text(
                    "• ${_ws.latencyMs}ms",
                    style: const TextStyle(
                      color: Color(0xFF9CA3AF),
                      fontSize: 11,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, size: 18, color: Color(0xFF9CA3AF)),
            onPressed: () {
              _ws.connect();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text("Re-authenticating session with relay..."),
                  duration: Duration(seconds: 1),
                ),
              );
            },
            tooltip: "Reconnect WebSocket",
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  // ==========================================
  // NAVIGATION TAB BAR
  // ==========================================
  Widget _buildNavigationTabBar() {
    return Container(
      height: 42,
      decoration: const BoxDecoration(
        color: Color(0xFF090A0F),
        border: Border(bottom: BorderSide(color: Color(0xFF1F2937))),
      ),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _tabs.length,
        itemBuilder: (context, index) {
          final isSelected = _selectedTabIndex == index;
          return GestureDetector(
            onTap: () => setState(() => _selectedTabIndex = index),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: isSelected ? const Color(0xFF3B82F6) : Colors.transparent,
                    width: 2.0,
                  ),
                ),
              ),
              child: Text(
                _tabs[index],
                style: TextStyle(
                  color: isSelected ? Colors.white : const Color(0xFF6B7280),
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                  letterSpacing: 1.2,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSelectedTabContent() {
    switch (_selectedTabIndex) {
      case 0:
        return _buildLiveLinkTab();
      case 1:
        return _buildPulseTab();
      case 2:
        return _buildAgentsTab();
      case 3:
        return _buildDirectiveTab();
      case 4:
        return _buildTelemetryTab();
      case 5:
        return _buildSettingsTab();
      default:
        return _buildLiveLinkTab();
    }
  }

  // ==========================================
  // TAB 0: LIVE LINK (Primary Engineering View)
  // ==========================================
  Widget _buildLiveLinkTab() {
    return SingleChildScrollView(
      key: const ValueKey("live_link_tab"),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSessionRegistryCard(),
          const SizedBox(height: 16),
          _buildPipelineVisualizer(),
          const SizedBox(height: 16),
          _buildControlledDemoControls(),
          const SizedBox(height: 16),
          _buildSensorTelemetrySummary(),
        ],
      ),
    );
  }

  // 1. Session Registry Card
  Widget _buildSessionRegistryCard() {
    final persistentId = _ws.persistentDeviceId ?? _ws.deviceId ?? "apex-mobile-node";
    final sessId = _ws.sessionId ?? (_ws.isConnected ? "ESTABLISHED" : "OFFLINE");
    final netRtt = "${_ws.networkRttMs} ms";
    final txRtt = _ws.transactionRttMs != null ? "${_ws.transactionRttMs} ms" : "READY";

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _ws.isConnected ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    "APEX LIVE LINK",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _ws.isConnected
                      ? const Color(0xFF10B981).withValues(alpha: 0.1)
                      : const Color(0xFFEF4444).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: _ws.isConnected
                        ? const Color(0xFF10B981).withValues(alpha: 0.3)
                        : const Color(0xFFEF4444).withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  _ws.isConnected ? "CONNECTED" : "OFFLINE",
                  style: TextStyle(
                    color: _ws.isConnected ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _buildMetaItem("PERSISTENT DEVICE", persistentId),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetaItem("SESSION ID", sessId),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildMetaItem("NETWORK RTT (PING)", netRtt),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetaItem("TRANSACTION RTT (FULL-LOOP)", txRtt),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Bidirectional Uplink / Downlink Indicators
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF090A0F),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.arrow_upward,
                          size: 13,
                          color: _ws.isUplinkConnected ? const Color(0xFF10B981) : const Color(0xFF6B7280),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          "UPLINK (PHONE → DESKTOP)",
                          style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                        ),
                      ],
                    ),
                    Text(
                      _ws.isUplinkConnected ? "CONNECTED" : "OFFLINE",
                      style: TextStyle(
                        color: _ws.isUplinkConnected ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.arrow_downward,
                          size: 13,
                          color: _ws.isDownlinkConnected ? const Color(0xFF3B82F6) : const Color(0xFF6B7280),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          "DOWNLINK (DESKTOP → PHONE)",
                          style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                        ),
                      ],
                    ),
                    Text(
                      _ws.isDownlinkConnected ? "CONNECTED" : "AWAITING DESKTOP",
                      style: TextStyle(
                        color: _ws.isDownlinkConnected ? const Color(0xFF3B82F6) : const Color(0xFFF59E0B),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (_ws.hasRecentDesktopEvent) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.sync_alt, size: 14, color: Color(0xFF8B5CF6)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      "DESKTOP EVENT RECEIVED: ${_ws.lastDesktopEventState}",
                      style: const TextStyle(
                        color: Color(0xFF8B5CF6),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const Text("BIDIRECTIONAL", style: TextStyle(color: Colors.white54, fontSize: 8, fontFamily: 'monospace')),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMetaItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF6B7280),
            fontSize: 9,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.0,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontFamily: 'monospace',
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  // 2. Animated Pipeline Visualizer
  Widget _buildPipelineVisualizer() {
    final stage = _ws.pipelineStage;
    final isTransmitting = stage == PipelineStage.transmitting;
    final isRelay = stage == PipelineStage.relayReceived;
    final isDesktop = stage == PipelineStage.desktopUpdated;
    final isSculptor = stage == PipelineStage.sculptorExecuted;
    final isAck = stage == PipelineStage.ackReceived;

    String statusText = "PIPELINE IDLE — AWAITING SENSOR OR MANUAL TRIGGER";
    Color statusColor = const Color(0xFF6B7280);

    if (isTransmitting) {
      statusText = "1/5: TRANSMITTING EVENT TO RELAY (:8080)...";
      statusColor = const Color(0xFF3B82F6);
    } else if (isRelay) {
      statusText = "2/5: RELAY VALIDATED & ROUTING TO DESKTOP CLIENT...";
      statusColor = const Color(0xFFF59E0B);
    } else if (isDesktop) {
      statusText = "3/5: DESKTOP CONTEXT COMMITTED COGNITIVE STATE...";
      statusColor = const Color(0xFF8B5CF6);
    } else if (isSculptor) {
      statusText = "4/5: ENVIRONMENT SCULPTOR ACTIVE ON DESKTOP...";
      statusColor = const Color(0xFFEC4899);
    } else if (isAck) {
      final rttStr = _ws.roundTripDurationMs != null ? " (${_ws.roundTripDurationMs}ms RTT)" : "";
      statusText = "5/5: COMPLETE ROUND-TRIP ACK RECEIVED FROM LAPTOP!$rttStr";
      statusColor = const Color(0xFF10B981);
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: stage != PipelineStage.idle
              ? statusColor.withValues(alpha: 0.5)
              : const Color(0xFF1F2937),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "CROSS-DEVICE PIPELINE EXECUTION",
                style: TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  stage.name.toUpperCase(),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // 5-Stage Interconnected Nodes
          Row(
            children: [
              _buildPipelineNode("PHONE", Icons.smartphone, isTransmitting || isAck, const Color(0xFF3B82F6)),
              _buildPipelineConnector(isTransmitting || isRelay),
              _buildPipelineNode("RELAY", Icons.router, isRelay, const Color(0xFFF59E0B)),
              _buildPipelineConnector(isRelay || isDesktop),
              _buildPipelineNode("DESKTOP", Icons.laptop_chromebook, isDesktop, const Color(0xFF8B5CF6)),
              _buildPipelineConnector(isDesktop || isSculptor),
              _buildPipelineNode("SCULPTOR", Icons.auto_mode, isSculptor, const Color(0xFFEC4899)),
              _buildPipelineConnector(isSculptor || isAck),
              _buildPipelineNode("ACK", Icons.verified, isAck, const Color(0xFF10B981)),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF090A0F),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Row(
              children: [
                Icon(Icons.terminal, size: 14, color: statusColor),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    statusText,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPipelineNode(String label, IconData icon, bool active, Color color) {
    return Expanded(
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: active ? color.withValues(alpha: 0.2) : const Color(0xFF1F2937),
              shape: BoxShape.circle,
              border: Border.all(
                color: active ? color : const Color(0xFF374151),
                width: active ? 2 : 1,
              ),
              boxShadow: active
                  ? [
                      BoxShadow(
                        color: color.withValues(alpha: 0.6),
                        blurRadius: 10,
                        spreadRadius: 2,
                      )
                    ]
                  : [],
            ),
            child: Icon(
              icon,
              size: 18,
              color: active ? color : const Color(0xFF9CA3AF),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              color: active ? color : const Color(0xFF6B7280),
              fontSize: 9,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPipelineConnector(bool active) {
    return Container(
      width: 14,
      height: 2,
      color: active ? const Color(0xFF10B981) : const Color(0xFF374151),
      margin: const EdgeInsets.only(bottom: 18),
    );
  }

  // 3. Controlled Demo Controls (Routes via production WebSocket)
  Widget _buildControlledDemoControls() {
    final activeState = _ws.activeCognitiveState;
    final isBusy = _ws.pipelineStage != PipelineStage.idle;
    final activeTx = _ws.activeTransaction;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "OPERATOR TRANSACTION CONTROLS",
                style: TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isBusy ? const Color(0xFFF59E0B).withValues(alpha: 0.1) : const Color(0xFF10B981).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isBusy ? "DISPATCHING TRANSACTION" : "READY FOR LIVE TRANSACTION",
                  style: TextStyle(
                    color: isBusy ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Active Transaction Context Panel
          if (isBusy && activeTx != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF090A0F),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "TRANSACTION #${_ws.transactionLedger.length}",
                        style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      ),
                      Text(
                        "State: ${activeTx.state} (${(activeTx.confidence * 100).round()}%)",
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "Correlation: ${activeTx.transactionId}",
                    style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 9, fontFamily: 'monospace'),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "Reason: ${activeTx.reason}",
                    style: const TextStyle(color: Color(0xFF6B7280), fontSize: 9),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
          Row(
            children: [
              Expanded(
                child: _buildTriggerButton(
                  "TRIGGER DISTRACTION",
                  const Color(0xFFEF4444),
                  activeState == "DISTRACTED",
                  () => _handleTrigger("DISTRACTED", "Rapid context switching detected"),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTriggerButton(
                  "TRIGGER FATIGUE",
                  const Color(0xFFF59E0B),
                  activeState == "FATIGUED",
                  () => _handleTrigger("FATIGUED", "Extended session strain detected"),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildTriggerButton(
                  "TRIGGER OVERLOAD",
                  const Color(0xFFEC4899),
                  activeState == "OVERLOADED",
                  () => _handleTrigger("OVERLOADED", "Severe cognitive overload threshold"),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTriggerButton(
                  "TRIGGER FLOW",
                  const Color(0xFF10B981),
                  activeState == "FLOW",
                  () => _handleTrigger("FLOW", "Equilibrium and deep focus maintained"),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: isBusy ? null : () => _handleTrigger("FLOW", "Operator reset & baseline calibration"),
              icon: const Icon(Icons.restart_alt, size: 16, color: Color(0xFF9CA3AF)),
              label: const Text(
                "CALIBRATE / RESET BASELINE",
                style: TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF374151)),
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
              ),
            ),
          ),
          const SizedBox(height: 6),
          SizedBox(
            width: double.infinity,
            child: TextButton.icon(
              onPressed: () => _showTransactionLedgerModal(context),
              icon: const Icon(Icons.receipt_long, size: 14, color: Color(0xFF3B82F6)),
              label: Text(
                "INSPECT TRANSACTION LEDGER (${_ws.transactionLedger.length})",
                style: const TextStyle(
                  color: Color(0xFF3B82F6),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTriggerButton(String label, Color color, bool isCurrent, VoidCallback onTap) {
    final isBusy = _ws.pipelineStage != PipelineStage.idle;
    return ElevatedButton(
      onPressed: (_isTriggering || isBusy) ? null : onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: isCurrent ? color.withValues(alpha: 0.25) : const Color(0xFF1E2638),
        side: BorderSide(color: isCurrent ? color : const Color(0xFF374151), width: isCurrent ? 2 : 1),
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: (_isTriggering || isBusy) ? Colors.white38 : (isCurrent ? Colors.white : color),
          fontSize: 9,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  void _showTransactionLedgerModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F1420),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        side: BorderSide(color: Color(0xFF1F2937)),
      ),
      builder: (ctx) {
        final ledger = _ws.transactionLedger;
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          maxChildSize: 0.9,
          minChildSize: 0.4,
          expand: false,
          builder: (_, scrollCtrl) {
            return Padding(
              padding: const EdgeInsets.all(20),
              child: ListView(
                controller: scrollCtrl,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "CORRELATED TRANSACTION LEDGER",
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.2),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          "${ledger.length} TRANSACTIONS",
                          style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 10, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (ledger.isEmpty) ...[
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 30),
                      child: Center(
                        child: Text(
                          "No transactions logged yet.\nTap a trigger button on the LIVE LINK tab.",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Color(0xFF6B7280), fontSize: 12),
                        ),
                      ),
                    ),
                  ] else ...[
                    ...ledger.map((tx) {
                      final isCurrent = tx.transactionId == _ws.activeCorrelationId;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isCurrent ? const Color(0xFF3B82F6) : const Color(0xFF1F2937),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "TX: ${tx.transactionId}",
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: tx.isCompleted
                                        ? const Color(0xFF10B981).withValues(alpha: 0.1)
                                        : (tx.isFailed ? const Color(0xFFEF4444).withValues(alpha: 0.1) : const Color(0xFFF59E0B).withValues(alpha: 0.1)),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    tx.isCompleted ? "COMPLETED" : (tx.isFailed ? "FAILED" : "IN FLIGHT"),
                                    style: TextStyle(
                                      color: tx.isCompleted ? const Color(0xFF10B981) : (tx.isFailed ? const Color(0xFFEF4444) : const Color(0xFFF59E0B)),
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "State: ${tx.state} (${(tx.confidence * 100).round()}%) • ${tx.reason}",
                              style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 10),
                            ),
                            const SizedBox(height: 10),
                            _buildLedgerStep("1", "T+000 ms PHONE", "COGNITIVE_STATE_COMMITTED emitted", true),
                            _buildLedgerStep(
                              "2",
                              tx.relayOffsetMs != null ? "T+${tx.relayOffsetMs} ms RELAY" : "T+... ms RELAY",
                              "STATE_TRANSITION_ACK confirmed by relay",
                              tx.relayAckTime != null,
                            ),
                            _buildLedgerStep(
                              "3",
                              tx.desktopOffsetMs != null ? "T+${tx.desktopOffsetMs} ms DESKTOP" : "T+... ms DESKTOP",
                              "DESKTOP_STATE_CHANGED received from laptop",
                              tx.desktopUpdateTime != null,
                            ),
                            _buildLedgerStep(
                              "4",
                              tx.sculptorExecutingOffsetMs != null ? "T+${tx.sculptorExecutingOffsetMs} ms SCULPTOR" : "T+... ms SCULPTOR",
                              "SCULPTOR_ACTION_EXECUTING: ${tx.sculptorAction ?? 'focus intervention'}",
                              tx.sculptorExecutingTime != null,
                            ),
                            _buildLedgerStep(
                              "5",
                              tx.executionConfirmationOffsetMs != null ? "T+${tx.executionConfirmationOffsetMs} ms MOBILE" : "T+... ms MOBILE",
                              "SCULPTOR_ACTION_EXECUTED confirmed • Total RTT: ${tx.totalDurationMs ?? '...'} ms",
                              tx.executionConfirmationTime != null,
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E2638)),
                      child: const Text("DISMISS LEDGER", style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildLedgerStep(String step, String title, String subtitle, bool complete) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: complete ? const Color(0xFF10B981).withValues(alpha: 0.2) : const Color(0xFF1F2937),
              shape: BoxShape.circle,
              border: Border.all(color: complete ? const Color(0xFF10B981) : const Color(0xFF374151)),
            ),
            child: Center(
              child: Text(
                step,
                style: TextStyle(
                  color: complete ? const Color(0xFF10B981) : const Color(0xFF6B7280),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 10, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 4. Sensor Telemetry Summary
  Widget _buildSensorTelemetrySummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "EDGE INFERENCE & SENSORS",
                style: TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _sensorEngine.isRealSensor
                      ? const Color(0xFF10B981).withValues(alpha: 0.1)
                      : const Color(0xFFF59E0B).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _sensorEngine.isRealSensor ? "HARDWARE ACTIVE" : "EMULATED / WEB",
                  style: TextStyle(
                    color: _sensorEngine.isRealSensor ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  "COMMITTED STATE",
                  _sensorEngine.committedState,
                  _getStateColor(_sensorEngine.committedState),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  "PREDICTED",
                  _sensorEngine.predictedState,
                  const Color(0xFF3B82F6),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  "CONFIDENCE",
                  "${_sensorEngine.confidence}%",
                  Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            "TRANSITION REASON: ${_sensorEngine.transitionReason}",
            style: const TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 10,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF090A0F),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 8,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 13,
              fontWeight: FontWeight.bold,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 1: PULSE (Biometric & State Depth)
  // ==========================================
  Widget _buildPulseTab() {
    final state = _ws.activeCognitiveState;
    final accentColor = _getStateColor(state);
    final history = _sensorEngine.transitionHistory;

    return SingleChildScrollView(
      key: const ValueKey("pulse_tab"),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 10),
          Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: accentColor.withValues(alpha: 0.05),
              border: Border.all(color: accentColor.withValues(alpha: 0.4), width: 3),
              boxShadow: [
                BoxShadow(
                  color: accentColor.withValues(alpha: 0.2),
                  blurRadius: 30,
                  spreadRadius: 5,
                )
              ],
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    state,
                    style: TextStyle(
                      color: accentColor,
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "${_sensorEngine.confidence}% INDEX",
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 11,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            state == "FLOW" ? "OPTIMAL COGNITIVE ENGAGEMENT" : "INTERVENTION PROTOCOL ACTIVE",
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            "Temporal hysteresis active. 3 consecutive evaluation cycles (1500ms) required before state commit.",
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF6B7280), fontSize: 11),
          ),
          const SizedBox(height: 20),
          _buildTelemetryDataGrid(),
          const SizedBox(height: 20),
          // Transition History Ledger
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "STATE TRANSITION HISTORY LEDGER",
                      style: TextStyle(
                        color: Color(0xFF9CA3AF),
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.5,
                      ),
                    ),
                    Text(
                      "${history.length} TRANSITIONS",
                      style: const TextStyle(
                        color: Color(0xFF6B7280),
                        fontSize: 10,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (history.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Center(
                      child: Text(
                        "No state transitions committed yet. Current state stable.",
                        style: TextStyle(color: Color(0xFF6B7280), fontSize: 11),
                      ),
                    ),
                  )
                else
                  ...history.take(6).map((record) {
                    final timeStr = _formatTime(record.timestamp);
                    final toColor = _getStateColor(record.toState);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF090A0F),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF1F2937)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                timeStr,
                                style: const TextStyle(
                                  color: Color(0xFF6B7280),
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                "${record.fromState}  ➔  ",
                                style: const TextStyle(
                                  color: Color(0xFF9CA3AF),
                                  fontSize: 11,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              Text(
                                record.toState,
                                style: TextStyle(
                                  color: toColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: toColor.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  "${record.confidence}%",
                                  style: TextStyle(
                                    color: toColor,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            record.reason,
                            style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 10),
                          ),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 2: AGENTS (Autonomous Squad Status)
  // ==========================================
  Widget _buildAgentsTab() {
    return ListView.separated(
      key: const ValueKey("agents_tab"),
      padding: const EdgeInsets.all(16),
      itemCount: _agents.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final agent = _agents[index];
        final color = agent["color"] as Color;

        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => AgentDetailScreen(agent: agent)),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: color.withValues(alpha: 0.3)),
                  ),
                  child: Icon(agent["icon"] as IconData, color: color, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            agent["name"] as String,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              agent["status"] as String,
                              style: TextStyle(
                                color: color,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        agent["desc"] as String,
                        style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 11),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        "TRIGGER: ${agent["trigger"]}",
                        style: const TextStyle(
                          color: Color(0xFF6B7280),
                          fontSize: 9,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: Color(0xFF4B5563), size: 18),
              ],
            ),
          ),
        );
      },
    );
  }

  // ==========================================
  // TAB 3: DIRECTIVE (Task & Intervention)
  // ==========================================
  Widget _buildDirectiveTab() {
    final activeState = _ws.activeCognitiveState;
    String whyActedTitle = "WHY APEX ACTED: FOCUS PRESERVATION";
    String whyActedDesc = "Optimal engagement detected. Environment Sculptor has dimmed secondary desktop widgets, muted non-critical background sounds, and locked distracting notifications.";
    Color whyColor = const Color(0xFF10B981);

    if (activeState == "DISTRACTED") {
      whyActedTitle = "WHY APEX ACTED: CONTEXT SWITCH INTERVENTION";
      whyActedDesc = "Frequent app-switching or irregular touch patterns detected. Desktop workspace dimming initiated (30% background attenuation) with a focus banner to guide recovery.";
      whyColor = const Color(0xFFEF4444);
    } else if (activeState == "FATIGUED") {
      whyActedTitle = "WHY APEX ACTED: COGNITIVE STRAIN MITIGATION";
      whyActedDesc = "Prolonged high-strain session duration detected. Desktop interface color temperature adjusted warm, high-priority break reminder scheduled.";
      whyColor = const Color(0xFFF59E0B);
    } else if (activeState == "OVERLOADED") {
      whyActedTitle = "WHY APEX ACTED: OVERLOAD SHIELD ENGAGED";
      whyActedDesc = "Extreme cognitive load vector detected. Full distraction shield active on desktop; all notifications silenced and active tasks isolated.";
      whyColor = const Color(0xFFEC4899);
    }

    return SingleChildScrollView(
      key: const ValueKey("directive_tab"),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "ACTIVE SYSTEM DIRECTIVE",
            style: TextStyle(
              color: Color(0xFF9CA3AF),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 2.0,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        "PRIORITY TARGET",
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Text("DUE IN 38m", style: TextStyle(color: Color(0xFFEF4444), fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 14),
                const Text(
                  "Compiler Construction & AST Verification",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  "Protecting flow state against context switches. Non-essential desktop notifications silenced via Environment Sculptor.",
                  style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Dynamic "Why APEX Acted" Explanation Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: whyColor.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: whyColor),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        whyActedTitle,
                        style: TextStyle(
                          color: whyColor,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  whyActedDesc,
                  style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            "RAPID THOUGHT CAPTURE",
            style: TextStyle(
              color: Color(0xFF9CA3AF),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 2.0,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _brainDumpController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: "Capture distracting thought to workspace inbox...",
              hintStyle: const TextStyle(color: Color(0xFF6B7280)),
              filled: true,
              fillColor: const Color(0xFF111827),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Color(0xFF1F2937)),
              ),
              suffixIcon: IconButton(
                icon: const Icon(Icons.send, color: Color(0xFF3B82F6), size: 18),
                onPressed: () {
                  if (_brainDumpController.text.isNotEmpty) {
                    _ws.sendEvent("QUICK_CAPTURE", {"text": _brainDumpController.text});
                    _brainDumpController.clear();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Captured thought routed to desktop inbox.")),
                    );
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 4: TELEMETRY (Raw Sensor Vectors)
  // ==========================================
  Widget _buildTelemetryTab() {
    return SingleChildScrollView(
      key: const ValueKey("telemetry_tab"),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _sensorEngine.isRealSensor
                  ? const Color(0xFF10B981).withValues(alpha: 0.1)
                  : const Color(0xFFF59E0B).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: _sensorEngine.isRealSensor
                    ? const Color(0xFF10B981).withValues(alpha: 0.3)
                    : const Color(0xFFF59E0B).withValues(alpha: 0.3),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  _sensorEngine.isRealSensor ? Icons.sensors : Icons.sensors_off,
                  color: _sensorEngine.isRealSensor ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                  size: 20,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _sensorEngine.isRealSensor
                            ? "HARDWARE TRANSDUCER ACTIVE"
                            : "EMULATED / WEB FALLBACK ACTIVE",
                        style: TextStyle(
                          color: _sensorEngine.isRealSensor ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _sensorEngine.isRealSensor
                            ? "Physical accelerometer and gyroscope streams transmitting live vectors."
                            : "Web or desktop sandbox mode. Generating mathematical telemetry.",
                        style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 10),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildTelemetryDataGrid(),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "HYSTERESIS STABILITY MONITOR",
                  style: TextStyle(
                    color: Color(0xFF9CA3AF),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  "APEX utilizes a 3-cycle (1500ms) temporal window before committing states. This prevents false positive transitions from momentary accelerometer spikes or sudden notification dismissals.",
                  style: TextStyle(color: Color(0xFF6B7280), fontSize: 11, height: 1.4),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(child: _buildMetaItem("SAMPLE RATE", "2 Hz (500ms tick)")),
                    Expanded(child: _buildMetaItem("WINDOW BUFFER", "3 consecutive ticks")),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryDataGrid() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "LIVE HARDWARE VECTOR METRICS",
            style: TextStyle(
              color: Color(0xFF9CA3AF),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  "ACCEL X/Y/Z",
                  "${_sensorEngine.accelX.toStringAsFixed(1)} / ${_sensorEngine.accelY.toStringAsFixed(1)} / ${_sensorEngine.accelZ.toStringAsFixed(1)}",
                  Colors.white,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  "GYRO X/Y/Z",
                  "${_sensorEngine.gyroX.toStringAsFixed(1)} / ${_sensorEngine.gyroY.toStringAsFixed(1)} / ${_sensorEngine.gyroZ.toStringAsFixed(1)}",
                  Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  "TOUCH DENSITY 5S",
                  _sensorEngine.touchDensity5s.toStringAsFixed(2),
                  const Color(0xFF3B82F6),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  "JERK VARIANCE",
                  _sensorEngine.jerkVariance5s.toStringAsFixed(2),
                  const Color(0xFFF59E0B),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  "SMA (ENERGY)",
                  _sensorEngine.sma5s.toStringAsFixed(2),
                  const Color(0xFF10B981),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildMetricTile(
                  "SPECTRAL ENERGY [AC POWER]",
                  _sensorEngine.spectralEnergy5s.toStringAsFixed(3),
                  const Color(0xFF8B5CF6),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMetricTile(
                  "APP SWITCHES [5S]",
                  "${_sensorEngine.backgroundTransitions}",
                  Colors.white70,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF090A0F),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "5-DIMENSIONAL FEATURE VECTOR (ONNX TENSOR)",
                  style: TextStyle(color: Color(0xFF6B7280), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                ),
                const SizedBox(height: 4),
                Text(
                  "[ ${_sensorEngine.sma5s.toStringAsFixed(2)}, ${_sensorEngine.jerkVariance5s.toStringAsFixed(2)}, ${_sensorEngine.spectralEnergy5s.toStringAsFixed(3)}, ${_sensorEngine.touchDensity5s.toStringAsFixed(2)}, ${_sensorEngine.backgroundTransitions}.0 ]",
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  _sensorEngine.isRealSensor
                      ? "PROVENANCE: [SMA: Measured, Jerk: Measured, Spectral: Parseval AC Power, Touch: Measured, Switches: Measured]"
                      : "PROVENANCE: [SIMULATION MODE: Synthetic mathematical telemetry for unsupported runtime environment]",
                  style: const TextStyle(color: Color(0xFF6B7280), fontSize: 8, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // TAB 5: SETTINGS (Network & Pair Bridge)
  // ==========================================
  Widget _buildSettingsTab() {
    final TextEditingController hostController = TextEditingController(text: AppConfig().serverIp);

    return SingleChildScrollView(
      key: const ValueKey("settings_tab"),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "NETWORK CONFIGURATION",
            style: TextStyle(
              color: Color(0xFF9CA3AF),
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("RELAY HOST / IP", style: TextStyle(color: Color(0xFF6B7280), fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                TextField(
                  controller: hostController,
                  style: const TextStyle(color: Colors.white, fontFamily: 'monospace', fontSize: 13),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: const Color(0xFF090A0F),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF1F2937))),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          AppConfig().serverIp = hostController.text.trim();
                          _ws.connect();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text("Relay target updated to ${AppConfig().serverIp}:8080")),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3B82F6),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        child: const Text("UPDATE & RECONNECT", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton(
                      onPressed: () {
                        if (_ws.isConnected) {
                          _ws.disconnect();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Disconnected from relay")),
                          );
                        } else {
                          _ws.connect();
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Reconnecting to relay...")),
                          );
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF374151)),
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                      child: Text(
                        _ws.isConnected ? "DISCONNECT" : "CONNECT",
                        style: TextStyle(
                          color: _ws.isConnected ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111827),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF1F2937)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "DIAGNOSTIC STATUS",
                  style: TextStyle(
                    color: Color(0xFF9CA3AF),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 10),
                _buildMetaItem("WEBSOCKET URI", "ws://${AppConfig().serverIp}:8080/ws"),
                const SizedBox(height: 6),
                _buildMetaItem("PERSISTENT DEVICE ID", _ws.persistentDeviceId ?? _ws.deviceId ?? "apex-mobile-node"),
                const SizedBox(height: 6),
                _buildMetaItem("CLIENT RUNTIME", kIsWeb ? "Flutter Web Companion" : "Flutter Native Engine"),
                const SizedBox(height: 6),
                _buildMetaItem("EVENTS ACKNOWLEDGED", "${_ws.eventsAcked}"),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
