import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, ScrollView, Text, View } from "react-native";
import Swiper from "react-native-swiper";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { getClerkErrorMessage } from "@/lib/auth";
import { fetchAPI } from "@/lib/fetch";
import { setStoredRole } from "@/lib/role";
import { useRoleStore } from "@/store";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { role, setRole } = useRoleStore();
  const [roleIndex, setRoleIndex] = useState(role === "driver" ? 1 : 0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

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

  useEffect(() => {
    if (verification.state === "success") {
      setShowSuccessModal(true);
    }
  }, [verification.state]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", getClerkErrorMessage(err));
    }
  };
  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        const nextRole = roleIndex === 0 ? "client" : "driver";
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
            role: nextRole,
          }),
        });
        setRole(nextRole);
        setStoredRole(nextRole);
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "La verificación falló. Intenta de nuevo.",
          state: "failed",
        });
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setVerification({
        ...verification,
        error: getClerkErrorMessage(err),
        state: "failed",
      });
    }
  };
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[200px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[200px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Crea tu cuenta
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
              height={580}
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
                      label="Nombre"
                      placeholder="Ingresa tu nombre"
                      icon={icons.person}
                      labelStyle="text-base mb-2"
                      value={form.name}
                      onChangeText={(value) =>
                        setForm({ ...form, name: value })
                      }
                    />
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
                      title="Regístrate"
                      onPress={onSignUpPress}
                      className="mt-3"
                    />
                    <OAuth />
                  </View>
                </ScrollView>
              ))}
            </Swiper>
          </View>
          <Link
            href="/sign-in"
            className="text-base text-center text-neutral-600 mt-4 mb-2"
          >
            ¿Ya tienes una cuenta?{" "}
            <Text className="text-primary-500">Inicia sesión</Text>
          </Link>
        </View>
        <Modal
          transparent
          animationType="fade"
          visible={verification.state === "pending"}
          onRequestClose={() => {}}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px] w-full">
              <Text className="font-JakartaExtraBold text-2xl mb-2">
                Verificación
              </Text>
              <Text className="font-Jakarta mb-5">
                Te hemos enviado un código de verificación a {form.email}.
              </Text>
              <InputField
                label={"Código"}
                icon={icons.lock}
                placeholder={"12345"}
                value={verification.code}
                keyboardType="numeric"
                onChangeText={(code) =>
                  setVerification({ ...verification, code })
                }
              />
              {verification.error && (
                <Text className="text-red-500 text-sm mt-1">
                  {verification.error}
                </Text>
              )}
              <CustomButton
                title="Verificar correo"
                onPress={onPressVerify}
                className="mt-5 bg-success-500"
              />
            </View>
          </View>
        </Modal>
        <Modal
          transparent
          animationType="fade"
          visible={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px] w-full">
              <Image
                source={images.check}
                className="w-[110px] h-[110px] mx-auto my-5"
              />
              <Text className="text-3xl font-JakartaBold text-center">
                Verificado
              </Text>
              <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                Has verificado tu cuenta correctamente.
              </Text>
              <CustomButton
                title="Ir al inicio"
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push(`/(root)/(tabs)/home`);
                }}
                className="mt-5"
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};
export default SignUp;
