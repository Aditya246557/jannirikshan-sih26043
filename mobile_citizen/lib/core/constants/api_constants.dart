class ApiConstants {
  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  
  // Complaints
  static const String complaints = '/complaints';
  static const String myComplaints = '/complaints/mine';
  static const String exploreComplaints = '/complaints/explore';
  
  // Evidence
  static String uploadEvidence(int complaintId) => '/evidence/$complaintId/upload';
  static String getEvidence(int complaintId) => '/evidence/complaint/$complaintId';
  
  // AI
  static const String aiValidateImage = '/ai/validate-image';
  static const String aiGenerateDetails = '/ai/generate-complaint-details';
  static const String aiPriorityScore = '/ai/priority-score';
  
  // Citizen
  static const String citizenProfile = '/citizen/profile';
  
  // Notifications
  static const String notifications = '/notifications';
  static const String unreadCount = '/notifications/unread-count';
  static String markNotificationRead(int id) => '/notifications/$id/read';
  static const String markAllNotificationsRead = '/notifications/read-all';
  
  // Location
  static const String districts = '/locations/districts';
}
