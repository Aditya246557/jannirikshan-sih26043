import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../models/complaint_model.dart';
import '../../providers/ai_provider.dart';
import '../../providers/complaint_provider.dart';
import '../../services/location_service.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../details/complaint_detail_screen.dart';

class SubmitComplaintScreen extends StatefulWidget {
  const SubmitComplaintScreen({super.key});

  @override
  State<SubmitComplaintScreen> createState() => _SubmitComplaintScreenState();
}

class _SubmitComplaintScreenState extends State<SubmitComplaintScreen> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();

  File? _selectedImage;
  bool _isAutoFilling = false;
  bool _isLocating = false;

  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _outcomeController = TextEditingController();
  final _peopleController = TextEditingController(text: '500');
  final _addressController = TextEditingController();
  final _districtController = TextEditingController(text: 'Mumbai Suburban');
  final _stateController = TextEditingController(text: 'Maharashtra');

  String _category = 'Roads & Infrastructure';
  String _severity = 'HIGH';
  double _latitude = 19.0760;
  double _longitude = 72.8777;

  final List<String> _categories = [
    'Roads & Infrastructure',
    'Environment & Emergency Clearance',
    'Electrical & Public Lighting',
    'Water Management',
    'Sanitation & Waste',
    'General Civic Defect',
  ];

  final List<String> _severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  @override
  void initState() {
    super.initState();
    _fetchCurrentLocation();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _outcomeController.dispose();
    _peopleController.dispose();
    _addressController.dispose();
    _districtController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _fetchCurrentLocation() async {
    setState(() => _isLocating = true);
    final loc = await LocationService.getCurrentLocation();
    setState(() {
      _latitude = loc.latitude;
      _longitude = loc.longitude;
      _addressController.text = loc.address;
      _districtController.text = loc.district;
      _stateController.text = loc.state;
      _isLocating = false;
    });
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1920,
      );

      if (picked != null) {
        setState(() {
          _selectedImage = File(picked.path);
        });

        // Trigger AI Onboard Computer Vision Analysis
        if (mounted) {
          final aiProv = Provider.of<AiProvider>(context, listen: false);
          aiProv.analyzeImage(_selectedImage!);
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to capture image: $e'), backgroundColor: AppColors.critical),
        );
      }
    }
  }

  Future<void> _autoFillWithAi() async {
    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please capture or select a photo of the defect first.'),
          backgroundColor: AppColors.high,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isAutoFilling = true);
    final aiProv = Provider.of<AiProvider>(context, listen: false);
    final result = await aiProv.autoFillDetails(
      _selectedImage!,
      location: _addressController.text,
      description: _descController.text,
    );
    setState(() => _isAutoFilling = false);

    if (result != null && result.details != null) {
      final d = result.details!;
      setState(() {
        _titleController.text = d.title;
        _descController.text = d.description;
        _outcomeController.text = d.desiredOutcome;
        _peopleController.text = d.affectedPopulation.toString();
        if (_categories.contains(d.category)) {
          _category = d.category;
        }
        if (_severities.contains(d.severity.toUpperCase())) {
          _severity = d.severity.toUpperCase();
        }
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Form populated with AI defect analysis!'),
            backgroundColor: AppColors.completed,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please attach a photo of the civic defect as evidence.'),
          backgroundColor: AppColors.critical,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final complaint = ComplaintModel(
      id: 0,
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      category: _category,
      severity: _severity,
      priority: _severity,
      status: 'SUBMITTED',
      latitude: _latitude,
      longitude: _longitude,
      address: _addressController.text.trim(),
      district: _districtController.text.trim(),
      state: _stateController.text.trim(),
      affectedPeople: int.tryParse(_peopleController.text.trim()) ?? 500,
      desiredEngineeringOutcome: _outcomeController.text.trim().isNotEmpty
          ? _outcomeController.text.trim()
          : 'Sustainable engineering resolution via University R&D',
    );

    final complaintProv = Provider.of<ComplaintProvider>(context, listen: false);
    final created = await complaintProv.submitComplaintWithEvidence(
      complaint: complaint,
      evidenceFiles: [_selectedImage!],
    );

    if (!mounted) return;

    if (created != null && created.id > 0) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.card,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: AppColors.completed, size: 28),
              SizedBox(width: 10),
              Text(
                'Complaint Submitted!',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Complaint #${created.id} has been registered into the JanNirikshan national civic pipeline.',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 12),
              const Text(
                'AI Pipeline Active:\n• YOLOv8 Defect Classification\n• Severity Scoring\n• University Lab Matching',
                style: TextStyle(color: AppColors.primary, fontSize: 12, height: 1.5),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx); // Close dialog
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ComplaintDetailScreen(complaintId: created.id),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('View Complaint Dossier', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(complaintProv.errorMessage ?? 'Submission failed'),
          backgroundColor: AppColors.critical,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final aiProv = context.watch<AiProvider>();
    final complaintProv = context.watch<ComplaintProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'Report Civic Challenge',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo Evidence Card with AI Analysis
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Photo Evidence (Required)',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'YOLOv8 Real-time',
                          style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    if (_selectedImage == null)
                      Row(
                        children: [
                          Expanded(
                            child: InkWell(
                              onTap: () => _pickImage(ImageSource.camera),
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                height: 100,
                                decoration: BoxDecoration(
                                  color: AppColors.card,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.primary.withOpacity(0.3), width: 1.5),
                                ),
                                child: const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.camera_alt_rounded, color: AppColors.primary, size: 28),
                                    SizedBox(height: 6),
                                    Text(
                                      'Take Photo',
                                      style: TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: InkWell(
                              onTap: () => _pickImage(ImageSource.gallery),
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                height: 100,
                                decoration: BoxDecoration(
                                  color: AppColors.card,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.photo_library_outlined, color: AppColors.textSecondary, size: 28),
                                    SizedBox(height: 6),
                                    Text(
                                      'Upload Gallery',
                                      style: TextStyle(
                                        color: AppColors.textSecondary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      )
                    else
                      Column(
                        children: [
                          Stack(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.file(
                                  _selectedImage!,
                                  height: 180,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Positioned(
                                top: 8,
                                right: 8,
                                child: CircleAvatar(
                                  radius: 18,
                                  backgroundColor: Colors.black.withOpacity(0.7),
                                  child: IconButton(
                                    icon: const Icon(Icons.refresh_rounded, size: 18, color: Colors.white),
                                    onPressed: () => _pickImage(ImageSource.camera),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // AI Live Feedback Bar
                          if (aiProv.isAnalyzing)
                            const Row(
                              children: [
                                SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                                ),
                                SizedBox(width: 10),
                                Text(
                                  'YOLOv8 Model running vision inference...',
                                  style: TextStyle(color: AppColors.primary, fontSize: 12),
                                ),
                              ],
                            )
                          else if (aiProv.validationResult != null)
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.primary.withOpacity(0.4)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 18),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      aiProv.validationResult!.primaryDetection != null
                                          ? 'Detected: ${aiProv.validationResult!.primaryDetection!.toUpperCase()} (${((aiProv.validationResult!.confidence ?? 0.85) * 100).toStringAsFixed(1)}% Confidence)'
                                          : 'Defect pattern verified by AI engine',
                                      style: const TextStyle(
                                        color: AppColors.primary,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // AI Auto Fill Action Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isAutoFilling ? null : _autoFillWithAi,
                  icon: _isAutoFilling
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                        )
                      : const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 18),
                  label: Text(
                    _isAutoFilling ? 'AI Auto-Drafting...' : '✨ One-Tap AI Auto-Fill Form',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.primary, width: 1.2),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Form Inputs
              CustomTextField(
                controller: _titleController,
                label: 'Challenge Title',
                hint: 'e.g. Severe Road Asphalt Crater near Junction',
                validator: (val) => val == null || val.trim().isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 14),

              CustomTextField(
                controller: _descController,
                label: 'Defect Description & Context',
                hint: 'Describe the civic defect, duration, and safety hazard...',
                maxLines: 3,
                validator: (val) => val == null || val.trim().isEmpty ? 'Description is required' : null,
              ),
              const SizedBox(height: 14),

              // Category & Severity Dropdowns
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Category',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _category,
                              isExpanded: true,
                              dropdownColor: AppColors.card,
                              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                              items: _categories.map((c) {
                                return DropdownMenuItem(value: c, child: Text(c, overflow: TextOverflow.ellipsis));
                              }).toList(),
                              onChanged: (v) {
                                if (v != null) setState(() => _category = v);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Severity',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _severity,
                              isExpanded: true,
                              dropdownColor: AppColors.card,
                              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                              items: _severities.map((s) {
                                return DropdownMenuItem(
                                  value: s,
                                  child: Text(
                                    s,
                                    style: TextStyle(
                                      color: AppColors.getPriorityColor(s),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                );
                              }).toList(),
                              onChanged: (v) {
                                if (v != null) setState(() => _severity = v);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              CustomTextField(
                controller: _outcomeController,
                label: 'Desired Engineering Outcome',
                hint: 'e.g. Geopolymer cold-mix durable asphalt repair',
              ),
              const SizedBox(height: 14),

              CustomTextField(
                controller: _peopleController,
                label: 'Estimated Affected Citizens',
                hint: '500',
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 18),

              // Location Section Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.location_on_rounded, color: AppColors.primary, size: 18),
                            SizedBox(width: 6),
                            Text(
                              'Defect Coordinates (GPS)',
                              style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        TextButton.icon(
                          onPressed: _isLocating ? null : _fetchCurrentLocation,
                          icon: _isLocating
                              ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                              : const Icon(Icons.my_location_rounded, size: 14, color: AppColors.primary),
                          label: const Text('Refresh GPS', style: TextStyle(color: AppColors.primary, fontSize: 11)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    CustomTextField(
                      controller: _addressController,
                      label: 'Street / Landmark Address',
                      hint: 'Eastern Express Highway, Mumbai',
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: CustomTextField(
                            controller: _districtController,
                            label: 'District',
                            hint: 'Mumbai Suburban',
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: CustomTextField(
                            controller: _stateController,
                            label: 'State',
                            hint: 'Maharashtra',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Submit Button
              CustomButton(
                text: 'Submit Challenge to Platform',
                icon: Icons.send_rounded,
                isLoading: complaintProv.isSubmitting,
                onPressed: _handleSubmit,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
