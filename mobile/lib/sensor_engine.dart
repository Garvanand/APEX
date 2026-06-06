import 'dart:async';
import 'package:flutter/material.dart';
import 'inference_engine.dart';
import 'dart:math';

class SensorEngine {
  static final SensorEngine _instance = SensorEngine._internal();
  factory SensorEngine() => _instance;
  SensorEngine._internal();

  double accelX = 0.0;
  double accelY = 0.0;
  double accelZ = 0.0;
  double touchFrequency = 0.0;
  int fakeNotificationCount = 0;
  int fakeAppSwitches = 0;

  Timer? _decayTimer;
  Timer? _idleWobbleTimer;
  
  final _sensorUpdateController = StreamController<void>.broadcast();
  Stream<void> get onSensorUpdate => _sensorUpdateController.stream;

  void start() {
    _decayTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (touchFrequency > 0) touchFrequency -= 1.0;
      if (touchFrequency < 0) touchFrequency = 0;
      
      // Auto-recover to FLOW if left alone
      if (touchFrequency == 0 && fakeNotificationCount == 0 && fakeAppSwitches == 0) {
         if (accelX > 0.5) accelX -= 0.5;
         if (accelY > 0.5) accelY -= 0.5;
      }

      _sensorUpdateController.add(null);
      InferenceEngine().evaluate(this);
    });

    _idleWobbleTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      // Small ambient motion so the sensors look "alive"
      accelX = (Random().nextDouble() * 0.4) - 0.2;
      accelY = (Random().nextDouble() * 0.4) - 0.2;
      accelZ = 9.8 + (Random().nextDouble() * 0.2);
      _sensorUpdateController.add(null);
    });
  }

  void stop() {
    _decayTimer?.cancel();
    _idleWobbleTimer?.cancel();
  }

  void registerTouch() {
    touchFrequency += 2.0;
    
    // Simulating device motion when user interacts heavily
    accelX += Random().nextDouble() * 2.0;
    accelY += Random().nextDouble() * 2.0;

    _sensorUpdateController.add(null);
    InferenceEngine().evaluate(this);
  }

  void simulateNotification() {
    fakeNotificationCount++;
    accelX += 5.0; // Simulate picking up phone to check notification
    _sensorUpdateController.add(null);
    InferenceEngine().evaluate(this);
  }

  void simulateAppSwitch() {
    fakeAppSwitches++;
    accelX += 5.0; // Simulate active use
    _sensorUpdateController.add(null);
    InferenceEngine().evaluate(this);
  }
}
