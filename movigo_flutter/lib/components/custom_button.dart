import 'package:flutter/material.dart';

class CustomButton extends StatelessWidget {
  final VoidCallback onPress;
  final String title;
  final String bgVariant; // primary, secondary, danger, outline, success
  final String textVariant; // primary, default, secondary, danger, success
  final Widget? iconLeft;
  final Widget? iconRight;
  final double? width;
  final double? height;

  const CustomButton({
    super.key,
    required this.onPress,
    required this.title,
    this.bgVariant = "primary",
    this.textVariant = "default",
    this.iconLeft,
    this.iconRight,
    this.width,
    this.height,
  });

  Color _getBgColor() {
    switch (bgVariant) {
      case "secondary":
        return Colors.grey[500]!;
      case "danger":
        return Colors.red[500]!;
      case "success":
        return Colors.green[500]!;
      case "outline":
        return Colors.transparent;
      case "primary":
      default:
        return const Color(0xFF0286FF);
    }
  }

  Color _getTextColor() {
    switch (textVariant) {
      case "primary":
        return Colors.black;
      case "secondary":
        return Colors.grey[100]!;
      case "danger":
        return Colors.red[100]!;
      case "success":
        return Colors.green[100]!;
      case "default":
      default:
        return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: ElevatedButton(
        onPressed: onPress,
        style: ElevatedButton.styleFrom(
          backgroundColor: _getBgColor(),
          foregroundColor: _getTextColor(),
          elevation: bgVariant == "outline" ? 0 : 3,
          shadowColor: Colors.black.withValues(alpha: 0.08), // approximated shadow
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
            side: bgVariant == "outline"
                ? const BorderSide(
                    color: Color(0xFFE5E5E5),
                    width: 0.5,
                  ) // neutral-300
                : BorderSide.none,
          ),
          padding: const EdgeInsets.all(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (iconLeft != null) ...[iconLeft!, const SizedBox(width: 8)],
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _getTextColor(),
                fontFamily: 'PlusJakartaSans',
              ),
            ),
            if (iconRight != null) ...[const SizedBox(width: 8), iconRight!],
          ],
        ),
      ),
    );
  }
}
