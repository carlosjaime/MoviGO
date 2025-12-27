import { useUser } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";

const Profile = () => {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">Mi perfil</Text>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className={` rounded-full h-[110px] w-[110px] border-[3px] border-white ${Platform.select({ web: "", default: "shadow-sm shadow-neutral-300" })}`}
            {...(Platform.OS === "web"
              ? {
                  style: {
                    width: 110,
                    height: 110,
                    borderRadius: 110 / 2,
                    boxShadow: "0px 1px 6px rgba(0,0,0,0.08)",
                  },
                }
              : {})}
          />
        </View>

        <View
          className={`flex flex-col items-start justify-center bg-white rounded-lg ${Platform.select({ web: "", default: "shadow-sm shadow-neutral-300" })} px-5 py-3`}
          {...(Platform.OS === "web"
            ? { style: { boxShadow: "0px 1px 6px rgba(0,0,0,0.08)" } }
            : {})}
        >
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="Nombre"
              placeholder={user?.firstName || "No encontrado"}
              containerStyle="w/full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Apellido"
              placeholder={user?.lastName || "No encontrado"}
              containerStyle="w/full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Correo"
              placeholder={
                user?.primaryEmailAddress?.emailAddress || "No encontrado"
              }
              containerStyle="w/full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Teléfono"
              placeholder={
                user?.primaryPhoneNumber?.phoneNumber || "No encontrado"
              }
              containerStyle="w/full"
              inputStyle="p-3.5"
              editable={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
