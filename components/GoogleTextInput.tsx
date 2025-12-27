import { View, Image, Platform } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const shadow = Platform.select({
    web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" },
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  });
  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 w-full ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder="Buscar"
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 4,
            position: "relative",
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "white",
            borderWidth: 1,
            borderColor: "#E6E6E6",
            ...(shadow as object),
          },
          textInput: {
            backgroundColor: "transparent",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 2,
            width: "100%",
            borderRadius: 16,
            paddingVertical: 10,
          },
          listView: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "white",
            position: "relative",
            top: 6,
            width: "100%",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E6E6E6",
            ...(shadow as object),
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) => {
          handlePress({
            latitude: details?.geometry.location.lat!,
            longitude: details?.geometry.location.lng!,
            address: data.description,
          });
        }}
        query={{
          key: googlePlacesApiKey,
          language: "es",
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-9 h-9 rounded-full bg-neutral-100">
            <Image
              source={icon ? icon : icons.search}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
          placeholder: initialLocation ?? "¿A dónde quieres ir?",
        }}
      />
    </View>
  );
};

export default GoogleTextInput;
