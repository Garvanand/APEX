import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/websocket_service.dart';

class DirectivePage extends StatelessWidget {
  const DirectivePage({super.key});

  @override
  Widget build(BuildContext context) {
    final wsService = context.watch<WebSocketService>();
    final isFlow = wsService.cognitiveState.toUpperCase() == 'FLOW';
    final accentColor = isFlow ? const Color(0xFFFFD400) : const Color(0xFFFFFFFF);

    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'DIRECTIVE',
                style: TextStyle(
                  color: Color(0xFF444444),
                  fontWeight: FontWeight.w800,
                  letterSpacing: 4.0,
                  fontSize: 12,
                ),
              ),
              
              const Spacer(flex: 1),

              // ── Primary Action ──
              Text(
                'CONTINUE',
                style: TextStyle(
                  color: accentColor,
                  fontSize: 56,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -2.0,
                  height: 1.0,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'No manual intervention required.',
                style: TextStyle(
                  color: Color(0xFF888888),
                  fontSize: 20,
                  fontWeight: FontWeight.w400,
                  letterSpacing: -0.5,
                  height: 1.2,
                ),
              ),

              const Spacer(flex: 2),

              // ── Current Priority ──
              const Text(
                'PRIORITY TARGET',
                style: TextStyle(
                  color: Color(0xFF444444),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.0,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0A0A),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF1A1A1A)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Compiler Construction',
                      style: TextStyle(
                        color: Color(0xFFFFFFFF),
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'URGENT',
                            style: TextStyle(
                              color: Colors.red,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Due in 38m',
                          style: TextStyle(
                            color: Color(0xFF888888),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 3),
            ],
          ),
        ),
      ),
    );
  }
}
