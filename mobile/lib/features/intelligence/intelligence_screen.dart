import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../services/providers.dart';

class IntelligenceScreen extends ConsumerWidget {
  const IntelligenceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(cognitiveStateProvider);
    final isFlow = state.status == 'FLOW';
    final accentColor = isFlow ? ApexTheme.iqooYellow : ApexTheme.textPrimary;
    final feed = ref.watch(intelligenceFeedProvider);

    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'INTELLIGENCE',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              
              const SizedBox(height: 48),

              // Top Level Insight
              Text(
                isFlow ? 'SYSTEM ALIGNED' : 'SYSTEM ADAPTING',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: accentColor,
                  fontSize: 36,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Continuous biometrics are stable.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: 16,
                  height: 1.2,
                ),
              ),

              const SizedBox(height: 48),

              // Agent Actions Log
              Text(
                'AUTONOMOUS ACTIONS',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const SizedBox(height: 24),
              
              Expanded(
                child: ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  itemCount: feed.length,
                  itemBuilder: (context, index) {
                    final item = feed[index];
                    return _buildLogItem(
                      context,
                      item.agentName,
                      item.description,
                      item.isHighlight ? accentColor : ApexTheme.textSubtle,
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogItem(BuildContext context, String agent, String action, Color iconColor) {
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
                  style: Theme.of(context).textTheme.labelSmall,
                ),
                const SizedBox(height: 4),
                Text(
                  action,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    fontSize: 16,
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
