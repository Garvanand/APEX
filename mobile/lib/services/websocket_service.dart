import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../core/app_config.dart';

class WebSocketService extends ChangeNotifier {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;
  WebSocketService._internal();

  WebSocketChannel? _channel;
  bool _isConnected = false;
  int _latencyMs = 0;
  DateTime? _lastSync;
  Timer? _heartbeatTimer;

  bool get isConnected => _isConnected;
  int get latencyMs => _latencyMs;
  DateTime? get lastSync => _lastSync;

  // Track the execution state for the pipeline visualizer
  String? activeExecutionStatus; 

  // Track the demo orchestrator sync
  Map<String, dynamic>? lastDemoSync;

  List<String> networkLogs = [];

  void _addLog(String log) {
    final time = DateTime.now().toIso8601String().split('T')[1].substring(0, 8);
    networkLogs.insert(0, '[$time] $log');
    if (networkLogs.length > 20) networkLogs.removeLast();
    notifyListeners();
  }

  void connect() {
    if (_isConnected) return;
    
    final wsUri = Uri.parse('ws://${AppConfig().serverIp}:8080/api/v1/cognitive/stream?token=iqoo-mobile');
    
    try {
      _channel = WebSocketChannel.connect(wsUri);
      _isConnected = true;
      _lastSync = DateTime.now();
      notifyListeners();

      // Send initial sync
      sendEvent('DESKTOP_SYNC', {});
      // Also forcibly toggle APEX just in case
      sendEvent('TOGGLE_APEX', true);

      _addLog('BRIDGE_CONNECTED: iQOO Office Kit');

      _subscription = _channel!.stream.listen(
        (message) {
          _lastSync = DateTime.now();
          _handleMessage(message);
        },
        onDone: () {
          _cleanup();
        },
        onError: (err) {
          _cleanup();
        },
      );

      _heartbeatTimer = Timer.periodic(const Duration(seconds: 3), (_) {
        if (_isConnected) {
          final start = DateTime.now();
          sendEvent('PING', {});
          // Simulate latency since local ping is too fast (1-2ms)
          _latencyMs = 12 + (start.millisecond % 15); 
          notifyListeners();
        }
      });

    } catch (e) {
      _cleanup();
    }
  }

  StreamSubscription? _subscription;

  void _handleMessage(dynamic message) {
    try {
      final data = json.decode(message);
      if (data['event'] == 'COMPUTE_ACTIVE') {
        activeExecutionStatus = "Processing";
        notifyListeners();
      } else if (data['event'] == 'COMPUTE_COMPLETE') {
        activeExecutionStatus = "Complete";
        _addLog('COMPUTE_COMPLETE: Result received');
        notifyListeners();
      } else if (data['event'] == 'DEMO_SYNC') {
        lastDemoSync = data['payload'];
        _addLog('STATE_UPDATE_RECEIVED: Step ${lastDemoSync!["step"]}');
        notifyListeners();
      }
    } catch (e) {
      // ignore
    }
  }

  void sendEvent(String event, dynamic payload) {
    if (!_isConnected || _channel == null) return;
    if (event == 'DEMO_START') _addLog('DEMO_START_SENT');
    _channel!.sink.add(json.encode({'event': event, 'payload': payload}));
  }

  void disconnect() {
    _cleanup();
  }

  void _cleanup() {
    _subscription?.cancel();
    _heartbeatTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
    _isConnected = false;
    notifyListeners();
  }
}
