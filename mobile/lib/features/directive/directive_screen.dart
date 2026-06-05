import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../services/providers.dart';

class DirectiveScreen extends ConsumerWidget {
  const DirectiveScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(cognitiveStateProvider);
    final isFlow = state.status == 'FLOW';
    final accentColor = isFlow ? ApexTheme.iqooYellow : ApexTheme.textPrimary;

    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'DIRECTIVE',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              
              const Spacer(flex: 1),

              // Primary Action
              Text(
                'CONTINUE',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(
                  color: accentColor,
                  fontSize: 56,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'No manual intervention required.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: 20,
                  height: 1.2,
                ),
              ),

              const Spacer(flex: 2),

              // Current Priority
              Text(
                'PRIORITY TARGET',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: ApexTheme.darkGray,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: ApexTheme.borderGray),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      state.currentObjective,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontSize: 24,
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
                        Text(
                          'Due in ${state.minutesRemaining}m',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
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
