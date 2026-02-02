import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/auth.dart';
import '../store/role_store.dart';
import '../types/types.dart';
import '../constants/constants.dart';
import 'custom_button.dart';
import 'loading_overlay.dart';

class OAuth extends StatefulWidget {
  final String? role;

  const OAuth({super.key, this.role});

  @override
  State<OAuth> createState() => _OAuthState();
}

class _OAuthState extends State<OAuth> {
  bool isLoading = false;

  Future<void> handleGoogleSignIn() async {
    if (isLoading) return;
    setState(() => isLoading = true);

    final roleStore = context.read<RoleStore>();
    final targetRole = widget.role ?? (roleStore.role == UserRole.client ? "client" : "driver");

    final result = await AuthService.googleOAuth(targetRole);
    
    if (mounted) {
        setState(() => isLoading = false);
        
        if (result['success'] == true) {
             context.replace('/home');
        } else {
             ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'])));
        }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12.0),
          child: Row(
            children: [
              Expanded(child: Container(height: 1, color: Colors.grey[200])), // general-100
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12.0),
                child: Text("O", style: TextStyle(fontSize: 18)),
              ),
              Expanded(child: Container(height: 1, color: Colors.grey[200])),
            ],
          ),
        ),
        CustomButton(
          title: "Iniciar sesión con Google",
          bgVariant: "outline",
          textVariant: "primary",
          iconLeft: Image.asset(AppIcons.google, width: 20, height: 20),
          onPress: handleGoogleSignIn,
        ),
        if (isLoading)
            const LoadingOverlay(visible: true, message: "Conectando..."),
      ],
    );
  }
}