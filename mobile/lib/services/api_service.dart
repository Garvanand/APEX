import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cognitive_state.dart';

class ApiService {
  // Targeting localhost for local emulator dev runs; override for real devices
  static const String defaultBaseUrl = 'http://10.0.2.2:8000/api/v1'; // 10.0.2.2 points to host machine from Android Emulator

  Future<bool> register(String email, String password, String firstName, String lastName) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'first_name': firstName,
        'last_name': lastName,
      }),
    );

    return response.statusCode == 201;
  }

  Future<String?> login(String email, String password, String deviceId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'device_id': deviceId,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final token = data['data']?['access_token'];
      if (token != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('jwt_token', token);
        await prefs.setString('refresh_token', data['data']?['refresh_token'] ?? '');
        return token;
      }
    }
    return null;
  }

  Future<CognitiveStateData?> ingestSignals(TelemetrySignals signals) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token == null) return null;

    final response = await http.post(
      Uri.parse('$baseUrl/cognitive/signals'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({
        'timestamp': signals.timestamp.toUtc().toIso8601String(),
        'device_source': 'iqoo-mobile-companion',
        'heart_rate': signals.heartRate,
        'hrv': signals.hrv,
        'blink_rate_per_min': signals.blinkRatePerMin,
        'screen_interaction_density': signals.screenInteractionDensity,
        'active_application': signals.activeApplication,
        'ambient_noise_db': signals.ambientNoiseDb,
      }),
    );

    if (response.statusCode == 202) {
      final body = json.decode(response.body);
      return CognitiveStateData.fromMap(body);
    }
    return null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    await prefs.remove('refresh_token');
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  String get baseUrl => ApiService.defaultBaseUrl;

  Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', token);
  }

  Future<http.Response> post(String endpoint, dynamic body) async {
    final token = await getToken();
    return http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: json.encode(body),
    );
  }

  Future<http.Response> get(String endpoint) async {
    final token = await getToken();
    return http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );
  }
}
