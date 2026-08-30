import 'dart:io';
import 'package:flutter/material.dart';
import '../models/complaint_model.dart';
import '../models/evidence_model.dart';
import '../services/complaint_service.dart';
import '../services/evidence_service.dart';

class ComplaintProvider extends ChangeNotifier {
  final ComplaintService _complaintService = ComplaintService();
  final EvidenceService _evidenceService = EvidenceService();

  List<ComplaintModel> _myComplaints = [];
  List<ComplaintModel> _exploreComplaints = [];
  ComplaintModel? _selectedComplaint;
  List<EvidenceModel> _selectedEvidence = [];
  
  bool _isLoading = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  List<ComplaintModel> get myComplaints => _myComplaints;
  List<ComplaintModel> get exploreComplaints => _exploreComplaints;
  ComplaintModel? get selectedComplaint => _selectedComplaint;
  List<EvidenceModel> get selectedEvidence => _selectedEvidence;
  bool get isLoading => _isLoading;
  bool get isSubmitting => _isSubmitting;
  String? get errorMessage => _errorMessage;

  // Filtered lists
  List<ComplaintModel> get submittedComplaints => 
      _myComplaints.where((c) => c.status.toUpperCase() == 'SUBMITTED' || c.status.toUpperCase() == 'UNDER_REVIEW').toList();
      
  List<ComplaintModel> get inProgressComplaints => 
      _myComplaints.where((c) => c.status.toUpperCase() == 'IN_PROGRESS' || c.status.toUpperCase() == 'ASSIGNED').toList();
      
  List<ComplaintModel> get completedComplaints => 
      _myComplaints.where((c) => c.status.toUpperCase() == 'COMPLETED' || c.status.toUpperCase() == 'RESOLVED').toList();

  Future<void> fetchMyComplaints() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _myComplaints = await _complaintService.getMyComplaints();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchExploreComplaints() async {
    try {
      _exploreComplaints = await _complaintService.getExploreComplaints();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> loadComplaintDetails(int id) async {
    _isLoading = true;
    _selectedComplaint = null;
    _selectedEvidence = [];
    notifyListeners();

    try {
      _selectedComplaint = await _complaintService.getComplaintById(id);
      _selectedEvidence = await _evidenceService.getEvidenceForComplaint(id);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<ComplaintModel?> submitComplaintWithEvidence({
    required ComplaintModel complaint,
    required List<File> evidenceFiles,
  }) async {
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Create Complaint
      final created = await _complaintService.createComplaint(complaint);
      
      // 2. Upload Evidence if available
      if (evidenceFiles.isNotEmpty && created.id > 0) {
        try {
          await _evidenceService.uploadEvidence(
            complaintId: created.id,
            files: evidenceFiles,
            latitude: complaint.latitude,
            longitude: complaint.longitude,
          );
        } catch (e) {
          // Evidence upload error logged but complaint is created
        }
      }

      // Refresh list
      await fetchMyComplaints();
      await fetchExploreComplaints();

      _isSubmitting = false;
      notifyListeners();
      return created;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isSubmitting = false;
      notifyListeners();
      return null;
    }
  }
}
