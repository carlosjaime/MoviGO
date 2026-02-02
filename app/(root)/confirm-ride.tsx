import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import RideLayout from "@/components/RideLayout";
import { useDriverStore, useLocationStore } from "@/store";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const { destinationAddress } = useLocationStore();
  const isLoadingRoutes = !!destinationAddress && drivers.length === 0;

  return (
    <RideLayout
      title={"Elige un conductor"}
      snapPoints={["65%", "85%"]}
      useScrollView={false}
    >
      <FlatList
        data={drivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <DriverCard
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Seleccionar viaje"
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
      <LoadingOverlay
        visible={isLoadingRoutes}
        message="Cargando rutas..."
      />
    </RideLayout>
  );
};

export default ConfirmRide;
