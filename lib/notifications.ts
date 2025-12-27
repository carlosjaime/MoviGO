import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "web") return null;

  const settings = await Notifications.getPermissionsAsync();
  let status = settings.status;

  if (status !== "granted") {
    const request = await Notifications.requestPermissionsAsync();
    status = request.status;
  }

  if (status !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#111827",
    });
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
};

export const sendRideRequestNotification = async (
  destination?: string | null,
) => {
  await Notifications.presentNotificationAsync({
    title: "Taxi solicitado",
    body: destination
      ? `Destino: ${destination}`
      : "Estamos buscando un conductor.",
    data: { type: "ride_request" },
  });
};
