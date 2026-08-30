import '../core/network/host_config.dart';

class EvidenceModel {
  final int id;
  final int complaintId;
  final String fileName;
  final String? storageFileName;
  final String? fileUrl;
  final String? evidenceType;
  final String? contentType;
  final int? fileSize;
  final double? latitude;
  final double? longitude;
  final DateTime? uploadedAt;

  EvidenceModel({
    required this.id,
    required this.complaintId,
    required this.fileName,
    this.storageFileName,
    this.fileUrl,
    this.evidenceType,
    this.contentType,
    this.fileSize,
    this.latitude,
    this.longitude,
    this.uploadedAt,
  });

  factory EvidenceModel.fromJson(Map<String, dynamic> json) {
    return EvidenceModel(
      id: json['id'] ?? 0,
      complaintId: json['complaintId'] ?? 0,
      fileName: json['fileName'] ?? json['originalFileName'] ?? 'evidence.jpg',
      storageFileName: json['storageFileName'],
      fileUrl: json['fileUrl'] ?? json['url'],
      evidenceType: json['evidenceType'] ?? 'INITIAL_SURVEY',
      contentType: json['contentType'] ?? 'image/jpeg',
      fileSize: json['fileSize'],
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      uploadedAt: json['uploadedAt'] != null ? DateTime.tryParse(json['uploadedAt'].toString()) : null,
    );
  }

  String get fullUrl {
    if (fileUrl != null && fileUrl!.isNotEmpty) {
      return HostConfig.getFileUrl(fileUrl);
    }
    if (storageFileName != null && storageFileName!.isNotEmpty) {
      return HostConfig.getFileUrl('/api/files/complaints/$complaintId/$storageFileName');
    }
    return '';
  }
}
