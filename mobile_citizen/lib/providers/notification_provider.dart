import 'package:flutter/material.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  final NotificationService _service = NotificationService();

  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  Future<void> fetchNotifications() async {
    _isLoading = true;
    notifyListeners();

    try {
      _notifications = await _service.getNotifications();
      _unreadCount = await _service.getUnreadCount();
      _isLoading = false;
      notifyListeners();
    } catch (_) {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> markRead(int id) async {
    await _service.markAsRead(id);
    _unreadCount = (_unreadCount - 1).clamp(0, 999);
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      final old = _notifications[idx];
      _notifications[idx] = NotificationModel(
        id: old.id,
        title: old.title,
        message: old.message,
        type: old.type,
        read: true,
        createdAt: old.createdAt,
        entityId: old.entityId,
      );
    }
    notifyListeners();
  }

  Future<void> markAllRead() async {
    await _service.markAllAsRead();
    _unreadCount = 0;
    _notifications = _notifications.map((n) => NotificationModel(
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: true,
      createdAt: n.createdAt,
      entityId: n.entityId,
    )).toList();
    notifyListeners();
  }
}
