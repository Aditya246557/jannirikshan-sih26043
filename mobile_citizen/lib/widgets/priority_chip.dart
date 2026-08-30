import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

class PriorityChip extends StatelessWidget {
  final String? priority;
  final double fontSize;

  const PriorityChip({
    super.key,
    required this.priority,
    this.fontSize = 11,
  });

  @override
  Widget build(BuildContext context) {
    final color = AppColors.getPriorityColor(priority);
    final displayPriority = (priority ?? 'MEDIUM').toUpperCase();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3), width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getPriorityIcon(displayPriority),
            size: fontSize + 2,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            displayPriority,
            style: TextStyle(
              color: color,
              fontSize: fontSize,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getPriorityIcon(String priority) {
    switch (priority) {
      case 'CRITICAL':
        return Icons.warning_rounded;
      case 'HIGH':
        return Icons.arrow_upward_rounded;
      case 'MEDIUM':
        return Icons.remove_rounded;
      case 'LOW':
        return Icons.arrow_downward_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }
}
