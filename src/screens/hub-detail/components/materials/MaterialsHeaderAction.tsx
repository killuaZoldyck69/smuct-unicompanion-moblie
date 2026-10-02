import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { MaterialSectionTab } from "./types";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface MaterialsHeaderActionProps {
  canManage: boolean;
  activeTab: MaterialSectionTab;
  onUploadPress: () => void;
}

export const MaterialsHeaderAction: React.FC<MaterialsHeaderActionProps> = React.memo(
  ({ canManage, activeTab, onUploadPress }) => {
    // Only Teachers and CRs (canManage) can upload Course Materials.
    // Student Resources can be uploaded by all students & teachers.
    const isOfficialTab = activeTab === "OFFICIAL";
    const canUpload = isOfficialTab ? canManage : true;

    const sectionTitle = isOfficialTab
      ? "Course Materials"
      : "Student Resources";

    const sectionSubtitle = isOfficialTab
      ? "Uploaded by Teacher & CR"
      : "Contributed by Peers & Classmates";

    const handleLockNotice = () => {
      Toast.show({
        type: "info",
        text1: "Course Materials",
        text2: "Only teachers and CRs can upload official course materials. Switch to Student Resources to share notes.",
      });
    };

    return (
      <View style={styles.container}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <Text style={styles.sectionSubtitle}>{sectionSubtitle}</Text>
        </View>

        {canUpload ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onUploadPress}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Upload to ${sectionTitle}`}
          >
            <Feather name="plus" size={18} color="#0f172a" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.lockBadge}
            onPress={handleLockNotice}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Only teachers and CRs can upload course materials"
          >
            <Feather name="lock" size={13} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
});
