import 'package:dio/dio.dart';
import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/user_model.dart';

class AuthService {
  final ApiClient _client = ApiClient();

  Future<UserModel> login(String email, String password) async {
    try {
      final response = await _client.dio.post(
        ApiConstants.login,
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      final data = response.data;
      if (data != null && data['success'] == true && data['data'] != null) {
        final userData = data['data'];
        final token = userData['token'] as String?;
        if (token != null) {
          await ApiClient.saveToken(token);
        }
        return UserModel.fromJson(userData, token: token);
      }
      throw Exception(data?['message'] ?? 'Login failed');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Invalid credentials';
      throw Exception(msg);
    }
  }

  Future<UserModel> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final response = await _client.dio.post(
        ApiConstants.register,
        data: {
          'name': name.trim(),
          'email': email.trim().toLowerCase(),
          'password': password,
          'role': 'CITIZEN',
          if (phone != null) 'phoneNumber': phone,
        },
      );

      final data = response.data;
      if (data != null && data['success'] == true && data['data'] != null) {
        final userData = data['data'];
        final token = userData['token'] as String?;
        if (token != null) {
          await ApiClient.saveToken(token);
        }
        return UserModel.fromJson(userData, token: token);
      }
      throw Exception(data?['message'] ?? 'Registration failed');
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Registration failed';
      throw Exception(msg);
    }
  }

  Future<UserModel?> getProfile() async {
    try {
      final response = await _client.dio.get(ApiConstants.me);
      final data = response.data;
      if (data != null && data['success'] == true && data['data'] != null) {
        return UserModel.fromJson(data['data']);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    await ApiClient.clearToken();
  }
}
