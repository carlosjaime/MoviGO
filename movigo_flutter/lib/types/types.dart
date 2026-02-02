enum RidePhase { idle, driver_en_route, arrived, in_progress, completed }

RidePhase ridePhaseFromString(String status) {
  return RidePhase.values.firstWhere(
    (e) => e.toString().split('.').last == status,
    orElse: () => RidePhase.idle,
  );
}

enum UserRole { client, driver }

class Driver {
  final int id;
  final String firstName;
  final String lastName;
  final String profileImageUrl;
  final String carImageUrl;
  final int carSeats;
  final double rating;
  final String? clerkId;
  final String? pushToken;
  final String? pushProvider;

  Driver({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.profileImageUrl,
    required this.carImageUrl,
    required this.carSeats,
    required this.rating,
    this.clerkId,
    this.pushToken,
    this.pushProvider,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      profileImageUrl: json['profile_image_url'],
      carImageUrl: json['car_image_url'],
      carSeats: json['car_seats'],
      rating: (json['rating'] as num).toDouble(),
      clerkId: json['clerk_id'],
      pushToken: json['push_token'],
      pushProvider: json['push_provider'],
    );
  }
}

class MarkerData {
  final double latitude;
  final double longitude;
  final int id;
  final String title;
  final String profileImageUrl;
  final String carImageUrl;
  final int carSeats;
  final double rating;
  final String firstName;
  final String lastName;
  final int? time;
  final String? price;
  final String? clerkId;
  final String? pushToken;
  final String? pushProvider;

  MarkerData({
    required this.latitude,
    required this.longitude,
    required this.id,
    required this.title,
    required this.profileImageUrl,
    required this.carImageUrl,
    required this.carSeats,
    required this.rating,
    required this.firstName,
    required this.lastName,
    this.time,
    this.price,
    this.clerkId,
    this.pushToken,
    this.pushProvider,
  });

  factory MarkerData.fromJson(Map<String, dynamic> json) {
    return MarkerData(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      id: json['id'],
      title: json['title'],
      profileImageUrl: json['profile_image_url'],
      carImageUrl: json['car_image_url'],
      carSeats: json['car_seats'],
      rating: (json['rating'] as num).toDouble(),
      firstName: json['first_name'],
      lastName: json['last_name'],
      time: json['time'],
      price: json['price'],
      clerkId: json['clerk_id'],
      pushToken: json['push_token'],
      pushProvider: json['push_provider'],
    );
  }
}

class RideDriver {
  final String firstName;
  final String lastName;
  final int carSeats;

  RideDriver({
    required this.firstName,
    required this.lastName,
    required this.carSeats,
  });

  factory RideDriver.fromJson(Map<String, dynamic> json) {
    return RideDriver(
      firstName: json['first_name'],
      lastName: json['last_name'],
      carSeats: json['car_seats'],
    );
  }
}

class Ride {
  final int rideId;
  final String originAddress;
  final String destinationAddress;
  final double originLatitude;
  final double originLongitude;
  final double destinationLatitude;
  final double destinationLongitude;
  final int rideTime;
  final double farePrice;
  final String paymentStatus;
  final RidePhase? status;
  final String? verificationCode;
  final int driverId;
  final String userId;
  final String createdAt;
  final RideDriver? driver;

  Ride({
    required this.rideId,
    required this.originAddress,
    required this.destinationAddress,
    required this.originLatitude,
    required this.originLongitude,
    required this.destinationLatitude,
    required this.destinationLongitude,
    required this.rideTime,
    required this.farePrice,
    required this.paymentStatus,
    this.status,
    this.verificationCode,
    required this.driverId,
    required this.userId,
    required this.createdAt,
    this.driver,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    return Ride(
      rideId: json['ride_id'],
      originAddress: json['origin_address'],
      destinationAddress: json['destination_address'],
      originLatitude: (json['origin_latitude'] as num).toDouble(),
      originLongitude: (json['origin_longitude'] as num).toDouble(),
      destinationLatitude: (json['destination_latitude'] as num).toDouble(),
      destinationLongitude: (json['destination_longitude'] as num).toDouble(),
      rideTime: json['ride_time'],
      farePrice: (json['fare_price'] as num).toDouble(),
      paymentStatus: json['payment_status'],
      status: json['status'] != null
          ? ridePhaseFromString(json['status'])
          : null,
      verificationCode: json['verification_code'],
      driverId: json['driver_id'],
      userId: json['user_id'],
      createdAt: json['created_at'],
      driver: json['driver'] != null
          ? RideDriver.fromJson(json['driver'])
          : null,
    );
  }
}
