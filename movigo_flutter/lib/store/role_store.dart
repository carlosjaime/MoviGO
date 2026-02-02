import 'package:flutter/foundation.dart';
import '../types/types.dart';

class RoleStore extends ChangeNotifier {
  UserRole _role = UserRole.client;

  UserRole get role => _role;

  void setRole(UserRole role) {
    _role = role;
    notifyListeners();
  }
}
