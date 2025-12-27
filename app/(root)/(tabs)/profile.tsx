import { useAuth, useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants";

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Invitado";

  const stats = [
    { id: "deliveries", value: "174", label: "Entregas" },
    { id: "rate", value: "100%", label: "Satisfacción" },
  ];

  const compliments = [
    { id: "fast", label: "Rápido", icon: icons.checkmark, count: 10 },
    { id: "safe", label: "Seguro", icon: icons.target, count: 10 },
    { id: "kind", label: "Amable", icon: icons.chat, count: 10 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex flex-row items-center justify-between mt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-white border border-neutral-200"
          >
            <Image source={icons.close} className="w-4 h-4" />
          </TouchableOpacity>
          <Text className="text-base font-JakartaMedium text-neutral-700">
            Perfil
          </Text>
          <View className="w-10 h-10" />
        </View>

        <View className="items-center mt-6">
          <View className="w-28 h-28 rounded-full bg-neutral-200 items-center justify-center">
            {user?.imageUrl || user?.externalAccounts[0]?.imageUrl ? (
              <Image
                source={{
                  uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                }}
                className="w-28 h-28 rounded-full"
              />
            ) : (
              <Image source={icons.profile} className="w-10 h-10" />
            )}
          </View>
          <View className="flex-row items-center mt-3 px-3 py-1 rounded-full bg-white border border-neutral-200">
            <Image source={icons.star} className="w-3 h-3 mr-2" />
            <Text className="text-xs font-JakartaMedium text-neutral-700">
              Platinum
            </Text>
          </View>
          <Text className="text-2xl font-JakartaExtraBold mt-3">
            {fullName}
          </Text>
          <Text className="text-sm text-neutral-500 mt-1">
            174 viajes desde Mayo 2023
          </Text>
        </View>

        <View className="flex-row justify-between mt-5">
          <TouchableOpacity
            onPress={() => router.push("/(root)/(tabs)/home")}
            className="flex-1 bg-white rounded-2xl py-3 items-center border border-neutral-200 mr-2"
          >
            <Text className="text-sm font-JakartaSemiBold text-neutral-700">
              Mi perfil
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              signOut();
              router.replace("/(auth)/sign-in");
            }}
            className="flex-1 bg-white rounded-2xl py-3 items-center border border-neutral-200 ml-2"
          >
            <Text className="text-sm font-JakartaSemiBold text-red-500">
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mt-6">
          {stats.map((stat) => (
            <View
              key={stat.id}
              className="flex-1 bg-white rounded-2xl py-4 items-center border border-neutral-200 mx-1"
            >
              <Text className="text-xl font-JakartaBold">{stat.value}</Text>
              <Text className="text-xs text-neutral-500 mt-1">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <Text className="text-base font-JakartaBold mt-8 mb-3">
          Customer compliments
        </Text>
        <View className="flex-row justify-between">
          {compliments.map((item) => (
            <View key={item.id} className="items-center flex-1">
              <View className="w-14 h-14 rounded-full bg-white border border-neutral-200 items-center justify-center">
                <Image source={item.icon} className="w-6 h-6" />
                <View className="absolute -top-1 -right-1 bg-black rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-[10px] text-white">
                    {item.count}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-neutral-600 mt-2">
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
