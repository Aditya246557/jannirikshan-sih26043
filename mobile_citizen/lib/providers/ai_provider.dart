import 'dart:io';
import 'package:flutter/material.dart';
import '../models/ai_analysis_model.dart';
import '../services/ai_service.dart';

class AiProvider extends ChangeNotifier {
  final AiService _aiService = AiService();

  bool _isAnalyzing = false;
  AiValidationResult? _validationResult;
  String? _errorMessage;

  bool get isAnalyzing => _isAnalyzing;
  AiValidationResult? get validationResult => _validationResult;
  String? get errorMessage => _errorMessage;

  Future<AiValidationResult?> analyzeImage(File file) async {
    _isAnalyzing = true;
    _errorMessage = null;
    _validationResult = null;
    notifyListeners();

    try {
      final result = await _aiService.validateImage(file);
      _validationResult = result;
      _isAnalyzing = false;
      notifyListeners();
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      _isAnalyzing = false;
      notifyListeners();
      return null;
    }
  }

  Future<AiValidationResult?> autoFillDetails(File file, {String? location, String? description}) async {
    _isAnalyzing = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _aiService.generateComplaintDetails(
        file,
        location: location,
        description: description,
      );
      _validationResult = result;
      _isAnalyzing = false;
      notifyListeners();
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      _isAnalyzing = false;
      notifyListeners();
      return null;
    }
  }

  void reset() {
    _validationResult = null;
    _isAnalyzing = false;
    _errorMessage = null;
    notifyListeners();
  }
}
