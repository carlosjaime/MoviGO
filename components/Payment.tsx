import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useDriverStore, useLocationStore, useRideStore } from "@/store";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();
  const { setActiveRide } = useRideStore();
  const { drivers, selectedDriver } = useDriverStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod] = useState<"cash" | "card">("cash");
  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];
  const driverPushToken = driverDetails?.push_token;
  const driverPushProvider = driverDetails?.push_provider ?? "expo";

  const createRideAndNotify = async (paymentStatus: "paid" | "cash") => {
    const rideResponse = await fetchAPI("/(api)/ride/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin_address: userAddress,
        destination_address: destinationAddress,
        origin_latitude: userLatitude,
        origin_longitude: userLongitude,
        destination_latitude: destinationLatitude,
        destination_longitude: destinationLongitude,
        ride_time: rideTime.toFixed(0),
        fare_price: parseInt(amount) * 100,
        payment_status: paymentStatus,
        driver_id: driverId,
        user_id: userId,
      }),
    });

    if (rideResponse?.data?.ride_id) {
      setActiveRide({
        rideId: rideResponse.data.ride_id,
        verificationCode: rideResponse.data.verification_code,
        status: rideResponse.data.status || "driver_en_route",
        driverId,
        originAddress: userAddress,
        destinationAddress,
      });

      if (driverPushToken) {
        await fetchAPI("/(api)/notifications/ride-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            push_token: driverPushToken,
            push_provider: driverPushProvider,
            title: "Nuevo viaje solicitado",
            message: destinationAddress
              ? `Destino: ${destinationAddress}`
              : "Revisa tu app para aceptar el viaje.",
            data: {
              ride_id: rideResponse.data.ride_id,
            },
          }),
        });
      }
    }
  };

  const openPaymentSheet = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (paymentMethod === "cash") {
        await createRideAndNotify("cash");
        setSuccess(true);
        return;
      }

      await initializePaymentSheet();
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Código de error: ${error.code}`, error.message);
      } else {
        setSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ejemplo, Inc.",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "usd",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            },
          );

          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });

            if (result.client_secret) {
              const rideResponse = await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: parseInt(amount) * 100,
                  payment_status: "paid",
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              if (rideResponse?.data?.ride_id) {
                setActiveRide({
                  rideId: rideResponse.data.ride_id,
                  verificationCode: rideResponse.data.verification_code,
                  status: rideResponse.data.status || "driver_en_route",
                  driverId,
                  originAddress: userAddress,
                  destinationAddress,
                });

                if (driverPushToken) {
                  await fetchAPI("/(api)/notifications/ride-request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      push_token: driverPushToken,
                      push_provider: driverPushProvider,
                      title: "Nuevo viaje solicitado",
                      message: destinationAddress
                        ? `Destino: ${destinationAddress}`
                        : "Revisa tu app para aceptar el viaje.",
                      data: {
                        ride_id: rideResponse.data.ride_id,
                      },
                    }),
                  });
                }
              }

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "myapp://book-ride",
    });

    if (!error) {
      // setLoading(true);
    }
  };

  return (
    <>
      <View className="mt-6">
        <Text className="text-base font-JakartaSemiBold mb-3">
          Método de pago
        </Text>
        <View className="flex-row items-center">
          <View className="flex-1 mr-2">
            <View className="rounded-2xl border border-neutral-900 bg-neutral-900 px-4 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-JakartaSemiBold text-white">
                  Efectivo
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-white/15">
                  <Text className="text-[10px] text-white">Activo</Text>
                </View>
              </View>
              <Text className="text-xs text-white/80 mt-2">
                Paga al llegar al destino
              </Text>
            </View>
          </View>
          <View className="flex-1 ml-2 opacity-50">
            <View className="rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-JakartaSemiBold text-neutral-500">
                  Tarjeta
                </Text>
                <View className="px-2 py-0.5 rounded-full bg-neutral-200">
                  <Text className="text-[10px] text-neutral-600">
                    Próximamente
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-neutral-400 mt-2">
                Disponible pronto
              </Text>
            </View>
          </View>
        </View>
      </View>

      <CustomButton
        title="Confirmar viaje en efectivo"
        className={`my-10 ${isSubmitting ? "opacity-60" : ""}`}
        onPress={openPaymentSheet}
        disabled={isSubmitting}
      />

      <Modal
        transparent
        animationType="fade"
        visible={success}
        onRequestClose={() => setSuccess(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setSuccess(false)}
          />
          <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl w-full">
            <Image source={images.check} className="w-28 h-28 mt-5" />

            <Text className="text-2xl text-center font-JakartaBold mt-5">
              Reserva realizada con éxito
            </Text>

            <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
              Gracias por tu reservación. Tu viaje ha sido confirmado. ¡Buen
              viaje!
            </Text>

            <CustomButton
              title="Volver al inicio"
              onPress={() => {
                setSuccess(false);
                router.push("/(root)/(tabs)/home");
              }}
              className="mt-5"
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

export default Payment;
