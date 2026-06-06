import 'dart:async';
import 'sensor_engine.dart';

class InferenceEngine {
  static final InferenceEngine _instance = InferenceEngine._internal();
  factory InferenceEngine() => _instance;
  InferenceEngine._internal();

  String currentState = "FLOW";
  int flowConfidence = 92;

  final _stateChangeController = StreamController<String>.broadcast();
  Stream<String> get onStateChange => _stateChangeController.stream;

  void evaluate(SensorEngine sensors) {
    // Basic heuristic engine
    double motionTotal = sensors.accelX.abs() + sensors.accelY.abs() + sensors.accelZ.abs();
    
    String newState = currentState;
    int newConfidence = flowConfidence;

    if (motionTotal > 4.0 || sensors.fakeAppSwitches > 2 || sensors.fakeNotificationCount > 1) {
      newState = "DISTRACTED";
      newConfidence = 40;
      sensors.fakeAppSwitches = 0; // Reset for demo purposes
      sensors.fakeNotificationCount = 0;
    } else if (sensors.touchFrequency < 1.0 && motionTotal < 0.5) {
      // Could be FLOW or FATIGUED. If idle for too long, FATIGUED.
      if (currentState == "FLOW" && sensors.touchFrequency == 0) {
        newConfidence -= 1;
        if (newConfidence < 60) newState = "FATIGUED";
      }
    } else if (sensors.touchFrequency > 2.0 && motionTotal < 2.0) {
      newState = "FLOW";
      newConfidence += 2;
      if (newConfidence > 98) newConfidence = 98;
    }

    if (newState != currentState) {
      currentState = newState;
      flowConfidence = newConfidence;
      _stateChangeController.add(currentState);
    } else if (newConfidence != flowConfidence) {
      flowConfidence = newConfidence;
      _stateChangeController.add(currentState); // Trigger UI update for confidence
    }
  }
}
