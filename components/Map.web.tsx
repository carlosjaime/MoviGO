import React from "react";
import { View, Text } from "react-native";

const Map = () => {
  return (
    <View className="w-full h-full rounded-2xl items-center justify-center bg-gray-100">
      <Text className="text-center font-JakartaSemiBold px-4">
        El mapa no está disponible en la versión web. Usa la app móvil para ver
        el mapa y la navegación.
      </Text>
    </View>
  );
};

export default Map;
