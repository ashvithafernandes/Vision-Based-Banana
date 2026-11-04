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

  // Two-Stage Pipeline Attributes
  final bool isBanana;
  final String detectedObject;
  final double objectConfidence;
  final double stage1LatencyMs;
  final double? stage2LatencyMs;
  final String stage2Status;

  RecognitionResult({
    required this.predictedClass,
    required this.confidence,
    required this.latencyMs,
    required this.classProbabilities,
    this.isOffline = true,
    required this.safetyRecommendation,
    required this.guardrailStatus,
    this.isBanana = true,
    this.detectedObject = 'Banana',
    this.objectConfidence = 1.0,
    this.stage1LatencyMs = 0.0,
    this.stage2LatencyMs,
    this.stage2Status = 'COMPLETED',
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  RipeningStatus get status {
    if (!isBanana || predictedClass == 'Not a Banana') return RipeningStatus.notABanana;
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
      'pipeline': 'Two-Stage Edge AI (YOLO11n Gatekeeper -> MobileNetV3 Classifier)',
      'stage1_yolo_gatekeeper': {
        'is_banana_detected': isBanana,
        'detected_object': detectedObject,
        'object_confidence': '${(objectConfidence * 100).toStringAsFixed(1)}%',
        'latency_ms': '${stage1LatencyMs.toStringAsFixed(1)} ms',
      },
      'stage2_ripening_classifier': {
        'status': stage2Status,
        'latency_ms': stage2LatencyMs != null ? '${stage2LatencyMs!.toStringAsFixed(1)} ms' : 'N/A',
      },
      'diagnosis': {
        'predicted_label': predictedClass,
        'confidence_percentage': '${(confidence * 100).toStringAsFixed(2)}%',
        'safety_verdict': safetyRecommendation,
        'guardrail_status': guardrailStatus,
      },
      'performance': {
        'total_latency_ms': latencyMs.toStringAsFixed(2),
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
