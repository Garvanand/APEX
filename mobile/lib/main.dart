import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'core/app_config.dart';
import 'services/websocket_service.dart';
import 'features/agent_hub/agent_hub_screen.dart';
import 'features/onboarding/qr_scanner_screen.dart';

void main() {
  runApp(const ApexCompanionApp());
}

class ApexCompanionApp extends StatelessWidget {
  const ApexCompanionApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'APEX Mobile',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        fontFamily: 'Roboto',
      ),
      home: const OnboardingScreen(),
    );
  }
}

// ==========================================
// SCREEN 1: ONBOARDING
// ==========================================
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              const Icon(Icons.blur_on, size: 64, color: Colors.white),
              const SizedBox(height: 32),
              const Text(
                "Why APEX Needs Sensors",
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, height: 1.1),
              ),
              const SizedBox(height: 24),
              Text(
                "APEX is a Cognitive Operating System. To adapt your digital environment in real-time, the mobile companion requires access to physical hardware sensors to accurately detect Flow, Distraction, and Fatigue states without manual input.",
                style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.7), height: 1.5),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const PermissionWizard())),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: const Center(
                    child: Text(
                      "CONTINUE",
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

// ==========================================
// SCREEN 2: PERMISSION WIZARD
// ==========================================
class PermissionWizard extends StatefulWidget {
  const PermissionWizard({super.key});
  @override
  State<PermissionWizard> createState() => _PermissionWizardState();
}

class _PermissionWizardState extends State<PermissionWizard> {
  bool activityGranted = false;
  bool notificationsGranted = false;
  bool motionGranted = false;
  bool batteryGranted = false;

  void _completePermissions() {
    if (kIsWeb) {
      if (Uri.base.host.isNotEmpty) {
        AppConfig().serverIp = Uri.base.host;
      }
      final ws = WebSocketService();
      ws.connect();
      ws.sendEvent('ACTIVATE_OFFICE_KIT', true);
      ws.sendEvent('TOGGLE_APEX', true);
      ws.sendEvent('DEVICE_PAIRED', {
        'device': 'iQOO Mobile Companion',
        'status': 'Connected',
        'ip': AppConfig().serverIp,
      });
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AgentHubScreen()));
    } else {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const QRScannerScreen()));
    }
  }

  Widget _buildPermissionCard(String title, String desc, IconData icon, bool granted, VoidCallback onTap) {
    return GestureDetector(
      onTap: () {
        setState(() => onTap());
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: granted ? const Color(0xFF2AD98F).withOpacity(0.1) : Colors.white.withOpacity(0.05),
          border: Border.all(color: granted ? const Color(0xFF2AD98F) : Colors.transparent),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, color: granted ? const Color(0xFF2AD98F) : Colors.white54),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text(desc, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                ],
              ),
            ),
            if (granted) const Icon(Icons.check_circle, color: Color(0xFF2AD98F)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    bool allGranted = activityGranted && notificationsGranted && motionGranted && batteryGranted;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              const Text("Sensor Initialization", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 32),
              
              _buildPermissionCard("Activity Recognition", "Detect typing cadence and interaction density.", Icons.touch_app, activityGranted, () => activityGranted = true),
              _buildPermissionCard("Notifications", "Read notification volume for distraction inference.", Icons.notifications, notificationsGranted, () => notificationsGranted = true),
              _buildPermissionCard("Motion Sensors", "Access Gyroscope and Accelerometer.", Icons.screen_rotation, motionGranted, () => motionGranted = true),
              _buildPermissionCard("Battery Exemption", "Allow background sensor sampling.", Icons.battery_charging_full, batteryGranted, () => batteryGranted = true),
              
              const Spacer(),
              GestureDetector(
                onTap: allGranted ? _completePermissions : null,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  decoration: BoxDecoration(
                    color: allGranted ? Colors.white : Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Center(
                    child: Text(
                      "ACTIVATE OFFICE KIT",
                      style: TextStyle(color: allGranted ? Colors.black : Colors.white54, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
