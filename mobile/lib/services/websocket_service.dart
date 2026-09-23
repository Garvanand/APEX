import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../core/app_config.dart';
import '../models/cognitive_state.dart';

/// Connection states for the WebSocket lifecycle.
enum WsConnectionState {
  offline,
  connecting,
  connected,
  degraded,
  reconnecting,
}

/// Real-time cross-device event pipeline lifecycle stages
enum PipelineStage {
  idle,
  transmitting,
  relayReceived,
  desktopUpdated,
  sculptorExecuted,
  ackReceived,
}

class WebSocketService extends ChangeNotifier {
  static final WebSocketService _instance = WebSocketService._internal();
  factory WebSocketService() => _instance;
  WebSocketService._internal();

  WebSocketChannel? _channel;
  StreamSubscription? _subscription;

  // ── Connection State Machine ─────────────────────────
  WsConnectionState _connectionState = WsConnectionState.offline;
  WsConnectionState get connectionState => _connectionState;
  bool get isConnected => _connectionState == WsConnectionState.connected;

  // ── Pipeline Lifecycle ────────────────────────────────
  PipelineStage pipelineStage = PipelineStage.idle;
  String activeCognitiveState = "FLOW";
  String get cognitiveState => activeCognitiveState;
  double get confidenceScore => 0.94;
  CognitiveStateData? get currentState => CognitiveStateData(
    state: activeCognitiveState,
    confidenceScore: 0.94,
    updatedAt: DateTime.now(),
    contributingMetrics: ['motion', 'cadence', 'ambient'],
  );
  DateTime? lastHeartbeat;

  // ── Session Info (set by relay HANDSHAKE_ACK) ────────
  String? sessionId;
  String? deviceId;
  List<Map<String, dynamic>> connectedDevices = [];

  // ── Real Latency Measurement ─────────────────────────
  int _latencyMs = 0;
  int get latencyMs => _latencyMs;
  DateTime? _lastPingSent;
  DateTime? _lastSync;
  DateTime? get lastSync => _lastSync;
  DateTime? _lastAck;
  DateTime? get lastAck => _lastAck;
  String? _lastEventSent;
  String? get lastEventSent => _lastEventSent;
  String? _lastEventAcked;
  String? get lastEventAcked => _lastEventAcked;
  int _eventsAcked = 0;
  int get eventsAcked => _eventsAcked;

  // ── Heartbeat ────────────────────────────────────────
  Timer? _heartbeatTimer;
  int _missedHeartbeats = 0;

  // ── Reconnection ─────────────────────────────────────
  Timer? _reconnectTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectAttempts = 10;
  static const Duration _baseReconnectDelay = Duration(seconds: 1);

  // ── Execution/Demo State ─────────────────────────────
  String? activeExecutionStatus;
  Map<String, dynamic>? lastDemoSync;

  // ── Network Logs ─────────────────────────────────────
  List<String> networkLogs = [];

  void _addLog(String log) {
    final time = DateTime.now().toIso8601String().split('T')[1].substring(0, 8);
    networkLogs.insert(0, '[$time] $log');
    if (networkLogs.length > 30) networkLogs.removeLast();
    notifyListeners();
  }

  void _setWsConnectionState(WsConnectionState newState) {
    if (_connectionState != newState) {
      _connectionState = newState;
      _addLog('CONNECTION_STATE: ${newState.name.toUpperCase()}');
      notifyListeners();
    }
  }

  // ═══════════════════════════════════════════════════════
  // CONNECT
  // ═══════════════════════════════════════════════════════
  void connect() {
    if (_connectionState == WsConnectionState.connected ||
        _connectionState == WsConnectionState.connecting) {
      return;
    }

    _setWsConnectionState(WsConnectionState.connecting);
    _reconnectAttempts = 0;
    _attemptConnection();
  }

  void _attemptConnection() {
    final wsUri = Uri.parse(
        'ws://${AppConfig().serverIp}:8080/ws');

    try {
      _channel = WebSocketChannel.connect(wsUri);
      _addLog('WS_CONNECT_ATTEMPT: ${wsUri.toString()}');

      _subscription = _channel!.stream.listen(
        (message) {
          _lastSync = DateTime.now();
          _handleMessage(message);
        },
        onDone: () {
          _addLog('WS_CLOSED');
          _onDisconnect();
        },
        onError: (err) {
          _addLog('WS_ERROR: $err');
          _onDisconnect();
        },
      );

      // Send HANDSHAKE immediately
      _sendRaw({
        'event': 'HANDSHAKE',
        'payload': {
          'device_type': 'mobile',
          'device_name': 'APEX Mobile Companion',
          'platform': kIsWeb ? 'flutter_web' : 'flutter_native',
          'version': '1.0.0',
        }
      });

      // Timeout for handshake (5 seconds)
      Future.delayed(const Duration(seconds: 5), () {
        if (_connectionState == WsConnectionState.connecting) {
          _addLog('HANDSHAKE_TIMEOUT');
          _cleanup();
          _scheduleReconnect();
        }
      });
    } catch (e) {
      _addLog('WS_CONNECT_FAILED: $e');
      _scheduleReconnect();
    }
  }

  // ═══════════════════════════════════════════════════════
  // MESSAGE HANDLING
  // ═══════════════════════════════════════════════════════
  void _handleMessage(dynamic message) {
    try {
      final data = json.decode(message);
      final eventType = data['event'];

      switch (eventType) {
        case 'HANDSHAKE_ACK':
          _onHandshakeAck(data['payload']);
          break;

        case 'PONG':
          _onPong(data['payload']);
          break;

        case 'STATE_TRANSITION_ACK':
          _lastAck = DateTime.now();
          _lastEventAcked = 'RELAY_RECEIVED';
          _eventsAcked++;
          pipelineStage = PipelineStage.relayReceived;
          _addLog('RELAY_ACK: ${data['payload']?['state'] ?? 'received by relay'}');
          notifyListeners();
          break;

        case 'DESKTOP_STATE_CHANGED':
          pipelineStage = PipelineStage.desktopUpdated;
          if (data['payload']?['state'] != null) {
            activeCognitiveState = data['payload']['state'].toString().toUpperCase();
          }
          _addLog('DESKTOP_UPDATED: State changed to ${data['payload']?['state']}');
          notifyListeners();
          break;

        case 'SCULPTOR_ACTION_EXECUTED':
          pipelineStage = PipelineStage.sculptorExecuted;
          _addLog('SCULPTOR_ACK: ${data['payload']?['action'] ?? 'action executed'}');
          notifyListeners();
          Future.delayed(const Duration(milliseconds: 600), () {
            pipelineStage = PipelineStage.ackReceived;
            _lastAck = DateTime.now();
            _lastEventAcked = 'SCULPTOR_ACK';
            _eventsAcked++;
            notifyListeners();
            Future.delayed(const Duration(seconds: 4), () {
              if (pipelineStage == PipelineStage.ackReceived) {
                pipelineStage = PipelineStage.idle;
                notifyListeners();
              }
            });
          });
          break;

        case 'EVENT_ACK':
          _onEventAck(data['payload']);
          break;

        case 'DEVICE_CONNECTED':
          _addLog('DEVICE_JOINED: ${data['payload']?['device_name'] ?? 'unknown'}');
          connectedDevices = _parseDeviceList(data['payload']);
          notifyListeners();
          break;

        case 'DEVICE_DISCONNECTED':
          _addLog('DEVICE_LEFT: ${data['payload']?['device_name'] ?? 'unknown'}');
          connectedDevices.removeWhere(
              (d) => d['session_id'] == data['payload']?['session_id']);
          notifyListeners();
          break;

        case 'COMPUTE_ACTIVE':
          activeExecutionStatus = "Processing";
          _addLog('COMPUTE_ACTIVE: ${data['payload']?['agentType']}');
          notifyListeners();
          break;

        case 'COMPUTE_COMPLETE':
          activeExecutionStatus = "Complete";
          _addLog('COMPUTE_COMPLETE: Result received');
          notifyListeners();
          break;

        case 'DEMO_SYNC':
          lastDemoSync = data['payload'];
          _addLog('DEMO_SYNC: Step ${lastDemoSync?["step"]}');
          notifyListeners();
          break;

        case 'ML_INFERENCE_RESULT':
          _addLog('ML_RESULT: ${data['payload']?['state']} (${data['payload']?['inference_source']})');
          notifyListeners();
          break;

        default:
          // Forward to any external listeners
          break;
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  void _onHandshakeAck(Map<String, dynamic>? payload) {
    if (payload == null) return;

    sessionId = payload['session_id'];
    deviceId = payload['device_id'];
    
    // Parse connected devices from handshake
    if (payload['connected_devices'] is List) {
      connectedDevices = List<Map<String, dynamic>>.from(
          (payload['connected_devices'] as List)
              .map((d) => Map<String, dynamic>.from(d)));
    }

    _setWsConnectionState(WsConnectionState.connected);
    _reconnectAttempts = 0;
    _missedHeartbeats = 0;
    _addLog('HANDSHAKE_OK: Session=$sessionId, Devices=${connectedDevices.length}');

    // Start heartbeat
    _startHeartbeat();
  }

  void _onPong(Map<String, dynamic>? payload) {
    if (payload == null || _lastPingSent == null) return;

    final now = DateTime.now();
    _latencyMs = now.difference(_lastPingSent!).inMilliseconds;
    lastHeartbeat = now;
    _missedHeartbeats = 0;

    // Detect degraded connection
    if (_latencyMs > 500 && _connectionState == WsConnectionState.connected) {
      _setWsConnectionState(WsConnectionState.degraded);
    } else if (_latencyMs <= 500 && _connectionState == WsConnectionState.degraded) {
      _setWsConnectionState(WsConnectionState.connected);
    }

    notifyListeners();
  }

  void triggerCognitiveState(String state, {String reason = 'manual_trigger'}) {
    activeCognitiveState = state.toUpperCase();
    pipelineStage = PipelineStage.transmitting;
    _lastEventSent = 'COGNITIVE_STATE_COMMITTED';
    _addLog('TRIGGER: $state ($reason)');
    notifyListeners();

    sendEvent('COGNITIVE_STATE_COMMITTED', {
      'state': state,
      'confidence': 95,
      'reason': reason,
      'device_source': 'iqoo-mobile-client',
      'source': 'mobile',
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
  }

  void _onEventAck(Map<String, dynamic>? payload) {
    if (payload == null) return;
    _lastAck = DateTime.now();
    _lastEventAcked = payload['acked_event_type'];
    _eventsAcked++;
    notifyListeners();
  }

  List<Map<String, dynamic>> _parseDeviceList(Map<String, dynamic>? payload) {
    // When a DEVICE_CONNECTED event arrives, add to existing list
    if (payload != null && payload['device_type'] != null) {
      final existing = List<Map<String, dynamic>>.from(connectedDevices);
      existing.add(Map<String, dynamic>.from(payload));
      return existing;
    }
    return connectedDevices;
  }

  // ═══════════════════════════════════════════════════════
  // HEARTBEAT (PING/PONG)
  // ═══════════════════════════════════════════════════════
  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (!isConnected && _connectionState != WsConnectionState.degraded) return;

      _lastPingSent = DateTime.now();
      _sendRaw({
        'event': 'PING',
        'payload': {'timestamp': _lastPingSent!.millisecondsSinceEpoch},
      });

      _missedHeartbeats++;
      if (_missedHeartbeats >= 3) {
        _addLog('HEARTBEAT_LOST: $_missedHeartbeats consecutive misses');
        _onDisconnect();
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // SEND EVENTS
  // ═══════════════════════════════════════════════════════
  void sendEvent(String event, dynamic payload) {
    if (!isConnected && _connectionState != WsConnectionState.degraded) return;
    _lastEventSent = event;
    _sendRaw({'event': event, 'payload': payload});
  }

  void _sendRaw(Map<String, dynamic> data) {
    if (_channel == null) return;
    try {
      _channel!.sink.add(json.encode(data));
    } catch (e) {
      debugPrint('[WS] Send failed: $e');
    }
  }

  // ═══════════════════════════════════════════════════════
  // RECONNECTION
  // ═══════════════════════════════════════════════════════
  void _onDisconnect() {
    final wasConnected = _connectionState == WsConnectionState.connected ||
        _connectionState == WsConnectionState.degraded;
    _cleanup();

    if (wasConnected) {
      _setWsConnectionState(WsConnectionState.reconnecting);
      _scheduleReconnect();
    } else if (_connectionState != WsConnectionState.offline) {
      _scheduleReconnect();
    }
  }

  void _scheduleReconnect() {
    if (_reconnectAttempts >= _maxReconnectAttempts) {
      _addLog('RECONNECT_EXHAUSTED: Max attempts reached');
      _setWsConnectionState(WsConnectionState.offline);
      return;
    }

    _setWsConnectionState(WsConnectionState.reconnecting);
    final delay = _baseReconnectDelay * (1 << _reconnectAttempts.clamp(0, 5));
    _reconnectAttempts++;
    _addLog('RECONNECT_SCHEDULED: Attempt $_reconnectAttempts in ${delay.inSeconds}s');

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(delay, () {
      _attemptConnection();
    });
  }

  // ═══════════════════════════════════════════════════════
  // DISCONNECT / CLEANUP
  // ═══════════════════════════════════════════════════════
  void disconnect() {
    _reconnectTimer?.cancel();
    _reconnectAttempts = _maxReconnectAttempts; // prevent auto-reconnect
    _cleanup();
    _setWsConnectionState(WsConnectionState.offline);
  }

  void _cleanup() {
    _subscription?.cancel();
    _subscription = null;
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
    _channel?.sink.close();
    _channel = null;
  }
}
