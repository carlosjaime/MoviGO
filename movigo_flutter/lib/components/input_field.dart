import 'package:flutter/material.dart';

class InputField extends StatefulWidget {
  final String label;
  final String? icon;
  final bool secureTextEntry;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final String? placeholder;
  final ValueChanged<String>? onChanged;

  const InputField({
    super.key,
    required this.label,
    this.icon,
    this.secureTextEntry = false,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.placeholder,
    this.onChanged,
  });

  @override
  State<InputField> createState() => _InputFieldState();
}

class _InputFieldState extends State<InputField> {
  bool isFocused = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.label,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              fontFamily: 'PlusJakartaSans',
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: Colors.grey[100], // neutral-100
              borderRadius: BorderRadius.circular(50),
              border: Border.all(
                color: isFocused
                    ? const Color(0xFF0286FF)
                    : Colors.grey[300]!, // primary-500 or neutral-300
                width: 1,
              ),
            ),
            child: Row(
              children: [
                if (widget.icon != null)
                  Padding(
                    padding: const EdgeInsets.only(left: 16.0),
                    child: Image.asset(widget.icon!, width: 24, height: 24),
                  ),
                Expanded(
                  child: Focus(
                    onFocusChange: (hasFocus) {
                      setState(() {
                        isFocused = hasFocus;
                      });
                    },
                    child: TextField(
                      controller: widget.controller,
                      obscureText: widget.secureTextEntry,
                      keyboardType: widget.keyboardType,
                      onChanged: widget.onChanged,
                      style: const TextStyle(
                        fontSize: 15,
                        fontFamily: 'PlusJakartaSans',
                        fontWeight: FontWeight.w600,
                      ),
                      decoration: InputDecoration(
                        hintText: widget.placeholder,
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.all(16),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
