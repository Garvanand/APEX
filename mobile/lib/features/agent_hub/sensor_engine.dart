import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';

class SensorEngine extends ChangeNotifier {
  static final SensorEngine _instance = SensorEngine._internal();
  factory SensorEngine() => _instance;
  SensorEngine._internal();

  double accelX = 0, accelY = 0, accelZ = 0;
  double gyroX = 0, gyroY = 0, gyroZ = 0;
  
  int distractionScore = 0;
  int flowConfidence = 100;
  int fatigueScore = 0;

  // ── Cognitive State Machine with Hysteresis ──────────
  String committedState = 'FLOW';
  String predictedState = 'FLOW';
  int confidence = 95;
  String transitionReason = 'Equilibrium maintained';
  int _sustainedStateCycles = 0;
  String _pendingState = 'FLOW';

  Function(String newState, String reason, int confidence)? onStateCommitted;

  bool isScreenOn = true;
  int touchBurstCount = 0;
  int backgroundTransitions = 0;

  double sma5s = 0.0;
  double jerkVariance5s = 0.0;
  double touchDensity5s = 0.0;
  
  final List<double> _magBuffer = [];
  final List<double> _accelXBuffer = [];
  final List<double> _accelYBuffer = [];
  final List<double> _accelZBuffer = [];
  int _touchCount5s = 0;
  int _ticks5s = 0;

  Function(double sma, double jerk, double touchDensity, int appSwitches)? onFeatureVectorCalculated;

  Timer? _tickTimer;
  final List<StreamSubscription> _subs = [];

  bool _isSimulated = false;
  bool get isRealSensor => !_isSimulated;
  final Random _random = Random();

  void start() {
    if (_subs.isNotEmpty) return;
    
    bool gotRealData = false;
    _subs.add(accelerometerEventStream().listen((event) {
      gotRealData = true;
      _isSimulated = false;
      accelX = event.x;
      accelY = event.y;
      accelZ = event.z;
    }, onError: (_) {
      _isSimulated = true;
    }));

    _subs.add(gyroscopeEventStream().listen((event) {
      gyroX = event.x;
      gyroY = event.y;
      gyroZ = event.z;
    }, onError: (_) {}));

    // Fallback if no real events come through within 1 second (e.g. HTTP block on web)
    Future.delayed(const Duration(seconds: 1), () {
      if (!gotRealData) {
        _isSimulated = true;
      }
    });

    _tickTimer = Timer.periodic(const Duration(milliseconds: 500), _onTick);
  }

  void stop() {
    _tickTimer?.cancel();
    for (var sub in _subs) {
      sub.cancel();
    }
    _subs.clear();
  }

  void registerTouch() {
    touchBurstCount += 15;
    _touchCount5s += 1;
    if (touchBurstCount > 50) touchBurstCount = 50;
    
    // Each touch slightly increases distraction if it's bursting
    if (touchBurstCount > 30) {
      distractionScore += 2;
    }
    notifyListeners();
  }

  void registerBackground() {
    backgroundTransitions++;
    distractionScore += 30; // Huge penalty for app switching
    notifyListeners();
  }

  void manualOverride() {
    distractionScore = 0;
    touchBurstCount = 0;
    flowConfidence = 100;
    _forceDistraction = false;
    notifyListeners();
  }

  bool _forceDistraction = false;
  void toggleSimulation(bool distract) {
    _forceDistraction = distract;
    notifyListeners();
  }

  void _onTick(Timer timer) {
    if (_isSimulated) {
      if (_forceDistraction) {
        // Shaking phone
        accelX = 5.0 + _random.nextDouble() * 5.0;
        accelY = 5.0 + _random.nextDouble() * 5.0;
        accelZ = 5.0 + _random.nextDouble() * 5.0;
        gyroX = 2.0;
      } else {
        // Flat on desk
        accelX = 0.0 + _random.nextDouble() * 0.1;
        accelY = 0.0 + _random.nextDouble() * 0.1;
        accelZ = 9.8 + _random.nextDouble() * 0.1; // Gravity
        gyroX = 0.0;
        gyroY = 0.0;
        gyroZ = 0.0;
      }
    }

    // Calculate movement variance (shaking/picking up phone)
    double magnitude = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
    double movement = (magnitude - 9.8).abs();
    
    _magBuffer.add(magnitude);
    _accelXBuffer.add(accelX);
    _accelYBuffer.add(accelY);
    _accelZBuffer.add(accelZ);
    _ticks5s++;
    
    if (_ticks5s >= 10) { // 5 seconds (500ms * 10)
      // Calculate SMA
      double sumSma = 0;
      for (int i=0; i<_accelXBuffer.length; i++) {
        sumSma += _accelXBuffer[i].abs() + _accelYBuffer[i].abs() + _accelZBuffer[i].abs();
      }
      sma5s = sumSma / _accelXBuffer.length;
      
      // Calculate Jerk Variance
      List<double> jerks = [];
      for (int i=1; i<_magBuffer.length; i++) {
         jerks.add(_magBuffer[i] - _magBuffer[i-1]);
      }
      double jerkMean = jerks.isEmpty ? 0 : jerks.reduce((a, b) => a + b) / jerks.length;
      double jerkVarSum = 0;
      for (var j in jerks) {
         jerkVarSum += pow(j - jerkMean, 2);
      }
      jerkVariance5s = jerks.isEmpty ? 0 : jerkVarSum / jerks.length;
      
      // Calculate Touch Density
      touchDensity5s = _touchCount5s / 5.0;
      
      if (onFeatureVectorCalculated != null) {
        onFeatureVectorCalculated!(sma5s, jerkVariance5s, touchDensity5s, backgroundTransitions);
      }
      
      // Reset buffers
      _magBuffer.clear();
      _accelXBuffer.clear();
      _accelYBuffer.clear();
      _accelZBuffer.clear();
      _touchCount5s = 0;
      _ticks5s = 0;
      backgroundTransitions = 0;
    }

    // Distraction Logic (Fallback for UI)
    if (movement > 3.0) {
      distractionScore += 8; // Moving phone around rapidly
    } else if (movement > 1.0) {
      distractionScore += 3; // Slight fidgeting
    }

    // Cool down
    if (movement < 1.0 && touchBurstCount == 0) {
      distractionScore -= 2;
    }
    
    if (touchBurstCount > 0) {
      touchBurstCount -= 5;
      if (touchBurstCount < 0) touchBurstCount = 0;
    }

    // Evaluate predicted state
    String rawState = 'FLOW';
    String reason = 'Interaction rhythm is calm and focused';
    if (distractionScore > 75) {
      rawState = 'OVERLOADED';
      reason = 'Severe distraction combined with frequent context switching';
    } else if (distractionScore > 45) {
      rawState = 'DISTRACTED';
      reason = 'Erratic touch bursts and excessive movement detected';
    } else if (fatigueScore > 60) {
      rawState = 'FATIGUED';
      reason = 'Extended session duration without recovery';
    }

    predictedState = rawState;

    // Hysteresis: require 3 consecutive evaluation cycles (1.5s) before committing
    if (rawState == _pendingState) {
      _sustainedStateCycles++;
      if (_sustainedStateCycles >= 3 && committedState != rawState) {
        committedState = rawState;
        transitionReason = reason;
        confidence = rawState == 'FLOW' ? flowConfidence : (rawState == 'DISTRACTED' ? distractionScore : fatigueScore);
        if (onStateCommitted != null) {
          onStateCommitted!(committedState, transitionReason, confidence);
        }
      }
    } else {
      _pendingState = rawState;
      _sustainedStateCycles = 1;
    }

    notifyListeners();
  }
}
