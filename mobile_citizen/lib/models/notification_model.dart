class NotificationModel {
  final int id;
  final String title;
  final String message;
  final String? type;
  final bool read;
  final DateTime? createdAt;
  final int? entityId;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    this.type,
    required this.read,
    this.createdAt,
    this.entityId,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Notification',
      message: json['message'] ?? '',
      type: json['type'],
      read: json['read'] == true,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      entityId: json['entityId'],
    );
  }
}
