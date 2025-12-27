import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(auth)/sign-in"),
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });

        if (signUp.createdUserId) {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
        }

        return {
          success: true,
          code: "success",
          message: "Has iniciado sesión con Google correctamente",
        };
      }
    }

    return {
      success: false,
      message: "Ocurrió un error al iniciar sesión con Google",
    };
  } catch (err: any) {
    console.error(err);
    const message = getClerkErrorMessage(err);
    return {
      success: false,
      code: err.code,
      message,
    };
  }
};

const clerkErrorMap = new Map<string, string>([
  ["Enter password", "Ingresa tu contraseña."],
  ["Enter email address", "Ingresa tu correo electrónico."],
  ["Enter email", "Ingresa tu correo electrónico."],
  ["Invalid email address", "El correo electrónico no es válido."],
  ["Password is too short", "La contraseña es demasiado corta."],
  ["Password must be at least 8 characters long", "La contraseña debe tener al menos 8 caracteres."],
  ["Identifier is invalid.", "El correo electrónico no es válido."],
  ["Email address is already in use", "El correo electrónico ya está en uso."],
  ["Verification failed. Please try again.", "La verificación falló. Intenta de nuevo."],
  ["Invalid verification strategy", "La estrategia de verificación no es válida."],
  [
    "The verification strategy is not valid for this account",
    "La estrategia de verificación no es válida para esta cuenta.",
  ],
  [
    "That email address is taken. Please try another.",
    "Ese correo ya está en uso. Prueba con otro.",
  ],
  ["Passwords must be 8 characters or more.", "La contraseña debe tener 8 caracteres o más."],
  [
    "Password has been found in an online data breach. For account safety, please use a different password.",
    "Esta contraseña apareció en una filtración. Por seguridad, usa una diferente.",
  ],
]);

const clerkErrorCodeMap = new Map<string, string>([
  ["strategy_for_user_invalid", "La estrategia de verificación no es válida para esta cuenta."],
  ["form_identifier_exists", "Ese correo ya está en uso. Usa otro."],
  ["form_password_length_too_short", "La contraseña debe tener 8 caracteres o más."],
  ["form_password_pwned", "Esta contraseña apareció en una filtración. Usa una contraseña diferente."],
]);

export const localizeClerkError = (message?: string, code?: string) => {
  if (code && clerkErrorCodeMap.has(code)) {
    return clerkErrorCodeMap.get(code) as string;
  }
  if (!message) {
    return "Ocurrió un error. Intenta de nuevo.";
  }
  const normalized = message.trim();
  if (clerkErrorMap.has(normalized)) {
    return clerkErrorMap.get(normalized) as string;
  }
  if (/enter password/i.test(normalized)) {
    return "Ingresa tu contraseña.";
  }
  if (/enter email/i.test(normalized)) {
    return "Ingresa tu correo electrónico.";
  }
  return message;
};

export const getClerkErrorMessage = (err: any) =>
  localizeClerkError(
    err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message,
    err?.errors?.[0]?.code,
  );
