import 'package:flutter/material.dart';
import '../components/ride_card.dart';
import '../utils/utils.dart';
import '../constants/constants.dart';
import '../types/types.dart';

class RidesScreen extends StatefulWidget {
  const RidesScreen({super.key});

  @override
  State<RidesScreen> createState() => _RidesScreenState();
}

class _RidesScreenState extends State<RidesScreen> {
  bool _isLoading = true;
  List<Ride> _rides = [];

  @override
  void initState() {
    super.initState();
    _loadRides();
  }

  Future<void> _loadRides() async {
    try {
      // This would fetch from your API
      // For now, using mock data
      setState(() {
        _rides = [
          Ride(
            rideId: 1,
            originAddress: "Calle 123, Ciudad",
            destinationAddress: "Avenida 456, Ciudad",
            originLatitude: 19.4326,
            originLongitude: -99.1332,
            destinationLatitude: 19.4511,
            destinationLongitude: -99.1255,
            rideTime: 25,
            farePrice: 150.50,
            paymentStatus: "paid",
            status: RidePhase.completed,
            driverId: 1,
            userId: "user123",
            createdAt: "2024-01-15T10:30:00Z",
            driver: RideDriver(
              firstName: "Juan",
              lastName: "Pérez",
              carSeats: 4,
            ),
          ),
          Ride(
            rideId: 2,
            originAddress: "Plaza Central, Ciudad",
            destinationAddress: "Aeropuerto Internacional",
            originLatitude: 19.4270,
            originLongitude: -99.1277,
            destinationLatitude: 19.4363,
            destinationLongitude: -99.0721,
            rideTime: 45,
            farePrice: 280.75,
            paymentStatus: "paid",
            status: RidePhase.completed,
            driverId: 2,
            userId: "user123",
            createdAt: "2024-01-14T15:45:00Z",
            driver: RideDriver(
              firstName: "María",
              lastName: "García",
              carSeats: 6,
            ),
          ),
        ];
        _isLoading = false;
      });
    } catch (error) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error al cargar viajes: $error")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final sortedRides = sortRides(_rides);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Mis Viajes",
          style: TextStyle(
            fontFamily: 'PlusJakartaSans',
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : sortedRides.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(AppImages.noResult, width: 150, height: 150),
                  const SizedBox(height: 20),
                  const Text(
                    "No tienes viajes registrados",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'PlusJakartaSans',
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Comienza a viajar con MoviGO",
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                      fontFamily: 'PlusJakartaSans',
                    ),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadRides,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: sortedRides.length,
                itemBuilder: (context, index) {
                  final ride = sortedRides[index];
                  return RideCard(ride: ride);
                },
              ),
            ),
    );
  }
}
