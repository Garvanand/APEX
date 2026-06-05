import 'package:flutter/material.dart';
import '../../core/theme.dart';
import 'device_pairing_screen.dart';

class OnboardingScreen extends StatelessWidget {
  final VoidCallback onComplete;

  const OnboardingScreen({super.key, required this.onComplete});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ApexTheme.black,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'APEX',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const Spacer(),
              Text(
                'Cognitive Operating Layer.',
                style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 48),
              ),
              const SizedBox(height: 16),
              Text(
                'Your workspace, adapting to your mind in real-time.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 18, height: 1.3),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 64,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(
                        builder: (_) => DevicePairingScreen(onPaired: onComplete),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ApexTheme.iqooYellow,
                    foregroundColor: ApexTheme.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                  ),
                  child: const Text(
                    'INITIALIZE',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.5),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
