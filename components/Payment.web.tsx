import { router } from "expo-router";
import React from "react";
import { Text, View, Image } from "react-native";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  return (
    <>
      <View className="w-full bg-yellow-100 border border-yellow-300 p-4 rounded-xl">
        <Text className="text-yellow-800 font-JakartaSemiBold text-center">
          El pago con Stripe no está disponible en web. Completa la reserva
          desde la app móvil (Expo Go).
        </Text>
      </View>
      <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl mt-6">
        <Image source={images.check} className="w-28 h-28 mt-2" />
        <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
          Puedes revisar la información del viaje aquí y finalizar el pago desde
          tu dispositivo móvil.
        </Text>
        <CustomButton
          title="Volver al inicio"
          onPress={() => {
            router.push("/(root)/(tabs)/home");
          }}
          className="mt-5"
        />
      </View>
    </>
  );
};

export default Payment;
