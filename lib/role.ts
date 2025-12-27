import * as SecureStore from "expo-secure-store";

const ROLE_KEY = "movigo_user_role";

type UserRole = "client" | "driver";

export const getStoredRole = async (): Promise<UserRole> => {
  const role = await SecureStore.getItemAsync(ROLE_KEY);
  return role === "driver" ? "driver" : "client";
};

export const setStoredRole = async (role: UserRole) => {
  await SecureStore.setItemAsync(ROLE_KEY, role);
};
