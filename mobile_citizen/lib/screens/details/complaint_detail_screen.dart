import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../models/complaint_model.dart';
import '../../models/evidence_model.dart';
import '../../providers/complaint_provider.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/priority_chip.dart';

class ComplaintDetailScreen extends StatefulWidget {
  final int complaintId;

  const ComplaintDetailScreen({super.key, required this.complaintId});

  @override
  State<ComplaintDetailScreen> createState() => _ComplaintDetailScreenState();
}

class _ComplaintDetailScreenState extends State<ComplaintDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ComplaintProvider>(context, listen: false).loadComplaintDetails(widget.complaintId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final complaintProv = context.watch<ComplaintProvider>();
    final complaint = complaintProv.selectedComplaint;
    final evidenceList = complaintProv.selectedEvidence;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'Dossier #${widget.complaintId}',
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: complaintProv.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : complaint == null
              ? const Center(
                  child: Text(
                    'Complaint details not available',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => complaintProv.loadComplaintDetails(widget.complaintId),
                  color: AppColors.primary,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Status & Priority Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            StatusBadge(status: complaint.status),
                            PriorityChip(priority: complaint.priority),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Title
                        Text(
                          complaint.title,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            height: 1.3,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Lifecycle Pipeline Tracker Card
                        _lifecyclePipelineCard(complaint.status),
                        const SizedBox(height: 16),

                        // Evidence Gallery Card
                        if (evidenceList.isNotEmpty) ...[
                          _evidenceGalleryCard(evidenceList),
                          const SizedBox(height: 16),
                        ],

                        // AI Analysis & Telemetry Card
                        _aiAnalysisCard(complaint),
                        const SizedBox(height: 16),

                        // University & Project Card (If Assigned)
                        if (complaint.assignedUniversityName != null || complaint.assignedUniversityId != null) ...[
                          _universityRndCard(complaint),
                          const SizedBox(height: 16),
                        ],

                        // Details & Description Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Problem Description',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                complaint.description,
                                style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, height: 1.4),
                              ),
                              if (complaint.desiredEngineeringOutcome != null && complaint.desiredEngineeringOutcome!.isNotEmpty) ...[
                                const SizedBox(height: 14),
                                const Text(
                                  'Desired Engineering Outcome',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  complaint.desiredEngineeringOutcome!,
                                  style: const TextStyle(color: AppColors.primary, fontSize: 13, height: 1.4),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Location Card
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.location_on_rounded, color: AppColors.primary, size: 18),
                                  SizedBox(width: 6),
                                  Text(
                                    'Defect Location & Geocoding',
                                    style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                complaint.address ?? 'Eastern Express Highway, Mumbai',
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'District: ${complaint.district ?? "Mumbai Suburban"}  •  State: ${complaint.state ?? "Maharashtra"}',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'GPS: (${complaint.latitude.toStringAsFixed(5)}, ${complaint.longitude.toStringAsFixed(5)})',
                                style: const TextStyle(color: AppColors.primary, fontSize: 12, fontFamily: 'monospace'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _lifecyclePipelineCard(String status) {
    final steps = ['SUBMITTED', 'ASSIGNED', 'IN PROGRESS', 'COMPLETED'];
    final normalized = status.replaceAll('_', ' ').toUpperCase();
    int currentStep = 0;
    if (normalized.contains('ASSIGN') || normalized.contains('REVIEW')) currentStep = 1;
    if (normalized.contains('PROGRESS') || normalized.contains('DEVELOPMENT') || normalized.contains('PROTOTYPE')) currentStep = 2;
    if (normalized.contains('COMPLETE') || normalized.contains('RESOLVE') || normalized.contains('IMPACT')) currentStep = 3;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Civic Challenge Lifecycle',
            style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(steps.length, (idx) {
              final isDone = idx <= currentStep;
              final isCurrent = idx == currentStep;
              return Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: isDone ? AppColors.primary : AppColors.card,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isDone ? AppColors.primary : AppColors.border,
                          width: isCurrent ? 2 : 1,
                        ),
                      ),
                      child: Center(
                        child: isDone
                            ? const Icon(Icons.check, size: 14, color: Colors.black)
                            : Text('${idx + 1}', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                      ),
                    ),
                    if (idx < steps.length - 1)
                      Expanded(
                        child: Container(
                          height: 2,
                          color: idx < currentStep ? AppColors.primary : AppColors.border,
                        ),
                      ),
                  ],
                ),
              );
            }),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _stepLabel('Submitted', currentStep >= 0),
              _stepLabel('Assigned', currentStep >= 1),
              _stepLabel('R&D Progress', currentStep >= 2),
              _stepLabel('Resolved', currentStep >= 3),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stepLabel(String text, bool active) {
    return Text(
      text,
      style: TextStyle(
        color: active ? AppColors.primary : AppColors.textMuted,
        fontSize: 10,
        fontWeight: active ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  Widget _evidenceGalleryCard(List<EvidenceModel> evidenceList) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Defect Photographic Evidence',
            style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 130,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: evidenceList.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (ctx, idx) {
                final ev = evidenceList[idx];
                final url = ev.fullUrl;

                return ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 130,
                    color: AppColors.card,
                    child: CachedNetworkImage(
                      imageUrl: url,
                      fit: BoxFit.cover,
                      placeholder: (ctx, _) => const Center(
                        child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary)),
                      ),
                      errorWidget: (ctx, _, __) => const Center(
                        child: Icon(Icons.broken_image_rounded, color: AppColors.textMuted, size: 32),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _aiAnalysisCard(ComplaintModel c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withOpacity(0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.psychology_alt_rounded, color: AppColors.primary, size: 20),
              SizedBox(width: 8),
              Text(
                'AI Computer Vision & Priority Telemetry',
                style: TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _aiMetricItem('Domain Category', c.category),
              _aiMetricItem('AI Severity', c.severity ?? 'CRITICAL'),
              _aiMetricItem('Priority Score', '${c.priorityScore?.toStringAsFixed(1) ?? "85.0"}/100'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _aiMetricItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _universityRndCard(ComplaintModel c) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.inProgress.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.inProgress.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.inProgress.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.school_rounded, color: AppColors.inProgress, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Assigned University R&D Hub',
                  style: TextStyle(color: AppColors.inProgress, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 2),
                Text(
                  c.assignedUniversityName ?? 'IIT Bombay Innovation Cell',
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                if (c.projectId != null)
                  Text(
                    'Active Research Project #${c.projectId}',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
