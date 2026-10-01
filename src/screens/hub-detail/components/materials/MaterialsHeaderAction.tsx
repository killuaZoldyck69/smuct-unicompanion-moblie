import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
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
    // Only teachers/CRs can upload Official Course Materials.
    // Students can share resources in the Student Resources tab.
    const isOfficialTab = activeTab === "OFFICIAL";
    const canUploadInCurrentTab = isOfficialTab ? canManage : true;

    // Contextual button label
    const buttonLabel = isOfficialTab
      ? "Upload Course Material"
      : "Share Student Resource";

    const buttonSublabel = isOfficialTab
      ? "Official slides, syllabus & lecture files"
      : "Class notes, solved papers & guides";

    return (
      <View style={styles.container}>
        {canUploadInCurrentTab ? (
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={onUploadPress}
            activeOpacity={0.88}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}
          >
            <View style={styles.btnLeftContent}>
              <View style={styles.iconCircle}>
                <Feather
                  name={isOfficialTab ? "upload-cloud" : "plus"}
                  size={15}
                  color="#ffffff"
                />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.btnTitle}>{buttonLabel}</Text>
                <Text style={styles.btnSub}>{buttonSublabel}</Text>
              </View>
            </View>

            <View style={styles.arrowCircle}>
              <Feather name="arrow-up-right" size={14} color="rgba(255, 255, 255, 0.7)" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.studentOfficialNotice}>
            <View style={styles.noticeIconCircle}>
              <Feather name="info" size={13} color="#0284c7" />
            </View>
            <Text style={styles.studentOfficialNoticeText}>
              Official course materials are uploaded by faculty. Switch to{" "}
              <Text style={styles.highlightText}>Student Resources</Text> to share notes.
            </Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  btnLeftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  textCol: {
    flex: 1,
  },
  btnTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  btnSub: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  studentOfficialNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.15)",
  },
  noticeIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  studentOfficialNoticeText: {
    fontFamily,
    fontSize: 11.5,
    color: "#0369a1",
    flex: 1,
    lineHeight: 16,
  },
  highlightText: {
    fontWeight: "700",
  },
});
