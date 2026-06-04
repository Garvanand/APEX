import 'package:flutter/material.dart';
import '../main.dart';

class PermissionsPage extends StatefulWidget {
  const PermissionsPage({super.key});

  @override
  State<PermissionsPage> createState() => _PermissionsPageState();
}

class _PermissionsPageState extends State<PermissionsPage> {
  bool _keystrokeAllowed = true;
  bool _notificationAllowed = true;
  bool _eyeGazeAllowed = false;
  bool _ambientAllowed = true;

  void _confirmPermissions() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
    );
  }

  void _skipAll() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const MainNavigationScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              const Text(
                "Telemetry Authorizations",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Cabinet Grotesk',
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Enable biometric capture sensors to calibrate real-time flow indices.",
                style: TextStyle(
                  fontSize: 14,
                  color: Color(0xFFA5A5A5),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 32),
              Expanded(
                child: ListView(
                  physics: const BouncingScrollPhysics(),
                  children: [
                    _buildPermissionItem(
                      title: "Keystroke Latency",
                      description: "Measures typing patterns and micro-hesitations to compute cognitive strain profiles.",
                      value: _keystrokeAllowed,
                      onChanged: (val) => setState(() => _keystrokeAllowed = val),
                    ),
                    const SizedBox(height: 16),
                    _buildPermissionItem(
                      title: "Notifications Override",
                      description: "Allows Socratic alerts and schedules silence thresholds dynamically during deep flow states.",
                      value: _notificationAllowed,
                      onChanged: (val) => setState(() => _notificationAllowed = val),
                    ),
                    const SizedBox(height: 16),
                    _buildPermissionItem(
                      title: "Camera Eye-Gaze Tracking",
                      description: "Calculates gaze fixation ratio to map visual attention metrics on external desktop windows.",
                      value: _eyeGazeAllowed,
                      onChanged: (val) => setState(() => _eyeGazeAllowed = val),
                      showWarning: !_eyeGazeAllowed,
                      warningText: "State Agent accuracy will decrease.",
                    ),
                    const SizedBox(height: 16),
                    _buildPermissionItem(
                      title: "Ambient Decibel Levels",
                      description: "Tracks background environment noises to isolate audit stress variables.",
                      value: _ambientAllowed,
                      onChanged: (val) => setState(() => _ambientAllowed = val),
                    ),
                  ],
                ),
              ),
              // Bottom controls
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: _skipAll,
                    child: const Text(
                      "SKIP ALL",
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFA5A5A5),
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF0A0A0A),
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    onPressed: _confirmPermissions,
                    child: const Text(
                      "CONFIRM",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPermissionItem({
    required String title,
    required String description,
    required bool value,
    required ValueChanged<bool> onChanged,
    bool showWarning = false,
    String? warningText,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        border: Border.all(
          color: showWarning ? const Color(0xFFFFB800).withOpacity(0.5) : const Color(0xFF2C2C2C),
        ),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              SwitchTheme(
                data: SwitchThemeData(
                  thumbColor: MaterialStateProperty.resolveWith((states) {
                    if (states.contains(MaterialState.selected)) {
                      return const Color(0xFFFFD400);
                    }
                    return const Color(0xFFA5A5A5);
                  }),
                  trackColor: MaterialStateProperty.resolveWith((states) {
                    if (states.contains(MaterialState.selected)) {
                      return const Color(0xFFFFD400).withOpacity(0.3);
                    }
                    return const Color(0xFF2C2C2C);
                  }),
                ),
                child: Switch(
                  value: value,
                  onChanged: onChanged,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            description,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFFA5A5A5),
              height: 1.4,
            ),
          ),
          if (showWarning && warningText != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFFB800).withOpacity(0.1),
                borderRadius: BorderRadius.circular(2),
                border: Border.all(
                  color: const Color(0xFFFFB800).withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    color: Color(0xFFFFB800),
                    size: 12,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    warningText,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFFFB800),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
