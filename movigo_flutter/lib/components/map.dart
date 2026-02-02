import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import '../store/app_store.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _controller;
  LatLng? _currentPosition;
  final Set<Marker> _markers = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    try {
      // Check location permissions
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => _isLoading = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => _isLoading = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() => _isLoading = false);
        return;
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      );

      setState(() {
        _currentPosition = LatLng(position.latitude, position.longitude);
        _markers.addAll(_buildNearbyTaxiMarkers(_currentPosition!));
        _isLoading = false;
      });

      // Update store
      if (mounted) {
        final locationStore = context.read<LocationStore>();
        locationStore.setUserLocation(
          latitude: position.latitude,
          longitude: position.longitude,
          address: "Ubicación actual", // This would be reverse geocoded
        );
      }
    } catch (e) {
      debugPrint("Error getting location: $e");
      setState(() => _isLoading = false);
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    _controller = controller;
    
    // Move camera to current position
    if (_currentPosition != null) {
      _controller?.animateCamera(
        CameraUpdate.newLatLngZoom(_currentPosition!, 15),
      );
    }
  }

  void _onMapTap(LatLng position) {
    // Handle map tap - could be used for destination selection
    setState(() {
      _markers.removeWhere(
        (marker) => marker.markerId.value == 'destination',
      );
      _markers.add(
        Marker(
          markerId: const MarkerId('destination'),
          position: position,
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
          infoWindow: const InfoWindow(title: 'Destino'),
        ),
      );
    });

    // Update store
    if (mounted) {
      final locationStore = context.read<LocationStore>();
      locationStore.setDestinationLocation(
        latitude: position.latitude,
        longitude: position.longitude,
        address: "Ubicación seleccionada", // This would be reverse geocoded
      );
    }
  }

  Set<Marker> _buildNearbyTaxiMarkers(LatLng origin) {
    const offsets = [
      Offset(0.0012, 0.0010),
      Offset(-0.0014, 0.0008),
      Offset(0.0006, -0.0015),
      Offset(-0.0010, -0.0012),
      Offset(0.0016, -0.0006),
    ];

    return offsets.asMap().entries.map((entry) {
      final index = entry.key;
      final offset = entry.value;
      return Marker(
        markerId: MarkerId('taxi_$index'),
        position: LatLng(
          origin.latitude + offset.dy,
          origin.longitude + offset.dx,
        ),
        icon: BitmapDescriptor.defaultMarkerWithHue(
          BitmapDescriptor.hueAzure,
        ),
        infoWindow: const InfoWindow(title: 'Taxi disponible'),
      );
    }).toSet();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return GoogleMap(
      onMapCreated: _onMapCreated,
      onTap: _onMapTap,
      initialCameraPosition: CameraPosition(
        target: _currentPosition ?? const LatLng(37.7749, -122.4194), // Default to SF
        zoom: 15,
      ),
      markers: _markers,
      myLocationEnabled: true,
      myLocationButtonEnabled: true,
      compassEnabled: true,
      zoomControlsEnabled: true,
      zoomGesturesEnabled: true,
      scrollGesturesEnabled: true,
      rotateGesturesEnabled: true,
      tiltGesturesEnabled: true,
    );
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }
}
