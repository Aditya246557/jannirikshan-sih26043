# Mobile Application Architecture — Flutter (Android)

## 1. Overview
The JanNirikshan Citizen Mobile App is a cross-platform Flutter application built with Dart SDK ^3.13.2.

## 2. Directory Structure
```
mobile_citizen/lib/
├── main.dart                 # Application entry point & MultiProvider initialization
├── core/
│   ├── network/
│   │   ├── host_config.dart  # Dynamic IP & Host switcher (10.0.2.2 vs LAN)
│   │   └── api_client.dart   # Central Dio HTTP client with Bearer interceptor
│   └── constants/
│       ├── api_constants.dart# API endpoint definitions
│       └── app_colors.dart   # Civic theme color palette
├── models/                   # User, Complaint, Evidence, Notification, AiAnalysis
├── providers/                # AuthProvider, ComplaintProvider, AiProvider, NotificationProvider
├── services/                 # AuthService, ComplaintService, AiService, LocationService
├── screens/                  # LoginScreen, HomeScreen tabs, SubmitComplaintScreen, DetailScreen
└── widgets/                  # StatusBadge, PriorityChip, NetworkSwitcherDialog
```

## 3. Key Mobile Workflows
- **One-Tap AI Auto-Fill**: Citizen picks an image; the app triggers YOLOv8 vision inference to auto-populate the title, description, category, and severity.
- **GPS Location**: Uses `geolocator` to retrieve fine GPS coordinates with Android permission handlers.
- **Offline & Cache**: Uses `cached_network_image` and `shared_preferences` for reliable user sessions.
