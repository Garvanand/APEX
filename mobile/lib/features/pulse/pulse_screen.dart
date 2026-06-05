import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../services/providers.dart';

class PulseScreen extends ConsumerStatefulWidget {
  const PulseScreen({super.key});

  @override
  ConsumerState<PulseScreen> createState() => _PulseScreenState();
}

class _PulseScreenState extends ConsumerState<PulseScreen> with SingleTickerProviderStateMixin {
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
              // Header
              GestureDetector(
                onTap: () {
                  showModalBottomSheet(
                    context: context,
                    backgroundColor: ApexTheme.darkGray,
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                    ),
                    builder: (context) => const _PairingDashboardSheet(),
                  );
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'APEX',
                      style: TextStyle(
                        color: ApexTheme.textMuted,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 4.0,
                        fontSize: 12,
                      ),
                    ),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: isFlow ? ApexTheme.iqooYellow : Colors.red,
                        shape: BoxShape.circle,
                      ),
                    )
                  ],
                ),
              ),
              
              const Spacer(flex: 2),

              // Core State
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
                      state.status,
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: accentColor,
                        fontSize: 64,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${state.confidence}%',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: accentColor.withOpacity(0.5),
                        fontSize: 48,
                        fontWeight: FontWeight.w300,
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 3),

              // Context
              _buildDataRow('OBJECTIVE', state.currentObjective, accentColor),
              const SizedBox(height: 32),
              _buildDataRow('WORKSPACE', state.workspaceStatus, accentColor),
              const SizedBox(height: 32),
              _buildDataRow('REMAINING', '${state.minutesRemaining}m', accentColor),

              const Spacer(flex: 2),

              // Last Intervention
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: ApexTheme.darkGray,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: ApexTheme.borderGray),
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
                              color: ApexTheme.textSubtle,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 2.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isFlow ? 'Workspace optimized for flow.' : 'Analyzing ambient cognitive load.',
                            style: Theme.of(context).textTheme.bodyLarge,
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
          style: Theme.of(context).textTheme.labelSmall,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }
}

class _PairingDashboardSheet extends StatelessWidget {
  const _PairingDashboardSheet();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      height: 350,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'iQOO LINK',
            style: Theme.of(context).textTheme.labelSmall,
          ),
          const SizedBox(height: 32),
          _buildRow(Icons.check_circle, 'Status', 'Connected', ApexTheme.iqooYellow),
          const SizedBox(height: 24),
          _buildRow(Icons.wifi, 'Latency', '9ms', Colors.green),
          const SizedBox(height: 24),
          _buildRow(Icons.sync, 'Sync Status', 'Active', ApexTheme.textPrimary),
          const SizedBox(height: 24),
          _buildRow(Icons.history, 'Last Activity', 'Just now', ApexTheme.textSubtle),
        ],
      ),
    );
  }

  Widget _buildRow(IconData icon, String label, String value, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(width: 16),
        Text(
          label,
          style: const TextStyle(color: ApexTheme.textSubtle, fontSize: 16, fontWeight: FontWeight.w500),
        ),
        const Spacer(),
        Text(
          value,
          style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
