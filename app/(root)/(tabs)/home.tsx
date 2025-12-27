import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import GoogleTextInput from "@/components/GoogleTextInput";
import InputField from "@/components/InputField";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { sendRideRequestNotification } from "@/lib/notifications";
import { getStoredRole, setStoredRole } from "@/lib/role";
import { useLocationStore, useRideStore, useRoleStore } from "@/store";
import { Ride } from "@/types/type";

const statusLabels: Record<string, string> = {
  driver_en_route: "Conductor en camino",
  arrived: "Conductor llegó",
  in_progress: "Viaje en curso",
  completed: "Viaje finalizado",
};

const CustomerHome = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { activeRide } = useRideStore();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const { data: recentRides, loading } = useFetch<Ride[]>(
    `/(api)/ride/${user?.id}`,
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, [setUserLocation]);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    void sendRideRequestNotification(location.address);
    router.push("/(root)/find-ride");
  };

  const handleMapPress = async ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    let address = "Destino seleccionado";
    try {
      const addressDetails = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (addressDetails?.[0]) {
        address = `${addressDetails[0].name ?? address}, ${addressDetails[0].region ?? ""}`.replace(
          /,\s*$/,
          "",
        );
      }
    } catch {
      address = "Destino seleccionado";
    }

    setDestinationLocation({
      latitude,
      longitude,
      address,
    });

    await sendRideRequestNotification(address);
    router.push("/(root)/find-ride");
  };

  const honorific =
    user?.firstName && /a$/i.test(user.firstName) ? "Bienvenida" : "Bienvenido";

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item: Ride, index) => String(item?.ride_id ?? index)}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No se encontraron viajes recientes"
                  resizeMode="contain"
                />
                <Text className="text-sm">
                  No se encontraron viajes recientes
                </Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between mt-2 mb-4">
              <Text className="text-2xl font-JakartaExtraBold flex-1 pr-3">
                {honorific} {user?.firstName}👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white border border-neutral-200"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <GoogleTextInput
                icon={icons.search}
                containerStyle={`bg-white rounded-2xl ${Platform.select({ web: "", default: "shadow-md shadow-neutral-300" })}`}
                handlePress={handleDestinationPress}
              />
            </View>

            <View className="mb-3">
              <Text className="text-xs font-JakartaSemiBold text-neutral-500 uppercase">
                Modo cliente
              </Text>
            </View>

            <>
              <Text className="text-xl font-JakartaBold mt-2 mb-3">
                Tu ubicación actual
              </Text>
              <View className="flex flex-row items-center bg-white h-[260px] rounded-2xl overflow-hidden border border-neutral-200">
                <Map onMapPress={handleMapPress} />
              </View>
            </>

            {activeRide && (
              <View className="bg-white border border-neutral-200 rounded-2xl p-4 mt-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-base font-JakartaSemiBold">
                    {statusLabels[activeRide.status] ?? "Estado del viaje"}
                  </Text>
                  <View className="px-3 py-1 rounded-full bg-blue-50">
                    <Text className="text-xs font-JakartaSemiBold text-blue-600">
                      {activeRide.status.split("_").join(" ")}
                    </Text>
                  </View>
                </View>
                {(activeRide.status === "driver_en_route" ||
                  activeRide.status === "arrived") && (
                  <>
                    <Text className="text-sm text-neutral-600 mt-2">
                      Comparte este código con el conductor para iniciar el
                      viaje.
                    </Text>
                    <Text className="text-2xl font-JakartaExtraBold mt-2">
                      {activeRide.verificationCode}
                    </Text>
                  </>
                )}
              </View>
            )}

            <Text className="text-xl font-JakartaBold mt-6 mb-3">
              Viajes recientes
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

const DriverHome = () => {
  const { activeRide, setRideStatus, clearActiveRide } = useRideStore();
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const canShowCodeInput = activeRide?.status === "arrived";

  const handleArrived = async () => {
    if (!activeRide?.rideId) return;
    try {
      const response = await fetchAPI("/(api)/ride/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: activeRide.rideId,
          status: "arrived",
        }),
      });
      if (response?.data?.status) {
        setRideStatus(response.data.status);
      }
    } catch (error) {
      setCodeError("No se pudo actualizar el estado del viaje.");
    }
  };

  const handleConfirmCode = async () => {
    if (!activeRide?.rideId) return;
    try {
      const response = await fetchAPI("/(api)/ride/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: activeRide.rideId,
          code: codeInput,
        }),
      });
      if (response?.data?.status) {
        setCodeError("");
        setRideStatus(response.data.status);
      }
    } catch (error) {
      setCodeError("Código incorrecto. Verifica con el cliente.");
    }
  };

  const handleFinishRide = async () => {
    if (!activeRide?.rideId) return;
    try {
      const response = await fetchAPI("/(api)/ride/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_id: activeRide.rideId,
          status: "completed",
        }),
      });
      if (response?.data?.status) {
        setRideStatus(response.data.status);
      }
      clearActiveRide();
      setCodeInput("");
      setCodeError("");
    } catch (error) {
      setCodeError("No se pudo finalizar el viaje.");
    }
  };

  return (
    <SafeAreaView className="bg-general-500 flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex flex-row items-center justify-between mt-2 mb-4">
          <Text className="text-2xl font-JakartaExtraBold flex-1 pr-3">
            Panel del conductor
          </Text>
          <View className="px-3 py-1 rounded-full bg-white border border-neutral-200">
            <Text className="text-xs font-JakartaSemiBold text-neutral-600">
              Modo conductor
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center bg-white h-[260px] rounded-2xl overflow-hidden border border-neutral-200">
          <Map mode="driver" />
        </View>

        {!activeRide && (
          <View className="bg-white border border-neutral-200 rounded-2xl p-4 mt-4">
            <Text className="text-base font-JakartaSemiBold">
              Sin viajes activos
            </Text>
            <Text className="text-sm text-neutral-600 mt-2">
              Cuando un cliente confirme un viaje, aparecerá aquí.
            </Text>
          </View>
        )}

        {activeRide && (
          <View className="bg-white border border-neutral-200 rounded-2xl p-4 mt-4">
            <Text className="text-base font-JakartaSemiBold">
              {statusLabels[activeRide.status] ?? "Estado del viaje"}
            </Text>
            <Text className="text-sm text-neutral-600 mt-2">
              Origen: {activeRide.originAddress ?? "Pendiente"}
            </Text>
            <Text className="text-sm text-neutral-600 mt-1">
              Destino: {activeRide.destinationAddress ?? "Pendiente"}
            </Text>

            {activeRide.status === "driver_en_route" && (
              <TouchableOpacity
                onPress={handleArrived}
                className="mt-4 bg-black rounded-full py-3"
              >
                <Text className="text-center text-white font-JakartaSemiBold">
                  Marcar llegada
                </Text>
              </TouchableOpacity>
            )}

            {canShowCodeInput && (
              <View className="mt-4">
                <InputField
                  label="Código de verificación"
                  placeholder="Ingresa el código"
                  icon={icons.lock}
                  keyboardType="numeric"
                  value={codeInput}
                  onChangeText={(value) => {
                    setCodeInput(value);
                    setCodeError("");
                  }}
                />
                {codeError ? (
                  <Text className="text-red-500 text-sm mt-1">
                    {codeError}
                  </Text>
                ) : null}
                <TouchableOpacity
                  onPress={handleConfirmCode}
                  className="mt-3 bg-success-500 rounded-full py-3"
                >
                  <Text className="text-center text-white font-JakartaSemiBold">
                    Iniciar viaje
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {activeRide.status === "in_progress" && (
              <TouchableOpacity
                onPress={handleFinishRide}
                className="mt-4 bg-neutral-900 rounded-full py-3"
              >
                <Text className="text-center text-white font-JakartaSemiBold">
                  Finalizar viaje
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const normalizeRole = (value: unknown) =>
  value === "driver" ? "driver" : value === "client" ? "client" : null;

const Home = () => {
  const { user } = useUser();
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { role, setRole } = useRoleStore();
  const initialIndex = role === "driver" ? 1 : 0;
  const [isRoleReady, setIsRoleReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadRole = async () => {
      const storedRole = await getStoredRole();
      if (!isMounted) return;
      const targetIndex = storedRole === "driver" ? 1 : 0;
      setRole(storedRole);
      setActiveIndex(targetIndex);
      setIsRoleReady(true);
      if (targetIndex) {
        swiperRef.current?.scrollBy(targetIndex, false);
      }

      if (!user?.id) return;
      const clerkRole = normalizeRole(user?.publicMetadata?.role);
      if (clerkRole && clerkRole !== storedRole) {
        const clerkIndex = clerkRole === "driver" ? 1 : 0;
        setRole(clerkRole);
        setActiveIndex(clerkIndex);
        setStoredRole(clerkRole);
        if (clerkIndex) {
          swiperRef.current?.scrollBy(clerkIndex, false);
        }
      }

      const response = await fetchAPI(
        `/(api)/user/role?clerk_id=${user.id}`,
      );
      if (!isMounted) return;
      if (response?.data?.role) {
        const dbRole = normalizeRole(response.data.role);
        if (dbRole && dbRole !== storedRole && dbRole !== clerkRole) {
          const dbIndex = dbRole === "driver" ? 1 : 0;
          setRole(dbRole);
          setActiveIndex(dbIndex);
          setStoredRole(dbRole);
          if (dbIndex) {
            swiperRef.current?.scrollBy(dbIndex, false);
          }
        }
      } else {
        await fetchAPI("/(api)/user/role", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerk_id: user.id,
            role: clerkRole ?? storedRole,
          }),
        });
      }

      if (!clerkRole && user?.update) {
        await user.update({
          publicMetadata: { role: storedRole },
        });
      }
    };
    loadRole();
    return () => {
      isMounted = false;
    };
  }, [setRole, user?.id]);
  const roleLabel = useMemo(
    () => (activeIndex === 0 ? "Cliente" : "Conductor"),
    [activeIndex],
  );

  return (
    <View className="flex-1 bg-general-500">
      <Swiper
        ref={swiperRef}
        loop={false}
        index={isRoleReady ? initialIndex : 0}
        onIndexChanged={(index) => {
          setActiveIndex(index);
          const nextRole = index === 0 ? "client" : "driver";
          setRole(nextRole);
          setStoredRole(nextRole);
          if (user?.id) {
            fetchAPI("/(api)/user/role", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clerk_id: user.id,
                role: nextRole,
              }),
            });
            if (user?.update) {
              user.update({
                publicMetadata: { role: nextRole },
              });
            }
          }
        }}
        dot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
        }
        activeDot={
          <View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
        }
      >
        <CustomerHome />
        <DriverHome />
      </Swiper>
      <View className="absolute top-3 right-5 bg-white border border-neutral-200 rounded-full px-3 py-1">
        <Text className="text-xs font-JakartaSemiBold text-neutral-600">
          {roleLabel}
        </Text>
      </View>
    </View>
  );
};

export default Home;
