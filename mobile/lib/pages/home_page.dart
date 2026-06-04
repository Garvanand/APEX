import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/cognitive_state.dart';
import '../services/websocket_service.dart';
import 'cognitive_dashboard_page.dart';
import 'focus_page.dart';
import 'voice_capture_page.dart';
import 'agent_page.dart';
import 'emergency_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // Biometric telemetry variables
  double _heartRate = 72.0;
  double _hrv = 54.0;
  int _blinkRate = 12;
  String _activeApp = 'VS Code';
  double _ambientDb = 36.0;
  
  String _simulatedState = 'Flow';
  Timer? _telemetryTimer;
  final math.Random _random = math.Random();

  final List<Map<String, dynamic>> _tasks = [
    {
      "title": "Compiler Project 3",
      "risk": "78% risk",
      "template": "Development Template",
      "isCritical": true,
    },
    {
      "title": "Machine Learning Lab 4",
      "risk": "12% risk",
      "template": "Analytics Template",
      "isCritical": false,
    }
  ];

  @override
  void initState() {
    super.initState();
    // Simulate real-time sensor ingestion updates
    _telemetryTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (!mounted) return;
      setState(() {
        if (_simulatedState == 'Flow') {
          _heartRate = 65 + _random.nextDouble() * 8;
          _hrv = 60 + _random.nextDouble() * 10;
          _blinkRate = 10 + _random.nextInt(3);
          _ambientDb = 30 + _random.nextDouble() * 4;
        } else if (_simulatedState == 'Distracted') {
          _heartRate = 74 + _random.nextDouble() * 10;
          _hrv = 42 + _random.nextDouble() * 8;
          _blinkRate = 15 + _random.nextInt(4);
          _ambientDb = 45 + _random.nextDouble() * 6;
        } else if (_simulatedState == 'Fatigued') {
          _heartRate = 58 + _random.nextDouble() * 6;
          _hrv = 34 + _random.nextDouble() * 8;
          _blinkRate = 7 + _random.nextInt(3);
          _ambientDb = 32 + _random.nextDouble() * 4;
        } else { // Overloaded
          _heartRate = 90 + _random.nextDouble() * 15;
          _hrv = 22 + _random.nextDouble() * 8;
          _blinkRate = 13 + _random.nextInt(4);
          _ambientDb = 55 + _random.nextDouble() * 8;
        }
      });

      final wsService = Provider.of<WebSocketService>(context, listen: false);
      if (wsService.isConnected) {
        wsService.sendTelemetry(TelemetrySignals(
          heartRate: _heartRate,
          hrv: _hrv,
          blinkRatePerMin: _blinkRate,
          screenInteractionDensity: 0.65,
          activeApplication: _activeApp,
          ambientNoiseDb: _ambientDb,
          timestamp: DateTime.now(),
        ));
      }
    });
  }

  @override
  void dispose() {
    _telemetryTimer?.cancel();
    super.dispose();
  }

  Color _getStateColor(String state) {
    switch (state) {
      case 'Flow':
        return const Color(0xFF00D26A);
      case 'Distracted':
        return const Color(0xFFFFB800);
      case 'Fatigued':
        return const Color(0xFF00A3FF);
      case 'Overloaded':
        return const Color(0xFFFF4D4F);
      default:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    final wsService = Provider.of<WebSocketService>(context);
    final displayedState = wsService.currentState?.state ?? _simulatedState;
    final confidence = wsService.currentState?.confidenceScore ?? 0.94;
    final stateColor = _getStateColor(displayedState);

    // Active state color for hero overlay
    Color heroBg = const Color(0xFF0A1C12);
    Color heroBorder = const Color(0xFF00D26A);
    if (displayedState == 'Distracted') {
      heroBg = const Color(0xFF1C180A);
      heroBorder = const Color(0xFFFFB800);
    } else if (displayedState == 'Fatigued') {
      heroBg = const Color(0xFF0A141C);
      heroBorder = const Color(0xFF00A3FF);
    } else if (displayedState == 'Overloaded') {
      heroBg = const Color(0xFF1F0D0E);
      heroBorder = const Color(0xFFFF4D4F);
    }

    return Scaffold(
      backgroundColor: const Color(0xFF000000), // AMOLED pure black background
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(48),
        child: SafeArea(
          child: Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Circular profile avatar
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF121212),
                    border: Border.all(color: const Color(0xFF2C2C2C)),
                  ),
                  child: const Center(
                    child: Icon(Icons.person_outline, size: 18, color: Colors.white),
                  ),
                ),
                // P2P link sync status badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF121212),
                    border: Border.all(color: const Color(0xFF2C2C2C)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Color(0xFF00D26A),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        "12ms latency",
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF00D26A),
                        ),
                      ),
                    ],
                  ),
                ),
                // Emergency Recovery button
                IconButton(
                  icon: const Icon(Icons.flash_on, color: Color(0xFFFFD400)),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const EmergencyPage()),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                // Cognitive State Hero Card (width 358px, height 200px)
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CognitiveDashboardPage()),
                    );
                  },
                  child: Container(
                    width: double.infinity,
                    height: 200,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: heroBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: heroBorder, width: 1.0),
                    ),
                    child: Stack(
                      children: [
                        // Spline curve representation in background
                        Positioned.fill(
                          child: CustomPaint(
                            painter: _MiniSparklinePainter(color: heroBorder),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  "${displayedState.toUpperCase()} ACTIVE",
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: heroBorder,
                                    letterSpacing: 1.0,
                                  ),
                                ),
                                Text(
                                  "CONFIDENCE: ${(confidence * 100).round()}%",
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 10,
                                    color: heroBorder.withOpacity(0.8),
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              "${(confidence * 100).round()}%",
                              style: const TextStyle(
                                fontFamily: 'Cabinet Grotesk',
                                fontSize: 48,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              displayedState == 'Flow'
                                  ? 'DND active. Redirection indicators standby.'
                                  : 'Autonomic controls executing de-escalation layouts.',
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 11,
                                color: Colors.white70,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Active task context cards
                const Text(
                  "ACTIVE TARGETS",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFA5A5A5),
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 12),

                // Task Stack
                Column(
                  children: List.generate(_tasks.length, (index) {
                    final item = _tasks[index];
                    final isCritical = item['isCritical'] as bool;
                    return Dismissible(
                      key: Key(item['title']),
                      direction: DismissDirection.endToStart,
                      background: Container(
                        alignment: Alignment.centerRight,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        color: const Color(0xFFFF4D4F),
                        child: const Icon(Icons.delete_outline, color: Colors.white),
                      ),
                      onDismissed: (direction) {
                        setState(() {
                          _tasks.removeAt(index);
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF121212),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: isCritical
                                ? const Color(0xFFFF4D4F).withOpacity(0.5)
                                : const Color(0xFF2C2C2C),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item['title'],
                                  style: const TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "${item['template']}  •  ${item['risk']}",
                                  style: const TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 11,
                                    color: Color(0xFFA5A5A5),
                                  ),
                                ),
                              ],
                            ),
                            Icon(
                              Icons.arrow_forward_ios,
                              size: 14,
                              color: isCritical ? const Color(0xFFFF4D4F) : const Color(0xFF2C2C2C),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),

                const SizedBox(height: 24),
                // Telemetry manual simulation selectors
                const Text(
                  "SIMULATE TELEMETRY OVERRIDES",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFA5A5A5),
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ['Flow', 'Distracted', 'Fatigued', 'Overloaded'].map((state) {
                    final active = _simulatedState == state;
                    final activeColor = _getStateColor(state);
                    return InkWell(
                      onTap: () {
                        setState(() {
                          _simulatedState = state;
                        });
                        // update telemetry on websocket
                        final wsService = Provider.of<WebSocketService>(context, listen: false);
                        if (wsService.isConnected) {
                          double hr = 65; double hrv = 60;
                          if (state == 'Distracted') { hr = 75; hrv = 45; }
                          else if (state == 'Fatigued') { hr = 58; hrv = 35; }
                          else if (state == 'Overloaded') { hr = 90; hrv = 22; }

                          wsService.sendTelemetry(TelemetrySignals(
                            heartRate: hr,
                            hrv: hrv,
                            blinkRatePerMin: 12,
                            screenInteractionDensity: 0.5,
                            activeApplication: "VS Code",
                            ambientNoiseDb: 35.0,
                            timestamp: DateTime.now(),
                          ));
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: active ? activeColor.withOpacity(0.1) : const Color(0xFF121212),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(
                            color: active ? activeColor : const Color(0xFF2C2C2C),
                          ),
                        ),
                        child: Text(
                          state,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: active ? activeColor : const Color(0xFFA5A5A5),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 100), // Spacing for floating footer
              ],
            ),
          ),
          
          // Floating overlay navigation footer bar (280px x 50px)
          Positioned(
            bottom: 24,
            left: (MediaQuery.of(context).size.width - 280) / 2,
            child: Container(
              width: 280,
              height: 50,
              decoration: BoxDecoration(
                color: const Color(0xFF121212),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(color: const Color(0xFF2C2C2C)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(
                    icon: const Icon(Icons.timer_outlined, color: Colors.white, size: 20),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const FocusPage()),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.mic_none_outlined, color: Colors.white, size: 20),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const VoiceCapturePage()),
                      );
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.radar_outlined, color: Colors.white, size: 20),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const AgentPage()),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniSparklinePainter extends CustomPainter {
  final Color color;

  _MiniSparklinePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    path.moveTo(0, size.height * 0.7);
    path.cubicTo(
      size.width * 0.25, size.height * 0.8,
      size.width * 0.5, size.height * 0.3,
      size.width * 0.75, size.height * 0.5,
    );
    path.lineTo(size.width, size.height * 0.4);

    final paint = Paint()
      ..color = color.withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _MiniSparklinePainter oldDelegate) => false;
}
