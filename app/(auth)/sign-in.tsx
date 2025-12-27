import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import Swiper from "react-native-swiper";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { getClerkErrorMessage } from "@/lib/auth";
import { setStoredRole } from "@/lib/role";
import { useRoleStore } from "@/store";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { role, setRole } = useRoleStore();
  const [roleIndex, setRoleIndex] = useState(role === "driver" ? 1 : 0);

  const roleSlides = useMemo(
    () => [
      {
        key: "client",
        title: "Cliente",
        subtitle: "Viajes rapidos y seguros",
        badge: "Rider",
        icon: icons.person,
        details:
          "Reserva, sigue el mapa y comparte el codigo con tu conductor.",
      },
      {
        key: "driver",
        title: "Conductor",
        subtitle: "Gestiona tus viajes",
        badge: "Driver",
        icon: icons.marker,
        details: "Marca llegada, valida el codigo y comienza el viaje.",
      },
    ],
    [],
  );

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "El inicio de sesión falló. Intenta de nuevo.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", getClerkErrorMessage(err));
    }
  }, [isLoaded, form, setActive, signIn]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[200px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[200px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Bienvenido a MoviGO 👋
          </Text>
        </View>

        <View className="p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-neutral-500 font-JakartaMedium">
              Elige tu rol
            </Text>
            <View className="px-3 py-1 rounded-full bg-blue-50">
              <Text className="text-xs font-JakartaSemiBold text-blue-600">
                {roleIndex === 0 ? "Cliente" : "Conductor"}
              </Text>
            </View>
          </View>
          <View className="bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
            <Swiper
              loop={false}
              index={roleIndex}
              onIndexChanged={(index) => {
                const nextRole = index === 0 ? "client" : "driver";
                setRoleIndex(index);
                setRole(nextRole);
                setStoredRole(nextRole);
              }}
              dot={
                <View className="w-[24px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
              }
              activeDot={
                <View className="w-[24px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
              }
              height={520}
            >
              {roleSlides.map((slide) => (
                <ScrollView
                  key={slide.key}
                  className="flex-1 px-5 py-4"
                  contentContainerStyle={{ paddingBottom: 24 }}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center border border-neutral-200 mr-3">
                        <Image source={slide.icon} className="w-6 h-6" />
                      </View>
                      <View>
                        <Text className="text-lg font-JakartaSemiBold">
                          {slide.title}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                          {slide.subtitle}
                        </Text>
                      </View>
                    </View>
                    <View className="px-3 py-1 rounded-full bg-white border border-neutral-200">
                      <Text className="text-xs font-JakartaSemiBold text-neutral-600">
                        {slide.badge}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-5">
                    <InputField
                      label="Correo electrónico"
                      placeholder="Ingresa tu correo"
                      icon={icons.email}
                      labelStyle="text-base mb-2"
                      textContentType="emailAddress"
                      value={form.email}
                      onChangeText={(value) =>
                        setForm({ ...form, email: value })
                      }
                    />

                    <InputField
                      label="Contraseña"
                      placeholder="Ingresa tu contraseña"
                      icon={icons.lock}
                      labelStyle="text-base mb-2"
                      secureTextEntry={true}
                      textContentType="password"
                      value={form.password}
                      onChangeText={(value) =>
                        setForm({ ...form, password: value })
                      }
                    />

                    <CustomButton
                      title="Iniciar sesión"
                      onPress={onSignInPress}
                      className="mt-3"
                    />

                    <OAuth />
                  </View>
                </ScrollView>
              ))}
            </Swiper>
          </View>
          <Link
            href="/sign-up"
            className="text-base text-center text-neutral-600 mt-4 mb-2"
          >
            ¿No tienes cuenta?{" "}
            <Text className="text-primary-500">Regístrate</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
