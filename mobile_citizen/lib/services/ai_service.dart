import 'dart:io';
import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/ai_analysis_model.dart';

class AiService {
  final ApiClient _client = ApiClient();

  Future<AiValidationResult> validateImage(File imageFile) async {
    try {
      final fileName = imageFile.path.split(Platform.pathSeparator).last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(imageFile.path, filename: fileName),
      });

      final response = await _client.dio.post(
        ApiConstants.aiValidateImage,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      final data = response.data;
      if (data != null) {
        final Map<String, dynamic> body = data is Map<String, dynamic>
            ? (data['data'] is Map<String, dynamic> ? data['data'] : data)
            : {};
        return AiValidationResult.fromJson(body);
      }
      return AiValidationResult(valid: false, message: 'Invalid AI response');
    } on DioException catch (e) {
      return AiValidationResult(
        valid: false,
        message: e.response?.data?['message'] ?? e.message ?? 'AI validation server error',
      );
    }
  }

  Future<AiValidationResult> generateComplaintDetails(
    File imageFile, {
    String? location,
    String? description,
    int variation = 0,
  }) async {
    try {
      final fileName = imageFile.path.split(Platform.pathSeparator).last;
      final formMap = <String, dynamic>{
        'file': await MultipartFile.fromFile(imageFile.path, filename: fileName),
        'variation': variation,
      };
      if (location != null && location.isNotEmpty) formMap['location'] = location;
      if (description != null && description.isNotEmpty) formMap['description'] = description;

      final formData = FormData.fromMap(formMap);

      final response = await _client.dio.post(
        ApiConstants.aiGenerateDetails,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      final data = response.data;
      if (data != null) {
        final Map<String, dynamic> body = data is Map<String, dynamic>
            ? (data['data'] is Map<String, dynamic> ? data['data'] : data)
            : {};
        return AiValidationResult.fromJson(body);
      }
      return AiValidationResult(valid: false, message: 'AI Generation returned empty data');
    } on DioException catch (e) {
      return AiValidationResult(
        valid: false,
        message: e.response?.data?['message'] ?? 'AI Auto-fill failed. Please enter details manually.',
      );
    }
  }

  Future<double> calculatePriorityScore({
    required String severity,
    required int affectedPeople,
    required String category,
    required String description,
  }) async {
    try {
      final response = await _client.dio.post(
        ApiConstants.aiPriorityScore,
        data: {
          'severity': severity,
          'affectedPeople': affectedPeople,
          'category': category,
          'description': description,
        },
      );

      final data = response.data;
      if (data != null && data['data'] != null) {
        final score = data['data']['priorityScore'] ?? data['data']['score'];
        if (score != null) {
          return (score as num).toDouble();
        }
      }
      return 75.0;
    } catch (_) {
      return 70.0;
    }
  }
}
