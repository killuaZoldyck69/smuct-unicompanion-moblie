import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "../constants";
import { styles } from "../styles";

interface CreateHubHeaderProps {
  onClose: () => void;
}

export const CreateHubHeader = React.memo(function CreateHubHeader({
  onClose,
}: CreateHubHeaderProps) {
  return (
    <View style={styles.modalHeader}>
      <View style={styles.headerLeftGroup}>
        <Text style={styles.headerTitle}>New Course Hub</Text>
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={styles.closeBtn}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Close create hub modal"
      >
        <Feather name="x" size={18} color={BENTO_THEME.navy} />
      </TouchableOpacity>
    </View>
  );
});
