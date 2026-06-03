import 'dart:async';
import 'package:flutter/material.dart';

class FocusPage extends StatefulWidget {
  const FocusPage({super.key});

  @override
  State<FocusPage> createState() => _FocusPageState();
}

class _FocusPageState extends State<FocusPage> with SingleTickerProviderStateMixin {
  late AnimationController _breathingController;
  late Animation<double> _breathingAnimation;
  
  Timer? _countdownTimer;
  int _secondsLeft = 1500; // 25-minute Pomodoro

  @override
  void initState() {
    super.initState();
    
    // Guided breathing animation (4-second inhale, 4-second exhale)
    _breathingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _breathingController.reverse();
        } else if (status == AnimationStatus.dismissed) {
          _breathingController.forward();
        }
      });

    _breathingAnimation = Tween<double>(begin: 1.0, end: 1.4).animate(
      CurvedAnimation(
        parent: _breathingController,
        curve: Curves.easeInOut,
      ),
    );

    _breathingController.forward();

    // Timer countdown
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          if (_secondsLeft > 0) {
            _secondsLeft--;
          } else {
            _countdownTimer?.cancel();
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _breathingController.dispose();
    _countdownTimer?.cancel();
    super.dispose();
  }

  String _formatDuration(int totalSecs) {
    int m = totalSecs ~/ 60;
    int s = totalSecs % 60;
    return '${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Focus Session', style: TextStyle(color: Colors.white, fontSize: 16)),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              _formatDuration(_secondsLeft),
              style: const TextStyle(
                fontSize: 54, 
                fontWeight: FontWeight.bold, 
                color: Colors.white,
                fontFamily: 'Courier',
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'KEEP FOCUS • ALERTS MUTED',
              style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 60),
            
            // Breathing animation container
            AnimatedBuilder(
              animation: _breathingAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _breathingAnimation.value,
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF00D26A).withOpacity(0.15),
                      border: BorderSide(
                        color: const Color(0xFF00D26A).withOpacity(0.5),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00D26A).withOpacity(0.3),
                          blurRadius: 20 * _breathingAnimation.value,
                          spreadRadius: 2,
                        )
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'BREATHE',
                        style: TextStyle(
                          color: Color(0xFF00D26A),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 80),
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('End Focus Session', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }
}
