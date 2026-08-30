class ComplaintModel {
  final int id;
  final String title;
  final String description;
  final String category;
  final String? subcategory;
  final String? severity;
  final String? priority;
  final String status;
  final double latitude;
  final double longitude;
  final String? address;
  final String? district;
  final String? state;
  final int? affectedPeople;
  final String? desiredEngineeringOutcome;
  final String? expectedImpact;
  final DateTime? createdAt;
  final int? assignedUniversityId;
  final String? assignedUniversityName;
  final int? projectId;
  final String? primaryEvidenceUrl;
  final double? priorityScore;

  ComplaintModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    this.subcategory,
    this.severity,
    this.priority,
    required this.status,
    required this.latitude,
    required this.longitude,
    this.address,
    this.district,
    this.state,
    this.affectedPeople,
    this.desiredEngineeringOutcome,
    this.expectedImpact,
    this.createdAt,
    this.assignedUniversityId,
    this.assignedUniversityName,
    this.projectId,
    this.primaryEvidenceUrl,
    this.priorityScore,
  });

  factory ComplaintModel.fromJson(Map<String, dynamic> json) {
    return ComplaintModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Civic Challenge',
      description: json['description'] ?? '',
      category: json['category'] ?? 'General Civic',
      subcategory: json['subcategory'],
      severity: json['severity'],
      priority: json['priority'] ?? 'HIGH',
      status: json['status'] ?? 'SUBMITTED',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 28.6139,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 77.2090,
      address: json['address'],
      district: json['district'],
      state: json['state'],
      affectedPeople: json['affectedPeople'] ?? json['affectedPopulation'],
      desiredEngineeringOutcome: json['desiredEngineeringOutcome'],
      expectedImpact: json['expectedImpact'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      assignedUniversityId: json['assignedUniversityId'] ?? json['universityId'],
      assignedUniversityName: json['assignedUniversityName'] ?? json['universityName'],
      projectId: json['projectId'],
      primaryEvidenceUrl: json['primaryEvidenceUrl'] ?? json['evidenceUrl'],
      priorityScore: (json['priorityScore'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'category': category,
      if (subcategory != null) 'subcategory': subcategory,
      if (severity != null) 'severity': severity,
      if (priority != null) 'priority': priority,
      'latitude': latitude,
      'longitude': longitude,
      if (address != null) 'address': address,
      if (district != null) 'district': district,
      if (state != null) 'state': state,
      if (affectedPeople != null) 'affectedPeople': affectedPeople,
      if (desiredEngineeringOutcome != null) 'desiredEngineeringOutcome': desiredEngineeringOutcome,
      if (expectedImpact != null) 'expectedImpact': expectedImpact,
    };
  }
}
