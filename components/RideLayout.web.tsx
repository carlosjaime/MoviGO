import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import Map from "@/components/Map";
import { icons } from "@/constants";

const RideLayout = ({
  title,
  snapPoints,
  children,
}: {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
}) => {
  return (
    <View className="flex-1 bg-white">
      <View className="flex flex-col h-screen bg-blue-500">
        <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
          <TouchableOpacity onPress={() => router.back()}>
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
              <Image
                source={icons.backArrow}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-JakartaSemiBold ml-5">
            {title || "Regresar"}
          </Text>
        </View>
        <Map />
      </View>
      <View style={{ flex: 1, padding: 20 }}>{children}</View>
    </View>
  );
};

export default RideLayout;
