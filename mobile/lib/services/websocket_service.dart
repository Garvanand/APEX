import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../models/cognitive_state.dart';

class WebSocketService extends ChangeNotifier {
  WebSocketChannel? _channel;
  bool _isConnected = false;
  CognitiveStateData? _currentState;
  StreamSubscription? _subscription;

  bool get isConnected => _isConnected;
  CognitiveStateData? get currentState => _currentState;

  // Establish connection to host WebSocket
  void connect(String token) {
    if (_isConnected) return;
    
    // 10.0.2.2 points to localhost from Android Emulator
    final wsUri = Uri.parse('ws://10.0.2.2:8000/api/v1/cognitive/stream?token=$token');
    
    try {
      _channel = WebSocketChannel.connect(wsUri);
      _isConnected = true;
      notifyListeners();

      _subscription = _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onDone: () {
          _cleanup();
        },
        onError: (err) {
          print("WebSocket Error: $err");
          _cleanup();
        },
      );
    } catch (e) {
      print("WebSocket connection exception: $e");
      _cleanup();
    }
  }

  void _handleMessage(dynamic message) {
    try {
      final data = json.decode(message);
      if (data['event'] == 'COGNITIVE_STATE_DETERMINED') {
        _currentState = CognitiveStateData.fromMap(data['payload']);
        notifyListeners();
      }
    } catch (e) {
      print("Failed decoding websocket frame: $e");
    }
  }

  // Stream raw telemetry updates
  void sendTelemetry(TelemetrySignals signals) {
    if (!_isConnected || _channel == null) return;
    
    final payload = {
      'event': 'COGNITIVE_STATE_RAW',
      'payload': {
        'device_source': 'iqoo-mobile-companion',
        'heart_rate': signals.heartRate,
        'hrv': signals.hrv,
        'blink_rate_per_min': signals.blinkRatePerMin,
        'screen_interaction_density': signals.screenInteractionDensity,
        'active_application': signals.activeApplication,
        'ambient_noise_db': signals.ambientNoiseDb,
      }
    };
    
    _channel!.sink.add(json.encode(payload));
  }

  void disconnect() {
    _cleanup();
  }

  void _cleanup() {
    _subscription?.cancel();
    _channel?.sink.close();
    _channel = null;
    _isConnected = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _cleanup();
    super.dispose();
  }
}
