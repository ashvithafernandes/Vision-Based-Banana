import 'dart:convert';

enum RipeningStatus {
  withCarbide,
  withoutCarbide,
  notABanana,
  uncertain,
}

class RecognitionResult {
  final String predictedClass;
  final double confidence;
  final double latencyMs;
  final Map<String, double> classProbabilities;
  final bool isOffline;
  final String safetyRecommendation;
  final String guardrailStatus;
  final DateTime timestamp;

  RecognitionResult({
    required this.predictedClass,
    required this.confidence,
    required this.latencyMs,
    required this.classProbabilities,
    this.isOffline = true,
    required this.safetyRecommendation,
    required this.guardrailStatus,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  RipeningStatus get status {
    if (predictedClass == 'Not a Banana') return RipeningStatus.notABanana;
    if (confidence < 0.70) return RipeningStatus.uncertain;
    if (predictedClass == 'With Carbide') return RipeningStatus.withCarbide;
    return RipeningStatus.withoutCarbide;
  }

  bool get isCarbideDetected => status == RipeningStatus.withCarbide;
  bool get isNaturallyRipened => status == RipeningStatus.withoutCarbide;
  bool get isNonBanana => status == RipeningStatus.notABanana;
  bool get isUncertain => status == RipeningStatus.uncertain;

  Map<String, dynamic> toMap() {
    return {
      'system_status': '100% Standalone Offline',
      'engine': 'MobileNetV3 Edge TFLite',
      'diagnosis': {
        'predicted_label': predictedClass,
        'confidence_percentage': '${(confidence * 100).toStringAsFixed(2)}%',
        'safety_verdict': safetyRecommendation,
        'guardrail_status': guardrailStatus,
      },
      'performance': {
        'inference_latency_ms': latencyMs.toStringAsFixed(2),
        'device_acceleration': 'CPU (XNNPACK Delegate)',
      },
      'probability_distribution': classProbabilities.map(
        (key, value) => MapEntry(key, '${(value * 100).toStringAsFixed(2)}%'),
      ),
      'timestamp': timestamp.toIso8601String(),
    };
  }

  String toFormattedJson() {
    const encoder = JsonEncoder.withIndent('  ');
    return encoder.convert(toMap());
  }
}
