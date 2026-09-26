import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "../constants";
import { styles } from "../styles";

interface CreateHubFooterProps {
  isPending: boolean;
  onCreate: () => void;
  onReset: () => void;
}

export const CreateHubFooter = React.memo(function CreateHubFooter({
  isPending,
  onCreate,
  onReset,
}: CreateHubFooterProps) {
  return (
    <View style={styles.bottomActions}>
      <TouchableOpacity
        style={[styles.bottomCreateBtn, isPending && { opacity: 0.7 }]}
        onPress={onCreate}
        disabled={isPending}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create course hub"
        activeOpacity={0.85}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Feather
              name="plus-circle"
              size={17}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.bottomCreateBtnText}>Create Course Hub</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onReset}
        style={styles.bottomResetBtn}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Reset form fields"
        activeOpacity={0.7}
      >
        <Feather
          name="refresh-cw"
          size={15}
          color={BENTO_THEME.slate}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.bottomResetBtnText}>Reset Form</Text>
      </TouchableOpacity>
    </View>
  );
});
