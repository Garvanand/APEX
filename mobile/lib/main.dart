import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme.dart';
import 'services/providers.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/pulse/pulse_screen.dart';
import 'features/directive/directive_screen.dart';
import 'features/intelligence/intelligence_screen.dart';
import 'widgets/apex_bottom_nav.dart';

void main() {
  runApp(
    const ProviderScope(
      child: ApexApp(),
    ),
  );
}

class ApexApp extends StatelessWidget {
  const ApexApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'APEX Companion',
      debugShowCheckedModeBanner: false,
      theme: ApexTheme.theme,
      home: const InitialRouter(),
    );
  }
}

class InitialRouter extends ConsumerWidget {
  const InitialRouter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPaired = ref.watch(isPairedProvider);

    if (!isPaired) {
      return OnboardingScreen(
        onComplete: () {
          // state changes in provider will trigger a rebuild here automatically
        },
      );
    }

    return const MainNavigationScreen();
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    PulseScreen(),
    DirectiveScreen(),
    IntelligenceScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: ApexBottomNav(
        currentIndex: _currentIndex,
        onTabSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
      ),
    );
  }
}
