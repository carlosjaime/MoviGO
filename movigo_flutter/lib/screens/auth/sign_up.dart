import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../components/custom_button.dart';
import '../../components/input_field.dart';
import '../../components/loading_overlay.dart';
import '../../components/oauth.dart';
import '../../constants/constants.dart';
import '../../store/role_store.dart';
import '../../services/auth.dart';
import '../../types/types.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final PageController _pageController = PageController();
  int roleIndex = 0;
  bool isSubmitting = false;

  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();

  final List<Map<String, dynamic>> roleSlides = [
    {
      "key": "client",
      "title": "Cliente",
      "subtitle": "Viajes rapidos y seguros",
      "badge": "Rider",
      "icon": AppIcons.person,
      "details": "Reserva, sigue el mapa y comparte el codigo con tu conductor.",
    },
    {
      "key": "driver",
      "title": "Conductor",
      "subtitle": "Gestiona tus viajes",
      "badge": "Driver",
      "icon": AppIcons.marker,
      "details": "Marca llegada, valida el codigo y comienza el viaje.",
    },
  ];

  @override
  void initState() {
    super.initState();
    // Initialize role based on store
    final role = context.read<RoleStore>().role;
    roleIndex = role == UserRole.driver ? 1 : 0;
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_pageController.hasClients && roleIndex == 1) {
            _pageController.jumpToPage(1);
        }
    });
  }

  Future<void> onSignUpPress() async {
    if (isSubmitting) return;
    
    // Validate inputs
    if (nameController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Por favor ingresa tu nombre"))
      );
      return;
    }
    
    if (emailController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Por favor ingresa tu correo electrónico"))
      );
      return;
    }
    
    if (passwordController.text.trim().length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("La contraseña debe tener al menos 8 caracteres"))
      );
      return;
    }
    
    if (passwordController.text != confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Las contraseñas no coinciden"))
      );
      return;
    }
    
    setState(() => isSubmitting = true);

    try {
        final role = roleIndex == 0 ? "client" : "driver";
        final result = await AuthService.signUpWithEmail(
          emailController.text.trim(),
          passwordController.text.trim(),
          nameController.text.trim(),
          role
        );
        
        if (mounted) {
          if (result['success'] == true) {
              context.go('/home');
          } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(result['message']))
              );
          }
        }
    } catch (e) {
        if (mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
               SnackBar(content: Text(e.toString()))
             );
        }
    } finally {
        if (mounted) setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            SizedBox(
              height: 200,
              child: Stack(
                children: [
                  Image.asset(AppImages.signUpCar, width: double.infinity, height: 200, fit: BoxFit.cover),
                  Positioned(
                    top: 16,
                    left: 16,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.black),
                      onPressed: () => context.pop(),
                    ),
                  ),
                  const Positioned(
                    bottom: 20,
                    left: 20,
                    child: Text(
                      "Crear cuenta en MoviGO 👋",
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        fontFamily: 'PlusJakartaSans',
                        color: Colors.black,
                      ),
                    ),
                  )
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                         const Text("Elige tu rol", style: TextStyle(color: Colors.grey)),
                         Container(
                           padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                           decoration: BoxDecoration(
                               color: Colors.blue[50],
                               borderRadius: BorderRadius.circular(20),
                           ),
                           child: Text(
                               roleIndex == 0 ? "Cliente" : "Conductor",
                               style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold),
                           ),
                         )
                      ],
                    ),
                    const SizedBox(height: 12),
                    Container(
                        height: 600, // Fixed height for swipe area
                        decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.grey[200]!)
                        ),
                        child: Column(
                            children: [
                                Expanded(
                                    child: PageView.builder(
                                        controller: _pageController,
                                        itemCount: roleSlides.length,
                                        onPageChanged: (index) {
                                            setState(() => roleIndex = index);
                                            context.read<RoleStore>().setRole(index == 0 ? UserRole.client : UserRole.driver);
                                        },
                                        itemBuilder: (context, index) {
                                            final slide = roleSlides[index];
                                            return SingleChildScrollView(
                                                padding: const EdgeInsets.all(20),
                                                child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                        Row(
                                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                            children: [
                                                                Row(
                                                                    children: [
                                                                        Container(
                                                                            width: 48, height: 48,
                                                                            decoration: BoxDecoration(
                                                                                color: Colors.white,
                                                                                borderRadius: BorderRadius.circular(16),
                                                                                border: Border.all(color: Colors.grey[200]!)
                                                                            ),
                                                                            padding: const EdgeInsets.all(10),
                                                                            child: Image.asset(slide['icon']),
                                                                        ),
                                                                        const SizedBox(width: 12),
                                                                        Column(
                                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                                            children: [
                                                                                Text(slide['title'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                                                                Text(slide['subtitle'], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                                                            ],
                                                                        )
                                                                    ],
                                                                ),
                                                                Container(
                                                                     padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                                                     decoration: BoxDecoration(
                                                                         color: Colors.white,
                                                                         borderRadius: BorderRadius.circular(20),
                                                                         border: Border.all(color: Colors.grey[200]!)
                                                                     ),
                                                                     child: Text(slide['badge'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                                )
                                                            ],
                                                        ),
                                                        const SizedBox(height: 20),
                                                        Text(slide['details'], style: const TextStyle(color: Colors.grey)),
                                                        const SizedBox(height: 20),
                                                        InputField(
                                                            label: "Nombre completo",
                                                            placeholder: "Ingresa tu nombre",
                                                            icon: AppIcons.person,
                                                            controller: nameController,
                                                        ),
                                                        InputField(
                                                            label: "Correo electrónico",
                                                            placeholder: "Ingresa tu correo",
                                                            icon: AppIcons.email,
                                                            controller: emailController,
                                                            keyboardType: TextInputType.emailAddress,
                                                        ),
                                                        InputField(
                                                            label: "Contraseña",
                                                            placeholder: "Ingresa tu contraseña",
                                                            icon: AppIcons.lock,
                                                            secureTextEntry: true,
                                                            controller: passwordController,
                                                        ),
                                                        InputField(
                                                            label: "Confirmar contraseña",
                                                            placeholder: "Confirma tu contraseña",
                                                            icon: AppIcons.lock,
                                                            secureTextEntry: true,
                                                            controller: confirmPasswordController,
                                                        ),
                                                        const SizedBox(height: 20),
                                                        CustomButton(
                                                            title: "Crear cuenta",
                                                            onPress: onSignUpPress,
                                                            bgVariant: isSubmitting ? "secondary" : "primary",
                                                        ),
                                                        const SizedBox(height: 12),
                                                        const OAuth(),
                                                    ],
                                                ),
                                            );
                                        },
                                    ),
                                ),
                                // Dots
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: List.generate(roleSlides.length, (index) {
                                      return Container(
                                        width: 24,
                                        height: 4,
                                        margin: const EdgeInsets.symmetric(horizontal: 4),
                                        decoration: BoxDecoration(
                                          color: roleIndex == index
                                              ? const Color(0xFF0286FF)
                                              : const Color(0xFFE2E8F0),
                                          borderRadius: BorderRadius.circular(2),
                                        ),
                                      );
                                    }),
                                  ),
                                ),
                            ],
                        ),
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                        onTap: () => context.push('/auth/sign-in'),
                        child: RichText(
                            text: const TextSpan(
                                text: "¿Ya tienes cuenta? ",
                                style: TextStyle(color: Colors.grey, fontSize: 16),
                                children: [
                                    TextSpan(
                                        text: "Inicia sesión",
                                        style: TextStyle(color: Colors.blue),
                                    )
                                ]
                            ),
                        ),
                    )
                  ],
                ),
              ),
            ),
            LoadingOverlay(visible: isSubmitting, message: "Creando cuenta..."),
          ],
        ),
      ),
    );
  }
}