import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  let BottomSheet: any = null;
  let BottomSheetView: any = null;
  let BottomSheetScrollView: any = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bs = require("@gorhom/bottom-sheet");
    BottomSheet = bs.default;
    BottomSheetView = bs.BottomSheetView;
    BottomSheetScrollView = bs.BottomSheetScrollView;
  } catch {
    BottomSheet = null;
  }

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
      {BottomSheet ? (
        <BottomSheet snapPoints={snapPoints || ["40%", "85%"]} index={0}>
          {title === "Elige un conductor" ? (
            <BottomSheetView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetView>
          ) : (
            <BottomSheetScrollView
              style={{
                flex: 1,
                padding: 20,
              }}
            >
              {children}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      ) : (
        <ScrollView
          style={{ flex: 1, padding: 20 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
};

export default RideLayout;
