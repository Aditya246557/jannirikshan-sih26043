import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';

class LocationDetails {
  final double latitude;
  final double longitude;
  final String address;
  final String district;
  final String state;

  LocationDetails({
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.district,
    required this.state,
  });
}

class LocationService {
  static final Dio _dio = Dio();

  static Future<LocationDetails> getCurrentLocation() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return _defaultLocation();
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return _defaultLocation();
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return _defaultLocation();
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 5),
        ),
      );

      String address = 'Lat: ${position.latitude.toStringAsFixed(4)}, Lon: ${position.longitude.toStringAsFixed(4)}';
      String district = 'Mumbai Suburban';
      String state = 'Maharashtra';

      try {
        final res = await _dio.get(
          'https://nominatim.openstreetmap.org/reverse',
          queryParameters: {
            'format': 'json',
            'lat': position.latitude,
            'lon': position.longitude,
            'zoom': 18,
            'addressdetails': 1,
          },
          options: Options(headers: {'User-Agent': 'JanNirikshan-Citizen-Mobile/1.0'}),
        );

        if (res.data != null && res.data['display_name'] != null) {
          address = res.data['display_name'] as String;
          final addr = res.data['address'] as Map<String, dynamic>?;
          if (addr != null) {
            district = (addr['state_district'] ?? addr['city'] ?? addr['county'] ?? district) as String;
            state = (addr['state'] ?? state) as String;
          }
        }
      } catch (_) {
        // Fallback already assigned
      }

      return LocationDetails(
        latitude: position.latitude,
        longitude: position.longitude,
        address: address,
        district: district,
        state: state,
      );
    } catch (_) {
      return _defaultLocation();
    }
  }

  static LocationDetails _defaultLocation() {
    return LocationDetails(
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Eastern Express Highway, Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
    );
  }
}
