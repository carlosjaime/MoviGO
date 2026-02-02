import { router } from "expo-router";
import { Alert, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useDriverStore, useLocationStore } from "@/store";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();
  const { drivers, setSelectedDriver } = useDriverStore();

  const handleNearestDriver = () => {
    if (!destinationAddress) {
      Alert.alert("Selecciona tu destino primero.");
      return;
    }

    if (!drivers.length) {
      Alert.alert("No hay conductores disponibles.");
      return;
    }

    const sortedDrivers = [...drivers].sort((a, b) => {
      const aTime = a.time ?? Number.POSITIVE_INFINITY;
      const bTime = b.time ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
    const nearestDriver = sortedDrivers[0];
    if (!nearestDriver) {
      Alert.alert("No hay conductores disponibles.");
      return;
    }

    setSelectedDriver(nearestDriver.id);
    router.push("/(root)/book-ride");
  };

  return (
    <RideLayout title="Viaje">
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">Desde</Text>

        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">Hasta</Text>

        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress!}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>

      <CustomButton
        title="Buscar conductor cercano"
        onPress={handleNearestDriver}
        className="mt-4"
      />

      <CustomButton
        title="Elegir de la lista"
        onPress={() => router.push("/(root)/confirm-ride")}
        className="mt-5"
      />
    </RideLayout>
  );
};

export default FindRide;
