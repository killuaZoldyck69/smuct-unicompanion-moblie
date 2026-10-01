import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialSectionTab } from "./types";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface MaterialsEmptyStateProps {
  activeTab: MaterialSectionTab;
  canManage: boolean;
  onUploadPress: () => void;
}

export const MaterialsEmptyState: React.FC<MaterialsEmptyStateProps> = React.memo(
  ({ activeTab, canManage, onUploadPress }) => {
    const isOfficial = activeTab === "OFFICIAL";
    const canUpload = isOfficial ? canManage : true;

    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Feather
            name={isOfficial ? "folder" : "users"}
            size={30}
            color={isOfficial ? "#2563eb" : "#16a34a"}
          />
        </View>

        <Text style={styles.title}>
          {isOfficial ? "No Course Materials Yet" : "No Student Resources Yet"}
        </Text>

        <Text style={styles.subtitle}>
          {isOfficial
            ? "Faculty and instructors will post official syllabus, lecture slides, and course outlines here."
            : "Share lecture summaries, handwritten notes, reference materials, or question banks with peers."}
        </Text>

        {canUpload && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onUploadPress}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isOfficial ? "Upload Course Material" : "Share Student Resource"}
          >
            <Feather
              name={isOfficial ? "upload-cloud" : "plus"}
              size={15}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnText}>
              {isOfficial ? "Upload Course Material" : "Share Student Resource"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily,
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  actionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
