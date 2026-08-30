import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/complaint_model.dart';

class ComplaintService {
  final ApiClient _client = ApiClient();

  Future<List<ComplaintModel>> getMyComplaints({int page = 0, int size = 30}) async {
    try {
      final response = await _client.dio.get(
        ApiConstants.myComplaints,
        queryParameters: {'page': page, 'size': size},
      );

      final data = response.data;
      final List<ComplaintModel> list = [];
      if (data != null && data['data'] != null) {
        final content = data['data'] is List 
            ? data['data'] 
            : (data['data']['content'] ?? []);
            
        for (final item in content) {
          list.add(ComplaintModel.fromJson(item));
        }
      }
      return list;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to load your complaints');
    }
  }

  Future<List<ComplaintModel>> getExploreComplaints({
    String? keyword,
    String? category,
    String? district,
    String? status,
    String? priority,
    int page = 0,
    int size = 50,
  }) async {
    try {
      final query = <String, dynamic>{
        'page': page,
        'size': size,
      };
      if (keyword != null && keyword.isNotEmpty) query['keyword'] = keyword;
      if (category != null && category.isNotEmpty) query['category'] = category;
      if (district != null && district.isNotEmpty) query['district'] = district;
      if (status != null && status.isNotEmpty) query['status'] = status;
      if (priority != null && priority.isNotEmpty) query['priority'] = priority;

      final response = await _client.dio.get(
        ApiConstants.exploreComplaints,
        queryParameters: query,
      );

      final data = response.data;
      final List<ComplaintModel> list = [];
      if (data != null && data['data'] != null) {
        final content = data['data'] is List 
            ? data['data'] 
            : (data['data']['content'] ?? []);
            
        for (final item in content) {
          list.add(ComplaintModel.fromJson(item));
        }
      }
      return list;
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to load community map data');
    }
  }

  Future<ComplaintModel> getComplaintById(int id) async {
    try {
      final response = await _client.dio.get('${ApiConstants.complaints}/$id');
      final data = response.data;
      if (data != null && data['data'] != null) {
        return ComplaintModel.fromJson(data['data']);
      }
      throw Exception('Complaint not found');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to load complaint details');
    }
  }

  Future<ComplaintModel> createComplaint(ComplaintModel complaint) async {
    try {
      final response = await _client.dio.post(
        ApiConstants.complaints,
        data: complaint.toJson(),
      );

      final data = response.data;
      if (data != null && data['data'] != null) {
        return ComplaintModel.fromJson(data['data']);
      }
      throw Exception('Failed to submit complaint');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Error submitting complaint');
    }
  }

  Future<void> cancelComplaint(int id) async {
    try {
      await _client.dio.delete('${ApiConstants.complaints}/$id');
    } on DioException catch (e) {
      throw Exception(e.response?.data?['message'] ?? 'Failed to cancel complaint');
    }
  }
}
