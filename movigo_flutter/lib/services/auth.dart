import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'google_auth.dart';
import '../utils/fetch.dart';

class TokenCache {
  static const _storage = FlutterSecureStorage();

  static Future<String?> getToken(String key) async {
    try {
      final item = await _storage.read(key: key);
      if (item != null) {
        debugPrint("$key was used 🔐 \n");
      } else {
        debugPrint("No values stored under key: $key");
      }
      return item;
    } catch (error) {
      debugPrint("SecureStore get item error: $error");
      await _storage.delete(key: key);
      return null;
    }
  }

  static Future<void> saveToken(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
    } catch (err) {
      debugPrint("Error saving token: $err");
    }
  }
}

final Map<String, String> clerkErrorMap = {
  "Enter password": "Ingresa tu contraseña.",
  "Enter email address": "Ingresa tu correo electrónico.",
  "Enter email": "Ingresa tu correo electrónico.",
  "Invalid email address": "El correo electrónico no es válido.",
  "Password is too short": "La contraseña es demasiado corta.",
  "Password must be at least 8 characters long":
      "La contraseña debe tener al menos 8 caracteres.",
  "Identifier is invalid.": "El correo electrónico no es válido.",
  "Email address is already in use": "El correo electrónico ya está en uso.",
  "Verification failed. Please try again.":
      "La verificación falló. Intenta de nuevo.",
  "Invalid verification strategy":
      "La estrategia de verificación no es válida.",
  "The verification strategy is not valid for this account":
      "La estrategia de verificación no es válida para esta cuenta.",
  "That email address is taken. Please try another.":
      "Ese correo ya está en uso. Prueba con otro.",
  "Passwords must be 8 characters or more.":
      "La contraseña debe tener 8 caracteres o más.",
  "Password has been found in an online data breach. For account safety, please use a different password.":
      "Esta contraseña apareció en una filtración. Por seguridad, usa una diferente.",
};

final Map<String, String> clerkErrorCodeMap = {
  "strategy_for_user_invalid":
      "La estrategia de verificación no es válida para esta cuenta.",
  "form_identifier_exists": "Ese correo ya está en uso. Usa otro.",
  "form_password_length_too_short":
      "La contraseña debe tener 8 caracteres o más.",
  "form_password_pwned":
      "Esta contraseña apareció en una filtración. Usa una contraseña diferente.",
};

String localizeClerkError(String? message, String? code) {
  if (code != null && clerkErrorCodeMap.containsKey(code)) {
    return clerkErrorCodeMap[code]!;
  }
  if (message == null) {
    return "Ocurrió un error. Intenta de nuevo.";
  }
  final normalized = message.trim();
  if (clerkErrorMap.containsKey(normalized)) {
    return clerkErrorMap[normalized]!;
  }
  if (RegExp(r'enter password', caseSensitive: false).hasMatch(normalized)) {
    return "Ingresa tu contraseña.";
  }
  if (RegExp(r'enter email', caseSensitive: false).hasMatch(normalized)) {
    return "Ingresa tu correo electrónico.";
  }
  return message;
}

// Firebase Authentication Service
class AuthService {
  static Future<Map<String, dynamic>> signInWithEmail(
    String email,
    String password,
  ) async {
    try {
      final response = await fetchAPI(
        "/auth/signin",
        method: "POST",
        body: {"email": email, "password": password},
      );

      if (response['token'] != null) {
        await TokenCache.saveToken("auth_token", response['token']);
        return {
          "success": true,
          "message": "Has iniciado sesión correctamente",
        };
      }

      return {"success": false, "message": "Credenciales inválidas"};
    } catch (error) {
      return {
        "success": false,
        "message": localizeClerkError(error.toString(), null),
      };
    }
  }

  static Future<Map<String, dynamic>> signUpWithEmail(
    String email,
    String password,
    String name,
    String role,
  ) async {
    try {
      final response = await fetchAPI(
        "/auth/signup",
        method: "POST",
        body: {
          "email": email,
          "password": password,
          "name": name,
          "role": role,
        },
      );

      if (response['token'] != null) {
        await TokenCache.saveToken("auth_token", response['token']);

        // Create user in database
        await fetchAPI(
          "/(api)/user",
          method: "POST",
          body: {
            "name": name,
            "email": email,
            "clerkId": response['userId'],
            "role": role,
          },
        );

        if (role == "driver") {
          await fetchAPI(
            "/(api)/driver",
            method: "POST",
            body: {
              "clerk_id": response['userId'],
              "first_name": name.split(" ")[0],
              "last_name": name.split(" ").length > 1
                  ? name.split(" ")[1]
                  : "MoviGO",
              "profile_image_url": null,
            },
          );
        }

        return {"success": true, "message": "Cuenta creada exitosamente"};
      }

      return {"success": false, "message": "Error al crear cuenta"};
    } catch (error) {
      return {
        "success": false,
        "message": localizeClerkError(error.toString(), null),
      };
    }
  }

  static Future<Map<String, dynamic>> googleOAuth(String role) async {
    try {
      // Use Google Auth Service instead of mock implementation
      final result = await GoogleAuthService.signInWithGoogle(role);
      
      if (result['success'] == true) {
        // The GoogleAuthService already handles the backend communication
        return {
          "success": true,
          "code": "success",
          "message": "Has iniciado sesión con Google correctamente",
        };
      }

      return {
        "success": false,
        "message": result['message'] ?? "Ocurrió un error al iniciar sesión con Google",
      };
    } catch (err) {
      debugPrint(err.toString());
      return {
        "success": false,
        "code": "error",
        "message": localizeClerkError(err.toString(), null),
      };
    }
  }

  static Future<void> signOut() async {
    await GoogleAuthService.signOut(); // Also sign out from Google
    await TokenCache._storage.delete(key: "auth_token");
  }

  static Future<bool> isAuthenticated() async {
    final token = await TokenCache.getToken("auth_token");
    return token != null;
  }
}