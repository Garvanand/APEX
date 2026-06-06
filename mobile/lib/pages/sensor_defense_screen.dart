import 'dart:async';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';
import '../core/theme.dart';

class SensorDefenseScreen extends StatefulWidget {
  const SensorDefenseScreen({super.key});

  @override
  State<SensorDefenseScreen> createState() => _SensorDefenseScreenState();
}

class _SensorDefenseScreenState extends State<SensorDefenseScreen> {
  List<double>? _accelerometerValues;
  List<double>? _gyroscopeValues;
  final _streamSubscriptions = <StreamSubscription<dynamic>>[];

  @override
  void initState() {
    super.initState();
    _streamSubscriptions.add(
      accelerometerEventStream().listen(
        (AccelerometerEvent event) {
          if (mounted) {
            setState(() {
              _accelerometerValues = <double>[event.x, event.y, event.z];
            });
          }
        },
        onError: (e) {
          showDialog(
              context: context,
              builder: (context) {
                return const AlertDialog(
                  title: Text("Sensor Not Found"),
                  content: Text("It seems that your device doesn't support Accelerometer Sensor"),
                );
              });
        },
        cancelOnError: true,
      ),
    );
    _streamSubscriptions.add(
      gyroscopeEventStream().listen(
        (GyroscopeEvent event) {
          if (mounted) {
            setState(() {
              _gyroscopeValues = <double>[event.x, event.y, event.z];
            });
          }
        },
        onError: (e) {
          showDialog(
              context: context,
              builder: (context) {
                return const AlertDialog(
                  title: Text("Sensor Not Found"),
                  content: Text("It seems that your device doesn't support Gyroscope Sensor"),
                );
              });
        },
        cancelOnError: true,
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
    for (final subscription in _streamSubscriptions) {
      subscription.cancel();
    }
  }

  @override
  Widget build(BuildContext context) {
    final accelerometer = _accelerometerValues?.map((double v) => v.toStringAsFixed(1)).toList();
    final gyroscope = _gyroscopeValues?.map((double v) => v.toStringAsFixed(1)).toList();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text("Why APEX Knows This", style: TextStyle(fontFamily: 'monospace', color: ApexTheme.iqooYellow)),
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: ApexTheme.iqooYellow),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildInfoCard(
            title: "Motion Signals (Real-time)",
            icon: Icons.vibration,
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Accelerometer (X, Y, Z): ${accelerometer ?? '[0.0, 0.0, 0.0]'} m/s²", style: const TextStyle(color: Colors.white70, fontFamily: 'monospace')),
                const SizedBox(height: 8),
                Text("Gyroscope (X, Y, Z): ${gyroscope ?? '[0.0, 0.0, 0.0]'} rad/s", style: const TextStyle(color: Colors.white70, fontFamily: 'monospace')),
                const SizedBox(height: 12),
                const Text("APEX uses micro-tremors in your grip to detect physiological stress and cognitive load.", style: TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            title: "Touch Behavior",
            icon: Icons.touch_app,
            content: const Text("Capacitive pressure and swipe velocity are measured to determine urgency and frustration levels. High velocity taps correlate with deadline mode.", style: TextStyle(color: Colors.white54, fontSize: 12)),
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            title: "Attention Stability",
            icon: Icons.remove_red_eye,
            content: const Text("By combining screen-on time, app switching frequency, and ambient light shifts, APEX determines if your attention is fracturing.", style: TextStyle(color: Colors.white54, fontSize: 12)),
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            title: "Notification Pressure",
            icon: Icons.notifications_active,
            content: const Text("APEX monitors the inbound velocity of notifications. A high burst rate triggers the Office Kit to automatically shield you in Deep Flow.", style: TextStyle(color: Colors.white54, fontSize: 12)),
          ),
          const SizedBox(height: 32),
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                border: Border.all(color: ApexTheme.iqooYellow.withOpacity(0.5)),
                borderRadius: BorderRadius.circular(20),
                color: ApexTheme.iqooYellow.withOpacity(0.1),
              ),
              child: const Text("INTELLIGENCE LAYER: iQOO 13", style: TextStyle(color: ApexTheme.iqooYellow, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildInfoCard({required String title, required IconData icon, required Widget content}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: ApexTheme.iqooYellow, size: 20),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 12),
          content,
        ],
      ),
    );
  }
}
