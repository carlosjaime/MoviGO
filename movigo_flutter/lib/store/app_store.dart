import 'package:flutter/foundation.dart';
import '../types/types.dart';

class ActiveRide {
  final int rideId;
  final String verificationCode;
  final RidePhase status;
  final int? driverId;
  final String? originAddress;
  final String? destinationAddress;

  ActiveRide({
    required this.rideId,
    required this.verificationCode,
    required this.status,
    this.driverId,
    this.originAddress,
    this.destinationAddress,
  });
}

class LocationStore extends ChangeNotifier {
  double? _userLatitude;
  double? _userLongitude;
  String? _userAddress;
  double? _destinationLatitude;
  double? _destinationLongitude;
  String? _destinationAddress;

  double? get userLatitude => _userLatitude;
  double? get userLongitude => _userLongitude;
  String? get userAddress => _userAddress;
  double? get destinationLatitude => _destinationLatitude;
  double? get destinationLongitude => _destinationLongitude;
  String? get destinationAddress => _destinationAddress;

  void setUserLocation({
    required double latitude,
    required double longitude,
    required String address,
  }) {
    _userLatitude = latitude;
    _userLongitude = longitude;
    _userAddress = address;
    notifyListeners();

    // Clear selected driver when location changes
    // This would need access to driver store in a real implementation
  }

  void setDestinationLocation({
    required double latitude,
    required double longitude,
    required String address,
  }) {
    _destinationLatitude = latitude;
    _destinationLongitude = longitude;
    _destinationAddress = address;
    notifyListeners();

    // Clear selected driver when destination changes
    // This would need access to driver store in a real implementation
  }
}

class DriverStore extends ChangeNotifier {
  List<MarkerData> _drivers = [];
  int? _selectedDriver;

  List<MarkerData> get drivers => _drivers;
  int? get selectedDriver => _selectedDriver;

  void setSelectedDriver(int driverId) {
    _selectedDriver = driverId;
    notifyListeners();
  }

  void setDrivers(List<MarkerData> drivers) {
    _drivers = drivers;
    notifyListeners();
  }

  void clearSelectedDriver() {
    _selectedDriver = null;
    notifyListeners();
  }
}

class RideStore extends ChangeNotifier {
  ActiveRide? _activeRide;

  ActiveRide? get activeRide => _activeRide;

  void setActiveRide(ActiveRide ride) {
    _activeRide = ride;
    notifyListeners();
  }

  void setRideStatus(RidePhase status) {
    if (_activeRide != null) {
      _activeRide = ActiveRide(
        rideId: _activeRide!.rideId,
        verificationCode: _activeRide!.verificationCode,
        status: status,
        driverId: _activeRide!.driverId,
        originAddress: _activeRide!.originAddress,
        destinationAddress: _activeRide!.destinationAddress,
      );
      notifyListeners();
    }
  }

  void clearActiveRide() {
    _activeRide = null;
    notifyListeners();
  }
}
