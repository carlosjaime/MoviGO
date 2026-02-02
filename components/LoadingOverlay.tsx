import { ActivityIndicator, Modal, Text, View } from "react-native";

const LoadingOverlay = ({
  visible,
  message,
}: {
  visible: boolean;
  message?: string;
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-44 h-44 rounded-3xl bg-neutral-900 items-center justify-center shadow-lg shadow-black/30">
          <Text className="text-base font-JakartaSemiBold text-white mb-4">
            {message || "Loading..."}
          </Text>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;
