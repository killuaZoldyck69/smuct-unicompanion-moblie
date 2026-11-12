import React, { useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "@/theme/colors";
import { SPACING, fontFamily } from "../../constants";
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
        <Feather name="log-out" size={16} color={colors.semantic.red.accent} />
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
    minHeight: 50,
    backgroundColor: colors.semantic.rose.tint,
    paddingVertical: 13,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.semantic.red.alpha22,
    marginBottom: SPACING.md,
    gap: 8,
  },
  text: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: 0.1,
    color: colors.semantic.red.accent,
  },
});
