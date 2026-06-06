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

  bool isScreenOn = true;
  int touchBurstCount = 0;
  int backgroundTransitions = 0;

  Timer? _tickTimer;
  final List<StreamSubscription> _subs = [];

  bool _isSimulated = false;
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
    
    // Distraction Logic
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

    // Bounds
    distractionScore = distractionScore.clamp(0, 100);
    flowConfidence = (100 - distractionScore).clamp(0, 100);
    
    // Fatigue goes up slowly if distracted
    if (distractionScore > 50) {
      fatigueScore = (fatigueScore + 1).clamp(0, 100);
    } else if (distractionScore < 20) {
      fatigueScore = (fatigueScore - 1).clamp(0, 100);
    }

    notifyListeners();
  }
}
