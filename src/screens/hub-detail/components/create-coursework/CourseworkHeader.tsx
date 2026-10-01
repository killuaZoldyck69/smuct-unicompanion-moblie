import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./constants";

interface Props {
  onClose: () => void;
  isPending: boolean;
  isUploading: boolean;
}

export const CourseworkHeader: React.FC<Props> = ({
  onClose,
  isPending,
  isUploading,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>New Coursework</Text>
      </View>

      <TouchableOpacity
        onPress={onClose}
        disabled={isPending || isUploading}
        style={styles.closeBtn}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Close coursework creation modal"
      >
        <Feather name="x" size={18} color={BENTO.navy} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: BENTO.canvas,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
});
