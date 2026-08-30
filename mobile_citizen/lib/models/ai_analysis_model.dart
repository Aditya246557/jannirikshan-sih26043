class AiDetectionItem {
  final String className;
  final double confidence;
  final List<double>? boundingBox; // [x1, y1, x2, y2] normalized

  AiDetectionItem({
    required this.className,
    required this.confidence,
    this.boundingBox,
  });

  factory AiDetectionItem.fromJson(Map<String, dynamic> json) {
    List<double>? box;
    if (json['box'] != null && json['box'] is List) {
      box = (json['box'] as List).map((e) => (e as num).toDouble()).toList();
    } else if (json['bbox'] != null && json['bbox'] is List) {
      box = (json['bbox'] as List).map((e) => (e as num).toDouble()).toList();
    }

    return AiDetectionItem(
      className: json['class_name'] ?? json['class'] ?? json['label'] ?? 'civic_defect',
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0.85,
      boundingBox: box,
    );
  }
}

class AiGeneratedDetails {
  final String title;
  final String description;
  final String category;
  final String severity;
  final int affectedPopulation;
  final String desiredOutcome;
  final String recommendedDepartment;

  AiGeneratedDetails({
    required this.title,
    required this.description,
    required this.category,
    required this.severity,
    required this.affectedPopulation,
    required this.desiredOutcome,
    required this.recommendedDepartment,
  });

  factory AiGeneratedDetails.fromJson(Map<String, dynamic> json) {
    return AiGeneratedDetails(
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'Roads & Infrastructure',
      severity: json['severity'] ?? 'HIGH',
      affectedPopulation: json['affectedPopulation'] ?? json['affectedPeople'] ?? 500,
      desiredOutcome: json['desiredOutcome'] ?? json['desiredEngineeringOutcome'] ?? '',
      recommendedDepartment: json['recommendedDepartment'] ?? json['department'] ?? 'Public Works Department (PWD)',
    );
  }
}

class AiValidationResult {
  final bool valid;
  final String? message;
  final String? primaryDetection;
  final double? confidence;
  final String? severity;
  final String? category;
  final List<AiDetectionItem> detections;
  final AiGeneratedDetails? details;

  AiValidationResult({
    required this.valid,
    this.message,
    this.primaryDetection,
    this.confidence,
    this.severity,
    this.category,
    this.detections = const [],
    this.details,
  });

  factory AiValidationResult.fromJson(Map<String, dynamic> json) {
    final detectionsList = <AiDetectionItem>[];
    if (json['detections'] != null && json['detections'] is List) {
      for (final item in json['detections']) {
        if (item is Map<String, dynamic>) {
          detectionsList.add(AiDetectionItem.fromJson(item));
        }
      }
    }

    AiGeneratedDetails? generated;
    if (json['details'] != null && json['details'] is Map<String, dynamic>) {
      generated = AiGeneratedDetails.fromJson(json['details']);
    }

    return AiValidationResult(
      valid: json['valid'] == true || json['isValid'] == true || (json['confidence'] != null && (json['confidence'] as num) > 0.4),
      message: json['message'],
      primaryDetection: json['primaryDetection'] ?? json['primary_class'] ?? json['detected_class'],
      confidence: (json['confidence'] as num?)?.toDouble(),
      severity: json['severity'],
      category: json['category'] ?? json['recommended_category'],
      detections: detectionsList,
      details: generated,
    );
  }
}
