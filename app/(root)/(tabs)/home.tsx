import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
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

import GoogleTextInput from "@/components/GoogleTextInput";
import InputField from "@/components/InputField";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import {
  registerForPushNotificationsAsync,
  sendRideRequestNotification,
} from "@/lib/notifications";
import { getStoredRole, setStoredRole } from "@/lib/role";
import { registerWebPushNotifications } from "@/lib/webPush";
import {
  useDriverStore,
  useLocationStore,
  useRideStore,
  useRoleStore,
} from "@/store";
import { Ride } from "@/types/type";

const statusLabels: Record<string, string> = {
  driver_en_route: "Conductor en camino",
  arrived: "Conductor llegó",
  in_progress: "Viaje en curso",
  completed: "Viaje finalizado",
};

const CustomerHome = () => {
  const { user } = useUser();

  const { setUserLocation, setDestinationLocation } = useLocationStore();
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const { activeRide } = useRideStore();
  const [isTaxiModalOpen, setTaxiModalOpen] = useState(false);

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
    setTaxiModalOpen(true);
  };

  const sortedDrivers = useMemo(() => {
    if (!drivers?.length) return [];
    return [...drivers].sort((a, b) => {
      const aTime = a.time ?? Number.POSITIVE_INFINITY;
      const bTime = b.time ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  }, [drivers]);

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
      <Modal
        visible={isTaxiModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTaxiModalOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setTaxiModalOpen(false)}
          className="flex-1 justify-end bg-black/40"
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-t-[32px] px-5 pt-4 pb-8 border border-neutral-200"
          >
          <View className="items-center mb-3">
            <View className="w-10 h-1.5 rounded-full bg-neutral-200" />
          </View>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-JakartaExtraBold">
              Taxis disponibles
            </Text>
            <View className="px-3 py-1 rounded-full bg-emerald-50">
              <Text className="text-xs font-JakartaSemiBold text-emerald-700">
                {sortedDrivers.length} disponibles
              </Text>
            </View>
          </View>

          {sortedDrivers.length === 0 ? (
            <View className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4">
              <Text className="text-sm text-neutral-600">
                No hay taxis cerca por ahora. Intenta en unos minutos.
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedDrivers.slice(0, 6)}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
              ItemSeparatorComponent={() => <View className="w-3" />}
              renderItem={({ item }) => {
                const isSelected = selectedDriver === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedDriver(item.id)}
                    className={`w-44 rounded-2xl border p-3 ${
                      isSelected
                        ? "bg-general-600 border-neutral-300"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Image
                        source={{ uri: item.profile_image_url }}
                        className="w-12 h-12 rounded-full"
                      />
                      <View className="items-center">
                        <Image
                          source={{ uri: item.car_image_url }}
                          className="w-10 h-10"
                          resizeMode="contain"
                        />
                        <Text className="text-[10px] text-neutral-500 mt-1">
                          {item.car_seats} asientos
                        </Text>
                      </View>
                    </View>
                    <Text className="text-base font-JakartaSemiBold mt-3">
                      {item.title}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Image source={icons.star} className="w-3 h-3 mr-1" />
                      <Text className="text-xs text-neutral-600">
                        {(Number(item.rating ?? 4.8)).toFixed(1)}
                      </Text>
                      <Text className="text-xs text-neutral-400 mx-2">•</Text>
                      <Text className="text-xs text-neutral-600">
                        {item.time ? `${item.time.toFixed(0)} min` : "Calculando"}
                      </Text>
                    </View>
                    <View className="mt-2 px-2 py-1 rounded-full bg-black">
                      <Text className="text-xs text-white text-center">
                        ${item.price ?? "--"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <View className="flex-row items-center mt-6">
            <TouchableOpacity
              onPress={() => {
                setTaxiModalOpen(false);
                router.push("/(root)/confirm-ride");
              }}
              className="flex-1 bg-white border border-neutral-200 rounded-full py-3 mr-2"
            >
              <Text className="text-center text-sm font-JakartaSemiBold text-neutral-700">
                Ver lista completa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (!selectedDriver && sortedDrivers[0]) {
                  setSelectedDriver(sortedDrivers[0].id);
                }
                setTaxiModalOpen(false);
                router.push("/(root)/book-ride");
              }}
              className="flex-1 bg-black rounded-full py-3 ml-2"
            >
              <Text className="text-center text-sm font-JakartaSemiBold text-white">
                Elegir este taxi
              </Text>
            </TouchableOpacity>
          </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const DriverHome = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const { setUserLocation } = useLocationStore();
  const { activeRide, setRideStatus, clearActiveRide } = useRideStore();
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const canShowCodeInput = activeRide?.status === "arrived";

  useEffect(() => {
    let isMounted = true;

    const registerDriverToken = async () => {
      if (!userId) return;
      if (user?.fullName) {
        const [firstName, ...lastNameParts] = user.fullName
          .trim()
          .split(" ");
        try {
          await fetchAPI("/(api)/driver", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerk_id: userId,
              first_name: firstName || "Conductor",
              last_name: lastNameParts.join(" ") || "MoviGO",
              profile_image_url: user.imageUrl || null,
            }),
          });
        } catch {
          // driver creation should not block token registration
        }
      }

      const provider = Platform.OS === "web" ? "fcm" : "expo";
      const token =
        Platform.OS === "web"
          ? await registerWebPushNotifications()
          : await registerForPushNotificationsAsync();

      if (!isMounted) return;

      try {
        const payload: Record<string, unknown> = {
          clerk_id: userId,
          is_online: true,
        };
        if (token) {
          payload.push_token = token;
          payload.push_provider = provider;
        }

        await fetchAPI("/(api)/driver", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // silent: token registration should not block UI
      }
    };

    registerDriverToken();
    return () => {
      isMounted = false;
    };
  }, [user?.fullName, user?.imageUrl, userId]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
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
          <Map mode="driver" driverClerkId={user?.id ?? null} />
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
  const { role, setRole } = useRoleStore();
  const [isRoleReady, setIsRoleReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadRole = async () => {
      const storedRole = await getStoredRole();
      if (!isMounted) return;
      setRole(storedRole);
      setIsRoleReady(true);

      if (!user?.id) return;
      const clerkRole = normalizeRole(user?.publicMetadata?.role);
      if (clerkRole && clerkRole !== storedRole) {
        setRole(clerkRole);
        setStoredRole(clerkRole);
      }

      const response = await fetchAPI(
        `/(api)/user/role?clerk_id=${user.id}`,
      );
      if (!isMounted) return;
      if (response?.data?.role) {
        const dbRole = normalizeRole(response.data.role);
        if (dbRole && dbRole !== storedRole && dbRole !== clerkRole) {
          setRole(dbRole);
          setStoredRole(dbRole);
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
    () => (role === "driver" ? "Conductor" : "Cliente"),
    [role],
  );

  return (
    <View className="flex-1 bg-general-500">
      {isRoleReady && role === "driver" ? <DriverHome /> : <CustomerHome />}
      <View className="absolute top-3 right-5 bg-white border border-neutral-200 rounded-full px-3 py-1">
        <Text className="text-xs font-JakartaSemiBold text-neutral-600">
          {roleLabel}
        </Text>
      </View>
    </View>
  );
};

export default Home;
