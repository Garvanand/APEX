import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/websocket_service.dart';
import '../models/cognitive_state.dart';

class FocusPage extends StatefulWidget {
  const FocusPage({super.key});

  @override
  State<FocusPage> createState() => _FocusPageState();
}

class _FocusPageState extends State<FocusPage> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _exitHoldController;
  
  Timer? _countdownTimer;
  int _secondsRemaining = 2700; // 45:00
  bool _isActive = true;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 4000),
    )..repeat(reverse: true);

    _exitHoldController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );

    _exitHoldController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _exitFocusSession();
      }
    });

    _startTimer();
  }

  void _startTimer() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        if (mounted) {
          setState(() {
            _secondsRemaining--;
          });
        }
      } else {
        _exitFocusSession();
      }
    });
  }

  void _exitFocusSession() {
    _countdownTimer?.cancel();
    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _pulseController.dispose();
    _exitHoldController.dispose();
    super.dispose();
  }

  String _formatTime(int totalSeconds) {
    int minutes = totalSeconds ~/ 60;
    int seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final wsService = Provider.of<WebSocketService>(context);
    final displayedState = wsService.currentState?.state ?? 'Flow';

    // Ease breathing rate dynamically based on state
    if (displayedState == 'Overloaded') {
      _pulseController.duration = const Duration(milliseconds: 2000);
    } else if (displayedState == 'Fatigued') {
      _pulseController.duration = const Duration(milliseconds: 6000);
    } else {
      _pulseController.duration = const Duration(milliseconds: 4000);
    }

    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: SafeArea(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Centered Breathing Background Vector
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                double scale = 0.85 + _pulseController.value * 0.25;
                double opacity = 0.03 + _pulseController.value * 0.08;
                return Container(
                  width: 320 * scale,
                  height: 320 * scale,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFFFFD400).withOpacity(opacity),
                        const Color(0xFFFFD400).withOpacity(0.0),
                      ],
                    ),
                  ),
                );
              },
            ),

            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text(
                  "DEEP FLOW WORKSPACE",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFA5A5A5),
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 24),
                // Core Timer Countdown text
                Text(
                  _formatTime(_secondsRemaining),
                  style: const TextStyle(
                    fontFamily: 'Cabinet Grotesk',
                    fontSize: 72,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFFFD400),
                    letterSpacing: -1.0,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "CS301 COMPILER LAB 3",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.white.withOpacity(0.8),
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "DND Stream active  •  Device Handover Linked",
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 11,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),

            // Hold-to-Exit emergency control button
            Positioned(
              bottom: 48,
              child: Column(
                children: [
                  GestureDetector(
                    onTapDown: (_) {
                      _exitHoldController.forward();
                    },
                    onTapUp: (_) {
                      if (_exitHoldController.status != AnimationStatus.completed) {
                        _exitHoldController.reverse();
                      }
                    },
                    onTapCancel: () {
                      _exitHoldController.reverse();
                    },
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Radial progress frame border
                        SizedBox(
                          width: 72,
                          height: 72,
                          child: AnimatedBuilder(
                            animation: _exitHoldController,
                            builder: (context, child) {
                              return CircularProgressIndicator(
                                value: _exitHoldController.value,
                                strokeWidth: 2,
                                backgroundColor: const Color(0xFF1F1F1F),
                                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFF4D4F)),
                              );
                            },
                          ),
                        ),
                        Container(
                          width: 56,
                          height: 56,
                          decoration: const BoxDecoration(
                            color: Color(0xFF121212),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            color: Color(0xFFFF4D4F),
                            size: 24,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "HOLD TO EXIT FOCUS",
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFFF4D4F),
                      letterSpacing: 1.0,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
