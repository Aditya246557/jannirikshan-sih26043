import 'package:shared_preferences/shared_preferences.dart';

class HostConfig {
  static const String _keyBaseUrl = 'jannirikshan_base_url';
  
  // Standard Presets
  static const String emulatorBaseUrl = 'http://10.0.2.2:8080/api';
  static const String localhostBaseUrl = 'http://127.0.0.1:8080/api';
  
  static String _currentBaseUrl = emulatorBaseUrl;
  
  static String get baseUrl => _currentBaseUrl;
  
  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _currentBaseUrl = prefs.getString(_keyBaseUrl) ?? emulatorBaseUrl;
  }
  
  static Future<void> setBaseUrl(String newUrl) async {
    _currentBaseUrl = newUrl.trim();
    if (_currentBaseUrl.endsWith('/')) {
      _currentBaseUrl = _currentBaseUrl.substring(0, _currentBaseUrl.length - 1);
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyBaseUrl, _currentBaseUrl);
  }
  
  static String getFileUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Convert relative path to full server URL
    final root = _currentBaseUrl.replaceAll('/api', '');
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return '$root$cleanPath';
  }
}
