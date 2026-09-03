import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { PROFILE_COLORS, fontFamily } from "../../constants";
import { confirmLogout, performLogout } from "../../utils";

export const ProfileLogoutButton = React.memo(function ProfileLogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handlePress = () => {
    confirmLogout(() => {
      performLogout(router, queryClient);
    });
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Sign out of your account"
    >
      <Feather
        name="log-out"
        size={18}
        color="#dc2626"
        style={{ marginRight: 8 }}
      />
      <Text style={styles.text}>Log Out</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 15,
    borderRadius: PROFILE_COLORS.pillRadius,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.15)",
  },
  text: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#dc2626",
  },
});
