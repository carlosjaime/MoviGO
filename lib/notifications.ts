import Constants from "expo-constants";
import { Platform } from "react-native";

const getNotificationsModule = () => {
  if (Platform.OS === "web") return null;
  if (Constants.executionEnvironment === "storeClient") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as typeof import("expo-notifications");
  } catch {
    return null;
  }
};

export const configureNotifications = () => {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const registerForPushNotificationsAsync = async () => {
  const Notifications = getNotificationsModule();
  if (!Notifications) return null;

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
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  await Notifications.presentNotificationAsync({
    title: "Taxi solicitado",
    body: destination
      ? `Destino: ${destination}`
      : "Estamos buscando un conductor.",
    data: { type: "ride_request" },
  });
};
