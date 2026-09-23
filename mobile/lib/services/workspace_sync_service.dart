import 'dart:convert';
import 'api_service.dart';

class WorkspaceSyncService {
  final ApiService _apiService = ApiService();

  Future<void> triggerLockdown(String mode) async {
    try {
      await _apiService.post('/agents/environment/lock', {
        'mode': mode,
        'timestamp': DateTime.now().toUtc().toIso8601String()
      });
    } catch (e) {
      print('Failed to trigger lockdown: $e');
    }
  }

  Future<Map<String, dynamic>?> getActiveConstraints() async {
    try {
      final response = await _apiService.get('/agents/environment/status');
      return jsonDecode(response.body);
    } catch (e) {
      print('Failed to get constraints: $e');
    }
    return null;
  }
}
