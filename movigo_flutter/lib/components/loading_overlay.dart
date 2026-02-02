import 'package:flutter/material.dart';

class LoadingOverlay extends StatelessWidget {
  final bool visible;
  final String message;

  const LoadingOverlay({
    super.key,
    required this.visible,
    this.message = "Loading...",
  });

  @override
  Widget build(BuildContext context) {
    if (!visible) return const SizedBox.shrink();

    return Stack(
      children: [
        // Modal barrier
        ModalBarrier(
          dismissible: false,
          color: Colors.black.withValues(alpha: 0.4),
        ),
        Center(
          child: Container(
            width: 176, // 44 * 4
            height: 176,
            decoration: BoxDecoration(
              color: const Color(0xFF171717), // neutral-900
              borderRadius: BorderRadius.circular(24), // rounded-3xl
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  message,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'PlusJakartaSans',
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                const CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
