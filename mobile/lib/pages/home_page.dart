import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/cognitive_state.dart';
import '../services/websocket_service.dart';
import 'focus_page.dart';
import 'agent_page.dart';
import 'emergency_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  // Simulator Telemetry States
  double _heartRate = 72.0;
  double _hrv = 54.0;
  int _blinkRate = 12;
  String _activeApp = 'VS Code';
  double _ambientDb = 36.0;
  
  String _manualState = 'Flow';
  Timer? _telemetryTimer;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    // Periodically update mock biometrics and publish over WebSockets
    _telemetryTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      setState(() {
        if (_manualState == 'Flow') {
          _heartRate = 65 + _random.nextDouble() * 10;
          _hrv = 50 + _random.nextDouble() * 15;
          _blinkRate = 10 + _random.nextInt(5);
          _ambientDb = 30 + _random.nextDouble() * 8;
        } else if (_manualState == 'Distracted') {
          _heartRate = 70 + _random.nextDouble() * 12;
          _hrv = 40 + _random.nextDouble() * 10;
          _blinkRate = 14 + _random.nextInt(8);
        } else if (_manualState == 'Fatigued') {
          _heartRate = 60 + _random.nextDouble() * 8;
          _hrv = 30 + _random.nextDouble() * 12;
          _blinkRate = 8 + _random.nextInt(6);
        } else { // Overloaded
          _heartRate = 85 + _random.nextDouble() * 20;
          _hrv = 20 + _random.nextDouble() * 15;
          _blinkRate = 12 + _random.nextInt(6);
        }
      });

      // Stream to server if connected
      final wsService = Provider.of<WebSocketService>(context, listen: false);
      if (wsService.isConnected) {
        wsService.sendTelemetry(TelemetrySignals(
          heartRate: _heartRate,
          hrv: _hrv,
          blinkRatePerMin: _blinkRate,
          screenInteractionDensity: 0.65,
          activeApplication: _activeApp,
          ambientNoiseDb: _ambientDb,
          timestamp: DateTime.now(),
        ));
      }
    });
  }

  @override
  void dispose() {
    _telemetryTimer?.cancel();
    super.dispose();
  }

  Color _getStateColor(String state) {
    switch (state) {
      case 'Flow':
        return const Color(0xFF00D26A);
      case 'Distracted':
        return const Color(0xFFFFB800);
      case 'Fatigued':
        return const Color(0xFF007AFF);
      case 'Overloaded':
        return const Color(0xFFFF4D4F);
      default:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    final wsService = Provider.of<WebSocketService>(context);
    final displayedState = wsService.currentState?.state ?? _manualState;
    final confidence = wsService.currentState?.confidenceScore ?? 0.92;
    
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: wsService.isConnected ? const Color(0xFF00D26A) : Colors.red,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: wsService.isConnected ? const Color(0xFF00D26A) : Colors.red,
                    blurRadius: 6,
                  )
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              wsService.isConnected ? 'iQOO Link Connected' : 'Simulated Sandbox',
              style: const TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on, color: Color(0xFFFFD400)),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const EmergencyPage()),
              );
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'APEX Core Companion',
              style: TextStyle(
                fontSize: 24, 
                fontWeight: FontWeight.bold, 
                color: Colors.white
              ),
            ),
            const SizedBox(height: 16),
            
            // Hero State Card
            Card(
              color: const Color(0xFF121212),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: _getStateColor(displayedState).withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Evaluated State',
                          style: TextStyle(color: Colors.grey[400], fontSize: 14),
                        ),
                        Text(
                          'Confidence: ${ (confidence * 100).round()}%',
                          style: const TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: _getStateColor(displayedState).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: BorderSide(
                          color: _getStateColor(displayedState).withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        '$displayedState STATE',
                        style: TextStyle(
                          color: _getStateColor(displayedState),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      displayedState == 'Flow'
                          ? 'DND active on phone. Muting notification streams.'
                          : 'Sculptor recommendations are displayed on desktop.',
                      style: TextStyle(color: Colors.grey[300], fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            const Text(
              'Live Sensors',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 12),
            
            // Telemetry Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: [
                _buildSensorItem('Heart Rate', '${_heartRate.round()} BPM', Icons.favorite, Colors.red),
                _buildSensorItem('HRV', '${_hrv.round()} ms', Icons.timeline, Colors.green),
                _buildSensorItem('Blink Frequency', '$_blinkRate /min', Icons.remove_red_eye, Colors.blue),
                _buildSensorItem('Active Application', _activeApp, Icons.computer, Colors.purple),
              ],
            ),
            
            const SizedBox(height: 24),
            const Text(
              'Telemetry Sandbox Simulator',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 12),
            
            // Simulation Controls
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF121212),
                borderRadius: BorderRadius.circular(12),
                border: BorderSide(color: Colors.grey[900]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Override state simulation parameters',
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildSimButton('Flow'),
                      _buildSimButton('Distracted'),
                      _buildSimButton('Fatigued'),
                      _buildSimButton('Overloaded'),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFFD400),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    icon: const Icon(Icons.timer),
                    label: const Text('Start Focus Companion', style: TextStyle(fontWeight: FontWeight.bold)),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const FocusPage()),
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSensorItem(String label, String value, IconData icon, Color iconColor) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF121212),
        borderRadius: BorderRadius.circular(12),
        border: BorderSide(color: Colors.grey[900]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.w500)),
              Icon(icon, size: 16, color: iconColor),
            ],
          ),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildSimButton(String state) {
    final active = _manualState == state;
    return InkWell(
      onTap: () {
        setState(() {
          _manualState = state;
        });
        final wsService = Provider.of<WebSocketService>(context, listen: false);
        if (!wsService.isConnected) {
          loggerLog(state);
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: active ? _getStateColor(state).withOpacity(0.2) : const Color(0xFF1C1C1E),
          borderRadius: BorderRadius.circular(8),
          border: BorderSide(
            color: active ? _getStateColor(state) : Colors.grey[800]!,
            width: 1,
          ),
        ),
        child: Text(
          state,
          style: TextStyle(
            color: active ? _getStateColor(state) : Colors.white,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  void loggerLog(String state) {
    print("Simulator overridden: cognitive state set to $state");
  }
}
