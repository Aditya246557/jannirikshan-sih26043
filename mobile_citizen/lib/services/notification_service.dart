import '../core/constants/api_constants.dart';
import '../core/network/api_client.dart';
import '../models/notification_model.dart';

class NotificationService {
  final ApiClient _client = ApiClient();

  Future<List<NotificationModel>> getNotifications({int page = 0, int size = 30}) async {
    try {
      final response = await _client.dio.get(
        ApiConstants.notifications,
        queryParameters: {'page': page, 'size': size},
      );

      final data = response.data;
      final List<NotificationModel> list = [];
      if (data != null && data['data'] != null) {
        final content = data['data'] is List 
            ? data['data'] 
            : (data['data']['content'] ?? []);
        for (final item in content) {
          list.add(NotificationModel.fromJson(item));
        }
      }
      return list;
    } catch (_) {
      return [];
    }
  }

  Future<int> getUnreadCount() async {
    try {
      final response = await _client.dio.get(ApiConstants.unreadCount);
      final data = response.data;
      if (data != null && data['data'] != null) {
        return (data['data']['unreadCount'] as num?)?.toInt() ?? 0;
      }
      return 0;
    } catch (_) {
      return 0;
    }
  }

  Future<void> markAsRead(int id) async {
    try {
      await _client.dio.patch(ApiConstants.markNotificationRead(id));
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await _client.dio.post(ApiConstants.markAllNotificationsRead);
    } catch (_) {}
  }
}
