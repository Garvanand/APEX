import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/websocket_service.dart';

class ApexPulsePage extends StatefulWidget {
  const ApexPulsePage({super.key});

  @override
  State<ApexPulsePage> createState() => _ApexPulsePageState();
}

class _ApexPulsePageState extends State<ApexPulsePage> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(begin: 0.98, end: 1.02).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final wsService = context.watch<WebSocketService>();
    final confidence = (wsService.confidenceScore * 100).round();
    final stateStr = wsService.cognitiveState.toUpperCase();

    // Determine colors
    final isFlow = stateStr == 'FLOW';
    final accentColor = isFlow ? const Color(0xFFFFD400) : const Color(0xFFFFFFFF);

    return Scaffold(
      backgroundColor: const Color(0xFF000000),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header ──
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'APEX',
                    style: TextStyle(
                      color: Color(0xFF444444),
                      fontWeight: FontWeight.w800,
                      letterSpacing: 4.0,
                      fontSize: 12,
                    ),
                  ),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: wsService.isConnected ? const Color(0xFFFFD400) : Colors.red,
                      shape: BoxShape.circle,
                    ),
                  )
                ],
              ),
              
              const Spacer(flex: 2),

              // ── Core State ──
              AnimatedBuilder(
                animation: _scaleAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: isFlow ? _scaleAnimation.value : 1.0,
                    child: child,
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stateStr,
                      style: TextStyle(
                        color: accentColor,
                        fontSize: 64,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -2.0,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '$confidence%',
                      style: TextStyle(
                        color: accentColor.withOpacity(0.5),
                        fontSize: 48,
                        fontWeight: FontWeight.w300,
                        letterSpacing: -1.5,
                        height: 1.0,
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 3),

              // ── Context ──
              _buildDataRow('OBJECTIVE', 'Compiler Construction', accentColor),
              const SizedBox(height: 32),
              _buildDataRow('WORKSPACE', 'Deep Work Locked', accentColor),
              const SizedBox(height: 32),
              _buildDataRow('REMAINING', '38m', accentColor),

              const Spacer(flex: 2),

              // ── Last Intervention ──
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0A0A),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF1A1A1A)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.bolt, color: accentColor, size: 24),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'RECENT ACTION',
                            style: TextStyle(
                              color: Color(0xFF666666),
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isFlow ? 'Workspace optimized for flow.' : 'Closed 20 tabs to reduce cognitive load.',
                            style: const TextStyle(
                              color: Color(0xFFFFFFFF),
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDataRow(String label, String value, Color accentColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF444444),
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 2.0,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFFE0E0E0),
            fontSize: 24,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }
}
