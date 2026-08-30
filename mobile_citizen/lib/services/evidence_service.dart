import 'dart:io';
import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/evidence_model.dart';

class EvidenceService {
  final ApiClient _client = ApiClient();

  Future<List<EvidenceModel>> uploadEvidence({
    required int complaintId,
    required List<File> files,
    String? description,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final multipartFiles = <MultipartFile>[];
      for (final file in files) {
        final name = file.path.split(Platform.pathSeparator).last;
        multipartFiles.add(await MultipartFile.fromFile(file.path, filename: name));
      }

      final formMap = <String, dynamic>{
        'files': multipartFiles,
        'evidenceType': 'INITIAL_SURVEY',
      };
      if (description != null && description.isNotEmpty) formMap['description'] = description;
      if (latitude != null) formMap['latitude'] = latitude;
      if (longitude != null) formMap['longitude'] = longitude;

      final formData = FormData.fromMap(formMap);

      final response = await _client.dio.post(
        ApiConstants.uploadEvidence(complaintId),
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      final data = response.data;
      final List<EvidenceModel> list = [];
      if (data != null && data['data'] != null) {
        final content = data['data'] is List ? data['data'] : [data['data']];
        for (final item in content) {
          list.add(EvidenceModel.fromJson(item));
        }
      }
      return list;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to upload photo evidence');
    }
  }

  Future<List<EvidenceModel>> getEvidenceForComplaint(int complaintId) async {
    try {
      final response = await _client.dio.get(ApiConstants.getEvidence(complaintId));
      final data = response.data;
      final List<EvidenceModel> list = [];
      if (data != null && data['data'] != null) {
        final content = data['data'] is List ? data['data'] : [data['data']];
        for (final item in content) {
          list.add(EvidenceModel.fromJson(item));
        }
      }
      return list;
    } catch (_) {
      return [];
    }
  }
}
