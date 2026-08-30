import 'package:flutter/material.dart';

class AppColors {
  // Dark Background Palette
  static const Color background = Color(0xFF0B0D0F);
  static const Color surface = Color(0xFF14171A);
  static const Color surfaceLight = Color(0xFF1E2328);
  static const Color card = Color(0xFF16191E);
  static const Color border = Color(0xFF262C34);

  // JanNirikshan Brand Accents
  static const Color primary = Color(0xFFFFD21F); // Civic Amber
  static const Color primaryDark = Color(0xFFE5BC10);
  static const Color secondary = Color(0xFF38BDF8); // Ocean Cyan
  
  // Status & Priority Colors
  static const Color critical = Color(0xFFFF5C5C); // Critical Red
  static const Color high = Color(0xFFFF9800);     // High Orange
  static const Color medium = Color(0xFFFFD21F);   // Medium Amber
  static const Color low = Color(0xFF4CAF50);      // Low Green
  static const Color completed = Color(0xFF10B981);// Success Green
  static const Color inProgress = Color(0xFF3B82F6);// Blue
  static const Color submitted = Color(0xFF8B5CF6); // Purple
  
  // Text Colors
  static const Color textPrimary = Color(0xFFF5F5F2);
  static const Color textSecondary = Color(0xFF9EABB8);
  static const Color textMuted = Color(0xFF657382);
  
  // Helper for Priority Color
  static Color getPriorityColor(String? priority) {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return critical;
      case 'HIGH':
        return high;
      case 'MEDIUM':
        return medium;
      case 'LOW':
        return low;
      default:
        return medium;
    }
  }

  // Helper for Status Color
  static Color getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'RESOLVED':
        return completed;
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return inProgress;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return submitted;
      case 'REJECTED':
      case 'CANCELLED':
        return critical;
      default:
        return textSecondary;
    }
  }
}
