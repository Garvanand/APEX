import 'dart:convert';

class TelemetrySignals {
  final double heartRate;
  final double hrv;
  final int blinkRatePerMin;
  final double screenInteractionDensity;
  final String activeApplication;
  final double ambientNoiseDb;
  final DateTime timestamp;

  TelemetrySignals({
    required this.heartRate,
    required this.hrv,
    required this.blinkRatePerMin,
    required this.screenInteractionDensity,
    required this.activeApplication,
    required this.ambientNoiseDb,
    required this.timestamp,
  });

  Map<String, dynamic> toMap() {
    return {
      'heart_rate': heartRate,
      'hrv': hrv,
      'blink_rate_per_min': blinkRatePerMin,
      'screen_interaction_density': screenInteractionDensity,
      'active_application': activeApplication,
      'ambient_noise_db': ambientNoiseDb,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  String toJson() => json.encode(toMap());
}

class CognitiveStateData {
  final String state;
  final double confidenceScore;
  final DateTime updatedAt;
  final List<String> contributingMetrics;

  CognitiveStateData({
    required this.state,
    required this.confidenceScore,
    required this.updatedAt,
    required this.contributingMetrics,
  });

  factory CognitiveStateData.fromMap(Map<String, dynamic> map) {
    var metricsRaw = map['contributing_metrics'] ?? map['contributing_signals']?['metrics'] ?? [];
    List<String> metrics = List<String>.from(metricsRaw);
    
    return CognitiveStateData(
      state: map['state'] ?? 'Flow',
      confidenceScore: (map['confidence_score'] ?? map['confidence'] ?? 0.8).toDouble(),
      updatedAt: DateTime.parse(map['updated_at'] ?? DateTime.now().toIso8601String()),
      contributingMetrics: metrics,
    );
  }

  factory CognitiveStateData.fromJson(String source) => 
      CognitiveStateData.fromMap(json.decode(source));
}
