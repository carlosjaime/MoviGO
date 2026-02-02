import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import '../constants/config.dart';
import '../utils/fetch.dart';

class PaymentService {
  static Future<void> initialize() async {
    try {
      // Only initialize Stripe on mobile platforms, not web
      if (!kIsWeb) {
        Stripe.publishableKey = AppConfig.stripePublishableKey;
      }
    } catch (e) {
      debugPrint('Error initializing Stripe: $e');
    }
  }

  static Future<Map<String, dynamic>> createPaymentIntent({
    required double amount,
    required String currency,
    required String customerEmail,
    required String customerName,
  }) async {
    try {
      // For web platform, return a mock payment intent
      if (kIsWeb) {
        debugPrint('Payment intent creation not supported on web platform');
        return {
          "success": true,
          "client_secret": "web_mock_secret_${DateTime.now().millisecondsSinceEpoch}",
          "payment_intent_id": "web_mock_intent_${DateTime.now().millisecondsSinceEpoch}",
        };
      }
      
      final response = await fetchAPI("/(api)/stripe/create-payment-intent",
        method: "POST",
        body: {
          "amount": (amount * 100).toInt(), // Convert to cents
          "currency": currency,
          "customer_email": customerEmail,
          "customer_name": customerName,
        }
      );

      return {
        "success": true,
        "client_secret": response["client_secret"],
        "payment_intent_id": response["payment_intent_id"],
      };
    } catch (error) {
      return {
        "success": false,
        "error": error.toString(),
      };
    }
  }

  static Future<Map<String, dynamic>> confirmPayment(String clientSecret) async {
    try {
      // For web platform, return a mock confirmation
      if (kIsWeb) {
        debugPrint('Payment confirmation not supported on web platform');
        return {
          "success": true,
          "payment_intent_id": "web_mock_confirmed_${DateTime.now().millisecondsSinceEpoch}",
        };
      }
      
      final result = await Stripe.instance.confirmPayment(
        paymentIntentClientSecret: clientSecret,
        data: const PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      if (result.status == PaymentIntentsStatus.Succeeded) {
        return {
          "success": true,
          "payment_intent_id": result.id,
        };
      } else {
        return {
          "success": false,
          "error": "Payment failed",
        };
      }
    } catch (error) {
      return {
        "success": false,
        "error": error.toString(),
      };
    }
  }

  static Future<Map<String, dynamic>> processRidePayment({
    required double fare,
    required String driverId,
    required String customerEmail,
    required String customerName,
  }) async {
    try {
      // For web platform, return a mock success since Stripe is not supported
      if (kIsWeb) {
        debugPrint('Payment processing not supported on web platform');
        return {
          "success": true,
          "payment_intent_id": "web_mock_${DateTime.now().millisecondsSinceEpoch}",
        };
      }
      
      // Create payment intent
      final paymentIntent = await createPaymentIntent(
        amount: fare,
        currency: "usd",
        customerEmail: customerEmail,
        customerName: customerName,
      );

      if (!paymentIntent["success"]) {
        return paymentIntent;
      }

      // Confirm payment
      final confirmation = await confirmPayment(paymentIntent["client_secret"]);

      if (confirmation["success"]) {
        // Update ride payment status
        await fetchAPI("/(api)/ride/update-payment-status",
          method: "POST",
          body: {
            "payment_intent_id": confirmation["payment_intent_id"],
            "driver_id": driverId,
            "amount": fare,
          }
        );
      }

      return confirmation;
    } catch (error) {
      return {
        "success": false,
        "error": error.toString(),
      };
    }
  }
}

// Payment widget for ride confirmation
class PaymentWidget extends StatefulWidget {
  final double amount;
  final String driverId;
  final String customerEmail;
  final String customerName;
  final VoidCallback onPaymentSuccess;
  final VoidCallback onPaymentError;

  const PaymentWidget({
    super.key,
    required this.amount,
    required this.driverId,
    required this.customerEmail,
    required this.customerName,
    required this.onPaymentSuccess,
    required this.onPaymentError,
  });

  @override
  State<PaymentWidget> createState() => _PaymentWidgetState();
}

class _PaymentWidgetState extends State<PaymentWidget> {
  bool _isProcessing = false;

  Future<void> _processPayment() async {
    if (_isProcessing) return;

    setState(() => _isProcessing = true);

    try {
      final result = await PaymentService.processRidePayment(
        fare: widget.amount,
        driverId: widget.driverId,
        customerEmail: widget.customerEmail,
        customerName: widget.customerName,
      );

      if (mounted) {
        if (result["success"]) {
          widget.onPaymentSuccess();
        } else {
          widget.onPaymentError();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result["error"] ?? "Payment failed"))
          );
        }
      }
    } catch (error) {
      if (mounted) {
        widget.onPaymentError();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString()))
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Total a pagar",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'PlusJakartaSans',
                ),
              ),
              Text(
                "\$${widget.amount.toStringAsFixed(2)}",
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0286FF),
                  fontFamily: 'PlusJakartaSans',
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          ElevatedButton(
            onPressed: _isProcessing ? null : _processPayment,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0286FF),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(25),
              ),
            ),
            child: _isProcessing
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    "Confirmar pago",
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'PlusJakartaSans',
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}