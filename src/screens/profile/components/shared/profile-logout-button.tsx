import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { PROFILE_COLORS, fontFamily } from "../../constants";
import { performLogout } from "../../utils";
import { LogoutModal } from "./logout-modal";

interface ProfileLogoutButtonProps {
  onBeforeLogout?: () => void;
}

export const ProfileLogoutButton = React.memo(function ProfileLogoutButton({
  onBeforeLogout,
}: ProfileLogoutButtonProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (onBeforeLogout) {
        onBeforeLogout();
      }
      await performLogout(router, queryClient);
    } finally {
      setIsLoggingOut(false);
      setIsModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Sign out of your account"
      >
        <Feather
          name="log-out"
          size={16}
          color="#dc2626"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.text}>Log Out</Text>
      </TouchableOpacity>

      <LogoutModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2",
    paddingVertical: 13,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.22)",
    marginTop: 6,
    marginBottom: 20,
    gap: 8,
  },
  text: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#dc2626",
  },
});
