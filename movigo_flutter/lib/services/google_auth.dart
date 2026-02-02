import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'auth.dart';
import '../utils/fetch.dart';

class GoogleAuthService {
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  static final FirebaseAuth _auth = FirebaseAuth.instance;

  static Future<Map<String, dynamic>> signInWithGoogle(String role) async {
    try {
      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();

      if (googleUser == null) {
        return {'success': false, 'message': 'Inicio de sesión cancelado'};
      }

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;

      // Create a new credential
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with the Google credential
      final UserCredential userCredential = await _auth.signInWithCredential(
        credential,
      );
      final User? user = userCredential.user;

      if (user != null) {
        // Get ID token for backend
        final String? idToken = await user.getIdToken();

        if (idToken != null) {
          // Send token to backend
          final response = await fetchAPI(
            '/auth/google',
            method: 'POST',
            body: {'idToken': idToken, 'role': role},
          );

          if (response['token'] != null) {
            // Save auth token
            await TokenCache.saveToken("auth_token", response['token']);

            return {
              'success': true,
              'message': 'Has iniciado sesión con Google correctamente',
            };
          }
        }
      }

      return {'success': false, 'message': 'Error al autenticar con Google'};
    } catch (error) {
      debugPrint('Google sign-in error: $error');
      return {
        'success': false,
        'message': 'Error al iniciar sesión con Google: ${error.toString()}',
      };
    }
  }

  static Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }
}
