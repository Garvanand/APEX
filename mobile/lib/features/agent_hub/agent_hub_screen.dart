import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'dart:ui';
import '../../core/theme.dart';
import '../../services/websocket_service.dart';
import 'agent_detail_screen.dart';
import 'sensor_engine.dart';

class AgentHubScreen extends StatefulWidget {
  const AgentHubScreen({super.key});

  @override
  State<AgentHubScreen> createState() => _AgentHubScreenState();
}

class _AgentHubScreenState extends State<AgentHubScreen> with WidgetsBindingObserver {
  final _ws = WebSocketService();
  final _sensorEngine = SensorEngine();
  
  bool _lockdownActive = false;
  final TextEditingController _brainDumpController = TextEditingController();
  
  Map<String, dynamic> _demoState = {
    "step": -1,
    "cognitiveState": "IDLE",
    "failureRisk": "--",
    "activeIntervention": "None",
    "flowConfidence": "--",
    "timeSaved": "--",
    "contextSwitches": "--",
    "estimatedCompletion": "--",
    "causality": null,
    "before": {
      "failureRisk": "89%", "estimatedCompletion": "11:58 PM", "contextSwitches": "17", "timeSaved": "0m"
    },
    "after": {
      "failureRisk": "--", "estimatedCompletion": "--", "contextSwitches": "--", "timeSaved": "--"
    }
  };

  final List<Map<String, dynamic>> agents = [
    { "id": "study", "name": "Study", "desc": "Notes", "icon": Icons.menu_book, "color": const Color(0xFF2AD98F) },
    { "id": "schedule", "name": "Schedule", "desc": "Timeline", "icon": Icons.calendar_month, "color": const Color(0xFFE94A4A) },
    { "id": "expense", "name": "Expense", "desc": "Receipts", "icon": Icons.receipt_long, "color": const Color(0xFFFFB800) },
    { "id": "content", "name": "Content", "desc": "Drafts", "icon": Icons.edit_document, "color": const Color(0xFF9D4EDD) }
  ];

  final List<Map<String, dynamic>> timelineSteps = [
    { "id": 0, "label": "Distraction Detected" },
    { "id": 1, "label": "Deadline Risk Calculated" },
    { "id": 2, "label": "Environment Adapted" },
    { "id": 3, "label": "Critical Insight Surfaced" },
    { "id": 4, "label": "Understanding Validated" },
    { "id": 5, "label": "Flow Restored" }
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _ws.connect();
    _ws.addListener(_onWsUpdate);
    
    _sensorEngine.start();
    _sensorEngine.addListener(_onSensorUpdate);
    
    _sensorEngine.onFeatureVectorCalculated = (sma, jerk, touchDensity, appSwitches) {
      _ws.sendEvent("SENSOR_FEATURE_VECTOR", {
        "sma": sma,
        "jerk_variance": jerk,
        "touch_density": touchDensity,
        "app_switches": appSwitches
      });
    };
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _sensorEngine.registerBackground();
    }
  }

  void _onSensorUpdate() {
    if (_sensorEngine.distractionScore > 75 && !_lockdownActive) {
      setState(() {
        _lockdownActive = true;
      });
    } else if (_sensorEngine.distractionScore < 30 && _lockdownActive) {
      setState(() {
        _lockdownActive = false;
      });
    }

    if (mounted) setState(() {});

    // Stream telemetry
    _ws.sendEvent("COGNITIVE_STATE_REALTIME", {
      "device_source": "iqoo-mobile-client",
      "distractionScore": _sensorEngine.distractionScore,
      "flowConfidence": _sensorEngine.flowConfidence,
      "fatigueScore": _sensorEngine.fatigueScore,
      "accelX": _sensorEngine.accelX,
      "accelY": _sensorEngine.accelY,
      "accelZ": _sensorEngine.accelZ,
      "touchBurstCount": _sensorEngine.touchBurstCount,
      "backgroundTransitions": _sensorEngine.backgroundTransitions,
    });
  }

  void _onWsUpdate() {
    if (_ws.lastDemoSync != null) {
      setState(() {
        _demoState = _ws.lastDemoSync!;
      });
    } else {
      setState(() {});
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _ws.removeListener(_onWsUpdate);
    _sensorEngine.removeListener(_onSensorUpdate);
    _sensorEngine.stop();
    _brainDumpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final beforeMetrics = _demoState["before"] ?? { "failureRisk": "89%", "estimatedCompletion": "11:58 PM", "contextSwitches": "17", "timeSaved": "0m" };
    final afterMetrics = _demoState["after"] ?? { "failureRisk": "--", "estimatedCompletion": "--", "contextSwitches": "--", "timeSaved": "--" };
    final currentStep = _demoState["step"] ?? -1;

    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: Listener(
        onPointerDown: (_) => _sensorEngine.registerTouch(),
        child: SafeArea(
          child: Stack(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // 1. GLOBAL CONNECTION STATUS
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.white10)),
                color: Color(0xFF111111),
              ),
              child: Row(
                children: [
                  Icon(
                    _ws.isConnected ? Icons.cloud_done : Icons.cloud_off, 
                    color: _ws.isConnected ? ApexTheme.success : ApexTheme.textMuted,
                    size: 16
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _ws.isConnected ? "iQOO Office Kit Bridge Connected" : "Connecting to Bridge...", 
                          style: TextStyle(color: _ws.isConnected ? ApexTheme.success : ApexTheme.textMuted, fontSize: 12, fontWeight: FontWeight.bold)
                        ),
                        if (_ws.isConnected)
                          Text("Laptop Agent Engine Connected • ${_ws.latencyMs}ms RTT", style: const TextStyle(color: Colors.white54, fontSize: 10)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            if (currentStep < 0)
              const LiveSensorsWidget(),

            // MISSION CONTROL
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("APEX AgentOS", style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -1)),
                        if (currentStep < 0)
                          Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.warning_amber, color: Colors.orange, size: 20),
                                onPressed: () {
                                  _sensorEngine.toggleSimulation(true);
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Simulating Distraction...")));
                                },
                                tooltip: "Simulate Distraction",
                              ),
                              IconButton(
                                icon: const Icon(Icons.spa, color: Colors.green, size: 20),
                                onPressed: () {
                                  _sensorEngine.toggleSimulation(false);
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Simulating Focus...")));
                                },
                                tooltip: "Simulate Focus",
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton.icon(
                                onPressed: () {
                                  _ws.sendEvent("DEMO_START", {});
                                },
                                icon: const Icon(Icons.play_arrow, size: 16, color: Colors.white),
                                label: const Text("START DEMO", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0, color: Colors.white)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blueAccent,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // PHASE 2: OUTCOME BOARD
                    const Text("OUTCOME BOARD", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.05), border: Border.all(color: Colors.redAccent.withOpacity(0.2)), borderRadius: BorderRadius.circular(12)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("BEFORE", style: TextStyle(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                                const SizedBox(height: 8),
                                _buildSmallMetric("Failure Risk", beforeMetrics["failureRisk"], Colors.white),
                                _buildSmallMetric("Switches", beforeMetrics["contextSwitches"], Colors.white),
                                _buildSmallMetric("Est. Finish", beforeMetrics["estimatedCompletion"], Colors.white),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(color: ApexTheme.success.withOpacity(0.05), border: Border.all(color: ApexTheme.success.withOpacity(0.2)), borderRadius: BorderRadius.circular(12)),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("AFTER", style: TextStyle(color: ApexTheme.success, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                                const SizedBox(height: 8),
                                _buildSmallMetric("Failure Risk", afterMetrics["failureRisk"], ApexTheme.success),
                                _buildSmallMetric("Time Saved", afterMetrics["timeSaved"], ApexTheme.success),
                                _buildSmallMetric("Est. Finish", afterMetrics["estimatedCompletion"], ApexTheme.success),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // PHASE 3: MISSION TIMELINE
                    const Text("EXECUTION TIMELINE", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    Column(
                      children: timelineSteps.map((step) {
                        final isCompleted = currentStep > step["id"];
                        final isActive = currentStep == step["id"];
                        final isFuture = currentStep < step["id"];

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isCompleted ? ApexTheme.success : (isActive ? Colors.blueAccent : Colors.white10),
                                    width: 2
                                  ),
                                  color: isActive ? Colors.blueAccent.withOpacity(0.2) : Colors.transparent,
                                ),
                                child: isCompleted ? Icon(Icons.check, size: 12, color: ApexTheme.success) : null,
                              ),
                              const SizedBox(width: 16),
                              Text(
                                step["label"],
                                style: TextStyle(
                                  color: isCompleted ? Colors.white60 : (isActive ? Colors.blueAccent : Colors.white24),
                                  fontSize: 14,
                                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 32),

                    // SECONDARY CAPABILITIES (Agents)
                    const Text("SECONDARY CAPABILITIES", style: TextStyle(color: Colors.white54, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 100,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: agents.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 12),
                        itemBuilder: (context, index) {
                          final agent = agents[index];
                          return GestureDetector(
                            onTap: () {
                              if (_lockdownActive) return;
                              Navigator.push(context, MaterialPageRoute(
                                builder: (context) => AgentDetailScreen(agent: agent)
                              ));
                            },
                            child: Opacity(
                              opacity: _lockdownActive ? 0.3 : 1.0,
                              child: Container(
                                width: 100,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: ApexTheme.darkGray,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.white10),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(agent["icon"], color: agent["color"], size: 28),
                                    const SizedBox(height: 8),
                                    Text(agent["name"], style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                    const SizedBox(height: 2),
                                    Text(agent["desc"], style: const TextStyle(color: Colors.white54, fontSize: 10)),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
        // LOCKDOWN OVERLAY
        if (_lockdownActive)
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(0.85),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 64),
                    const SizedBox(height: 24),
                    const Text(
                      "DISTRACTION LOCKDOWN ACTIVE",
                      style: TextStyle(color: Colors.redAccent, fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      "Distraction Score: ${_sensorEngine.distractionScore}/100",
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 40),
                      child: Text(
                        "APEX has paused non-essential flows to help you return to focus.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white54, fontSize: 14),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 32),
                      child: TextField(
                        controller: _brainDumpController,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: "Get it out of your head...",
                          hintStyle: const TextStyle(color: Colors.white30),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.05),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.send, color: Colors.blueAccent, size: 20),
                            onPressed: () {
                              if (_brainDumpController.text.isNotEmpty) {
                                _ws.sendEvent("QUICK_CAPTURE", {"text": _brainDumpController.text});
                                _brainDumpController.clear();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text("Thought synced to workspace."), backgroundColor: Colors.blueAccent)
                                );
                              }
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent.withOpacity(0.2),
                        side: const BorderSide(color: Colors.blueAccent),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        _ws.sendEvent("HELP_REQUEST", {});
                        _sensorEngine.manualOverride();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Requesting Socratic Support..."), backgroundColor: Colors.blueAccent)
                        );
                      },
                      icon: const Icon(Icons.support_agent, color: Colors.white, size: 18),
                      label: const Text("I'M STUCK - HELP ME", style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 16),
                    TextButton(
                      onPressed: () {
                        _sensorEngine.manualOverride();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("FLOW RESTORED. Distraction Score: 0"), backgroundColor: ApexTheme.success)
                        );
                      },
                      child: const Text("MANUAL OVERRIDE", style: TextStyle(color: Colors.white54, fontSize: 12)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    ),
  ),
);
  }

  Widget _buildSmallMetric(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 9)),
          Text(value, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
        ],
      ),
    );
  }
}

class LiveSensorsWidget extends StatefulWidget {
  const LiveSensorsWidget({super.key});

  @override
  State<LiveSensorsWidget> createState() => _LiveSensorsWidgetState();
}

class _LiveSensorsWidgetState extends State<LiveSensorsWidget> {
  final _sensorEngine = SensorEngine();

  @override
  void initState() {
    super.initState();
    _sensorEngine.addListener(_onUpdate);
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _sensorEngine.removeListener(_onUpdate);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bool isHighStress = _sensorEngine.distractionScore > 50;
    
    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isHighStress ? Colors.redAccent.withOpacity(0.1) : Colors.blueAccent.withOpacity(0.05),
        border: Border.all(color: isHighStress ? Colors.redAccent.withOpacity(0.3) : Colors.blueAccent.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.sensors, size: 16, color: isHighStress ? Colors.redAccent : Colors.blueAccent),
              const SizedBox(width: 8),
              Text(
                "LIVE BIOMETRIC & BEHAVIORAL SENSORS",
                style: TextStyle(color: isHighStress ? Colors.redAccent : Colors.blueAccent, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
              ),
              const Spacer(),
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isHighStress ? Colors.redAccent : Colors.blueAccent,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text("ACCELEROMETER", style: const TextStyle(color: Colors.white54, fontSize: 9, letterSpacing: 1.0)),
          Text("X: ${_sensorEngine.accelX.toStringAsFixed(2)}  Y: ${_sensorEngine.accelY.toStringAsFixed(2)}  Z: ${_sensorEngine.accelZ.toStringAsFixed(2)}", style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace')),
          const SizedBox(height: 8),
          Text("GYROSCOPE", style: const TextStyle(color: Colors.white54, fontSize: 9, letterSpacing: 1.0)),
          Text("X: ${_sensorEngine.gyroX.toStringAsFixed(2)}  Y: ${_sensorEngine.gyroY.toStringAsFixed(2)}  Z: ${_sensorEngine.gyroZ.toStringAsFixed(2)}", style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace')),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Distraction Score", style: TextStyle(color: Colors.white54, fontSize: 9)),
                  Text("${_sensorEngine.distractionScore}/100", style: TextStyle(color: isHighStress ? Colors.redAccent : Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text("Flow Confidence", style: TextStyle(color: Colors.white54, fontSize: 9)),
                  Text("${_sensorEngine.flowConfidence}%", style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Context Switches", style: TextStyle(color: Colors.white54, fontSize: 9)),
                  Text("${_sensorEngine.backgroundTransitions}", style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text("Touch Bursts", style: TextStyle(color: Colors.white54, fontSize: 9)),
                  Text("${_sensorEngine.touchBurstCount}", style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }
}
