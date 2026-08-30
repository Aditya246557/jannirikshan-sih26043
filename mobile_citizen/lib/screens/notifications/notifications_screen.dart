import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/notification_model.dart';
import '../../providers/notification_provider.dart';
import '../details/complaint_detail_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<NotificationProvider>(context, listen: false).fetchNotifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final notifProv = context.watch<NotificationProvider>();
    final list = notifProv.notifications;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (list.isNotEmpty)
            TextButton(
              onPressed: () => notifProv.markAllRead(),
              child: const Text('Mark All Read', style: TextStyle(color: AppColors.primary, fontSize: 13)),
            ),
        ],
      ),
      body: notifProv.isLoading && list.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : list.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_off_outlined, size: 50, color: AppColors.textMuted),
                      const SizedBox(height: 12),
                      const Text(
                        'No notifications yet.',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => notifProv.fetchNotifications(),
                  color: AppColors.primary,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: list.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (ctx, idx) {
                      final item = list[idx];
                      return _notificationItem(item, notifProv);
                    },
                  ),
                ),
    );
  }

  Widget _notificationItem(NotificationModel item, NotificationProvider prov) {
    return InkWell(
      onTap: () {
        if (!item.read) prov.markRead(item.id);
        if (item.entityId != null) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ComplaintDetailScreen(complaintId: item.entityId!),
            ),
          );
        }
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: item.read ? AppColors.surface : AppColors.primary.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: item.read ? AppColors.border : AppColors.primary.withOpacity(0.35),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: item.read ? AppColors.card : AppColors.primary.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getIconForType(item.type),
                color: item.read ? AppColors.textSecondary : AppColors.primary,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 13,
                      fontWeight: item.read ? FontWeight.w600 : FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.message,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForType(String? type) {
    switch (type?.toUpperCase()) {
      case 'UNIVERSITY_ASSIGNED':
        return Icons.school_rounded;
      case 'STATUS_CHANGED':
        return Icons.published_with_changes_rounded;
      case 'PROJECT_COMPLETED':
        return Icons.task_alt_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }
}
