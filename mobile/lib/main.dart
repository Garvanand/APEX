import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'sensor_engine.dart';
import 'inference_engine.dart';
import 'pages/sensor_defense_screen.dart';
import 'core/theme.dart';
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
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const QRScannerScreen()));
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

// ==========================================
// SCREEN 3: MAIN DASHBOARD
// ==========================================
class MainDashboard extends StatefulWidget {
  const MainDashboard({super.key});
  @override
  State<MainDashboard> createState() => _MainDashboardState();
}

class _MainDashboardState extends State<MainDashboard> {
  late WebSocketChannel channel;
  List<String> syncLogs = [];
  List<String> interventions = [];
  String desktopWorkspace = "Connecting...";

  @override
  void initState() {
    super.initState();
    SensorEngine().start();
    _connectWebSocket();

    InferenceEngine().onStateChange.listen((state) {
      if (mounted) setState(() {});
      _sendStateToDesktop(state, InferenceEngine().flowConfidence);
    });

    SensorEngine().onSensorUpdate.listen((_) {
      if (mounted) setState(() {});
    });
  }

  void _connectWebSocket() {
    try {
      channel = WebSocketChannel.connect(Uri.parse('ws://192.168.31.2:8080'));
      channel.stream.listen((message) {
        try {
          final data = jsonDecode(message);
          if (data['event'] == 'DESKTOP_SYNC') {
            setState(() {
              desktopWorkspace = data['payload']['workspace'] ?? "Desktop Active";
            });
            _addLog("Desktop synced workspace: $desktopWorkspace");
          } else if (data['event'] == 'AGENT_ACTION') {
            setState(() {
              interventions.insert(0, data['payload']['action'] ?? "Unknown Action");
              if (interventions.length > 5) interventions.removeLast();
            });
          }
        } catch (e) {
          debugPrint("WS parse error: $e");
        }
      });
      _addLog("Office Kit Linked: 192.168.31.2");
    } catch (e) {
      _addLog("Office Kit Connection Failed");
    }
  }

  void _sendStateToDesktop(String state, int confidence) {
    _addLog("Phone -> Desktop: $state ($confidence%)");
    try {
      channel.sink.add(jsonEncode({
        "event": "STATE_TRANSITION",
        "payload": {
          "state": state,
          "confidence": confidence,
          "attention_stability": "Live",
          "focus_trend": "Monitoring",
          "cognitive_load": "Live Sensor Inference"
        }
      }));
    } catch (e) {
      debugPrint(e.toString());
    }
  }

  void _sendCommand(String command, dynamic data) {
    _addLog("Command Sent: $command");
    try {
      channel.sink.add(jsonEncode({
        "event": command,
        "payload": data
      }));
    } catch (e) {
      debugPrint("Send failed: $e");
    }
  }

  void _addLog(String log) {
    setState(() {
      syncLogs.insert(0, "[${DateTime.now().second}s] $log");
      if (syncLogs.length > 5) syncLogs.removeLast();
    });
  }

  @override
  void dispose() {
    SensorEngine().stop();
    channel.sink.close();
    super.dispose();
  }

  Color _getStateColor() {
    switch (InferenceEngine().currentState) {
      case "FLOW": return const Color(0xFF2AD98F);
      case "DISTRACTED": return const Color(0xFFE94A4A);
      case "FATIGUED": return const Color(0xFFFFB800);
      case "OVERLOADED": return const Color(0xFF9D4EDD);
      default: return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Listener( // Register touch interactions for inference
        onPointerDown: (_) => SensorEngine().registerTouch(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // SECTION 1: Current State
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    Text(
                      InferenceEngine().currentState,
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: _getStateColor(),
                        letterSpacing: 2,
                      ),
                    ),
                    Text(
                      "${InferenceEngine().flowConfidence}% CONFIDENCE",
                      style: const TextStyle(fontSize: 14, color: Colors.white54, letterSpacing: 2),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // SECTION 2: Live Sensors
              _buildSectionTitle("LIVE SENSORS"),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.03), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildMetric("MOTION", (SensorEngine().accelX.abs() + SensorEngine().accelY.abs() + SensorEngine().accelZ.abs()).toStringAsFixed(1)),
                    _buildMetric("TOUCH/S", SensorEngine().touchFrequency.toStringAsFixed(1)),
                    GestureDetector(
                      onTap: () => SensorEngine().simulateAppSwitch(),
                      child: _buildMetric("APP SWITCH", SensorEngine().fakeAppSwitches.toString()),
                    ),
                    GestureDetector(
                      onTap: () => SensorEngine().simulateNotification(),
                      child: _buildMetric("NOTIFS", SensorEngine().fakeNotificationCount.toString()),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // SECTION 3: Office Kit Sync
              _buildSectionTitle("OFFICE KIT ACTIVITY"),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding: const EdgeInsets.all(12),
                height: 100,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  border: Border.all(color: Colors.greenAccent.withOpacity(0.2)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ListView.builder(
                  itemCount: syncLogs.length,
                  itemBuilder: (context, index) {
                    return Text(syncLogs[index], style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.greenAccent));
                  },
                ),
              ),
              const SizedBox(height: 32),

              // SECTION 4: Workspace Awareness
              _buildSectionTitle("WORKSPACE AWARENESS"),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(border: Border(left: BorderSide(color: _getStateColor(), width: 4))),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("ACTIVE DESKTOP CONTEXT", style: TextStyle(fontSize: 10, color: Colors.white54)),
                    const SizedBox(height: 4),
                    Text(desktopWorkspace, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // SECTION 5: Intervention History
              _buildSectionTitle("INTERVENTION HISTORY"),
              interventions.isEmpty 
                  ? const Text("No recent interventions.", style: TextStyle(color: Colors.white38))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: interventions.map((i) => Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          children: [
                            const Icon(Icons.auto_awesome, size: 14, color: Colors.amber),
                            const SizedBox(width: 8),
                            Expanded(child: Text(i, style: const TextStyle(fontSize: 12))),
                          ],
                        ),
                      )).toList(),
                    ),
              const SizedBox(height: 32),

              // SECTION 6: Command Center (Hackathon Red Light Mode)
              _buildSectionTitle("COMMAND CENTER"),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _buildCommandButton("Run Hackathon Demo", Colors.greenAccent, () {
                    _sendCommand("DEMO_START", {});
                  }),
                  _buildCommandButton("Why APEX Knows This", ApexTheme.iqooYellow, () {
                    Navigator.push(context, MaterialPageRoute(builder: (context) => const SensorDefenseScreen()));
                  }),
                  _buildCommandButton("Mission Debrief", Colors.blueAccent, () {
                    _sendCommand("SHOW_DEBRIEF", {});
                  }),
                  _buildCommandButton("Toggle APEX", Colors.purpleAccent, () {
                    _sendCommand("TOGGLE_APEX", {});
                  }),
                ],
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 2, color: Colors.white38)),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontFamily: 'monospace', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 9, color: Colors.white38)),
      ],
    );
  }

  Widget _buildCommandButton(String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          border: Border.all(color: color.withOpacity(0.5)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
        ),
      ),
    );
  }
}
