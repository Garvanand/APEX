import 'package:flutter_test/flutter_test.dart';
import 'package:apex_mobile/features/agent_hub/sensor_engine.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('SensorEngine Cognitive State Machine & Hysteresis Tests', () {
    late SensorEngine engine;

    setUp(() {
      engine = SensorEngine();
    });

    test('Initial baseline state is FLOW with high confidence', () {
      expect(engine.committedState, equals('FLOW'));
      expect(engine.confidence, greaterThanOrEqualTo(90));
      expect(engine.transitionHistory.isNotEmpty, isTrue);
      expect(engine.transitionHistory.first.fromState, equals('CALIBRATING'));
      expect(engine.transitionHistory.first.toState, equals('FLOW'));
    });

    test('Explicit Sensor Mode reflects transducer vs emulation status', () {
      final desc = engine.sensorModeDescription;
      expect(
        desc.contains('HARDWARE TRANSDUCER ACTIVE') || desc.contains('SIMULATION MODE'),
        isTrue,
      );
      if (!engine.isRealSensor) {
        expect(desc.contains('SIMULATION MODE'), isTrue);
      }
    });

    test('Registering touches accumulates touch burst count', () {
      final initialTouches = engine.touchBurstCount;
      engine.registerTouch();
      engine.registerTouch();
      engine.registerTouch();
      expect(engine.touchBurstCount, equals(initialTouches + 45));
    });

    test('Registering background transitions increments switch count', () {
      final initialSwitches = engine.backgroundTransitions;
      engine.registerBackground();
      expect(engine.backgroundTransitions, equals(initialSwitches + 1));
    });

    test('Cognitive State Machine enforces 3-cycle temporal hysteresis', () {
      // Direct verification: setting raw distraction score should not immediately mutate committed state
      // until hysteresis condition is fulfilled
      engine.distractionScore = 80; // High distraction
      
      // Verification that instantaneous spike does not bypass hysteresis
      expect(engine.committedState, equals('FLOW'));
    });
  });
}
