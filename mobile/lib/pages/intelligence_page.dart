import 'package:flutter/material.dart';
import '../services/websocket_service.dart';

class IntelligencePage extends StatelessWidget {
  const IntelligencePage({super.key});

  @override
  Widget build(BuildContext context) {
    final wsService = WebSocketService();
    final isFlow = wsService.activeCognitiveState.toUpperCase() == 'FLOW';
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
                'INTELLIGENCE',
                style: TextStyle(
                  color: Color(0xFF444444),
                  fontWeight: FontWeight.w800,
                  letterSpacing: 4.0,
                  fontSize: 12,
                ),
              ),
              
              const SizedBox(height: 48),

              // ── Top Level Insight ──
              Text(
                isFlow ? 'SYSTEM ALIGNED' : 'SYSTEM ADAPTING',
                style: TextStyle(
                  color: accentColor,
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -1.0,
                  height: 1.0,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Continuous biometrics are stable.',
                style: TextStyle(
                  color: Color(0xFF888888),
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  letterSpacing: -0.5,
                  height: 1.2,
                ),
              ),

              const SizedBox(height: 48),

              // ── Agent Actions Log ──
              const Text(
                'AUTONOMOUS ACTIONS',
                style: TextStyle(
                  color: Color(0xFF444444),
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.0,
                ),
              ),
              const SizedBox(height: 24),
              
              Expanded(
                child: ListView(
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildLogItem('STATE AGENT', 'Flow state locked. Notifications suppressed.', accentColor),
                    _buildLogItem('ENVIRONMENT SCULPTOR', 'Closed 20 inactive tabs to free memory.', const Color(0xFF888888)),
                    _buildLogItem('PEER RADAR', 'Synthesized 4 Discord messages into 1 insight.', const Color(0xFF888888)),
                    _buildLogItem('DEADLINE SENTINEL', 'Calculated 89% risk for Compiler project.', const Color(0xFF888888)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogItem(String agent, String action, Color iconColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 32.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 4),
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.5),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  agent,
                  style: const TextStyle(
                    color: Color(0xFF444444),
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  action,
                  style: const TextStyle(
                    color: Color(0xFFE0E0E0),
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
