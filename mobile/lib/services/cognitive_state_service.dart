import 'dart:convert';
import 'api_service.dart';

class CognitiveStateService {
  final ApiService _apiService = ApiService();

  Future<void> sendBiometricTelemetry({
    required double heartRate,
    required double hrv,
    required int blinkRate,
    required double interactionDensity,
  }) async {
    try {
      await _apiService.post('/cognitive/signals', {
        'device_source': 'iqoo-neo-mobile',
        'heart_rate': heartRate,
        'hrv': hrv,
        'blink_rate_per_min': blinkRate,
        'screen_interaction_density': interactionDensity,
        'timestamp': DateTime.now().toUtc().toIso8601String()
      });
    } catch (e) {
      print('Failed to send telemetry: $e');
    }
  }

  Future<Map<String, dynamic>?> getCurrentState() async {
    try {
      final response = await _apiService.get('/cognitive/status');
      return jsonDecode(response.body);
    } catch (e) {
      print('Failed to get cognitive state: $e');
    }
    return null;
  }
}
