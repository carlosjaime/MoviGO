import 'package:intl/intl.dart';
import '../types/types.dart';

List<Ride> sortRides(List<Ride> rides) {
  final result = List<Ride>.from(rides);
  result.sort((a, b) {
    final dateA = DateTime.tryParse(a.createdAt) ?? DateTime.now();
    final dateB = DateTime.tryParse(b.createdAt) ?? DateTime.now();
    return dateB.compareTo(dateA);
  });
  return result;
}

String formatTime(int minutes) {
  if (minutes < 60) {
    return "$minutes min";
  } else {
    final hours = (minutes / 60).floor();
    final remainingMinutes = minutes % 60;
    return "${hours}h ${remainingMinutes}m";
  }
}

String formatDate(String dateString) {
  try {
    final date = DateTime.parse(dateString);
    // Use Spanish locale 'es' - make sure to initialize it in main.dart
    final formatter = DateFormat('dd MMMM yyyy', 'es');
    return formatter.format(date);
  } catch (e) {
    return dateString;
  }
}
