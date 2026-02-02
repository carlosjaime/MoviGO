import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import LoadingOverlay from "@/components/LoadingOverlay";
import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";
import { useRoleStore } from "@/store";

const OAuth = ({ role }: { role?: "client" | "driver" }) => {
  const { role: storedRole } = useRoleStore();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const result = await googleOAuth(startOAuthFlow, role ?? storedRole);
    setIsLoading(false);

    if (result.code === "session_exists") {
      Alert.alert("Éxito", "La sesión existe. Redirigiendo al inicio.");
      router.replace("/(root)/(tabs)/home");
      return;
    }

    if (result.success) {
      router.replace("/(root)/(tabs)/home");
      return;
    }

    Alert.alert("Error", result.message);
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-3 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">O</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Iniciar sesión con Google"
        className="mt-3 w-full py-4"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
      <LoadingOverlay visible={isLoading} message="Conectando..." />
    </View>
  );
};

export default OAuth;
