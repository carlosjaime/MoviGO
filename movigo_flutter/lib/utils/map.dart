import 'package:flutter/foundation.dart';
import 'dart:math';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../types/types.dart';
import '../constants/config.dart';

List<MarkerData> generateMarkersFromData({
  required List<Driver> data,
  required double userLatitude,
  required double userLongitude,
}) {
  final random = Random();
  return data.map((driver) {
    final latOffset = (random.nextDouble() - 0.5) * 0.01;
    final lngOffset = (random.nextDouble() - 0.5) * 0.01;

    return MarkerData(
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      id: driver.id,
      title: "${driver.firstName} ${driver.lastName}",
      profileImageUrl: driver.profileImageUrl,
      carImageUrl: driver.carImageUrl,
      carSeats: driver.carSeats,
      rating: driver.rating,
      firstName: driver.firstName,
      lastName: driver.lastName,
      clerkId: driver.clerkId,
      pushToken: driver.pushToken,
      pushProvider: driver.pushProvider,
    );
  }).toList();
}

Map<String, double> calculateRegionRaw({
    required double userLatitude,
    required double userLongitude,
    double? destinationLatitude,
    double? destinationLongitude,
}) {
    if (destinationLatitude == null || destinationLongitude == null) {
        return {
            'latitude': userLatitude,
            'longitude': userLongitude,
            'latitudeDelta': 0.004,
            'longitudeDelta': 0.004,
        };
    }
    
    final minLat = userLatitude < destinationLatitude ? userLatitude : destinationLatitude;
    final maxLat = userLatitude > destinationLatitude ? userLatitude : destinationLatitude;
    final minLng = userLongitude < destinationLongitude ? userLongitude : destinationLongitude;
    final maxLng = userLongitude > destinationLongitude ? userLongitude : destinationLongitude;
    
    final latitudeDelta = (maxLat - minLat) * 1.3;
    final longitudeDelta = (maxLng - minLng) * 1.3;
    
    final latitude = (userLatitude + destinationLatitude) / 2;
    final longitude = (userLongitude + destinationLongitude) / 2;
    
    return {
        'latitude': latitude,
        'longitude': longitude,
        'latitudeDelta': latitudeDelta,
        'longitudeDelta': longitudeDelta,
    };
}

Future<List<MarkerData>?> calculateDriverTimes({
  required List<MarkerData> markers,
  required double userLatitude,
  required double userLongitude,
  required double destinationLatitude,
  required double destinationLongitude,
}) async {
  try {
    final futures = markers.map((marker) async {
      final responseToUser = await http.get(Uri.parse(
          "https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=$userLatitude,$userLongitude&key=${AppConfig.directionsApiKey}"));
      final dataToUser = json.decode(responseToUser.body);
      final timeToUser = dataToUser['routes'][0]['legs'][0]['duration']['value']; // seconds

      final responseToDestination = await http.get(Uri.parse(
          "https://maps.googleapis.com/maps/api/directions/json?origin=$userLatitude,$userLongitude&destination=$destinationLatitude,$destinationLongitude&key=${AppConfig.directionsApiKey}"));
      final dataToDestination = json.decode(responseToDestination.body);
      final timeToDestination =
          dataToDestination['routes'][0]['legs'][0]['duration']['value']; // seconds

      final totalTime = (timeToUser + timeToDestination) / 60; // minutes
      final price = (totalTime * 0.5).toStringAsFixed(2);

      return MarkerData(
          latitude: marker.latitude,
          longitude: marker.longitude,
          id: marker.id,
          title: marker.title,
          profileImageUrl: marker.profileImageUrl,
          carImageUrl: marker.carImageUrl,
          carSeats: marker.carSeats,
          rating: marker.rating,
          firstName: marker.firstName,
          lastName: marker.lastName,
          time: totalTime.toInt(),
          price: price,
          clerkId: marker.clerkId,
          pushToken: marker.pushToken,
          pushProvider: marker.pushProvider
      );
    });

    return await Future.wait(futures);
  } catch (error) {
    debugPrint("Error calculating driver times: $error");
    return null;
  }
}