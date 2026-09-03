import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  pillRadius: 9999,
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 6,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface HubHeaderProps {
  hubDetails: any;
  onOptionsPress: () => void;
  onBack?: () => void;
}

export default function HubHeader({
  hubDetails,
  onOptionsPress,
  onBack,
}: HubHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/hubs");
    }
  };

  const handleCopyCode = async () => {
    if (hubDetails?.joinCode) {
      await Clipboard.setStringAsync(hubDetails.joinCode);
      Toast.show({ type: "success", text1: "Invite Code Copied!" });
    }
  };

  const handleShareCode = async () => {
    if (hubDetails?.joinCode) {
      try {
        await Share.share({
          message: `Join my class "${hubDetails.courseName}" on UniCompanion using the invite code: ${hubDetails.joinCode}`,
        });
      } catch {
        Toast.show({ type: "error", text1: "Error sharing code" });
      }
    }
  };

  return (
    <View style={styles.header}>
      {/* Top Action Row */}
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerActionBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.75}
        >
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={onOptionsPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Hub settings and options"
          activeOpacity={0.75}
        >
          <Feather name="more-vertical" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Course Title (Plus Jakarta Sans, Extra Bold, Zero Serifs) */}
      <Text style={styles.courseNameText} numberOfLines={2}>
        {hubDetails?.courseName || "Course Hub"}
      </Text>

      {/* Metadata Badges */}
      <View style={styles.metaContainer}>
        {/* Code & Credits Pill */}
        <View style={styles.metaPillRow}>
          {hubDetails?.courseCode ? (
            <View style={styles.codePill}>
              <Text style={styles.codePillText}>
                {hubDetails.courseCode}
              </Text>
            </View>
          ) : null}

          {hubDetails?.credit ? (
            <View style={styles.creditPill}>
              <Text style={styles.creditPillText}>
                {hubDetails.credit} Credits
              </Text>
            </View>
          ) : null}

          {hubDetails?.termOffer ? (
            <View style={styles.termPill}>
              <Text style={styles.termPillText}>{hubDetails.termOffer}</Text>
            </View>
          ) : null}
        </View>

        {/* Department, Batch & Semester */}
        <Text style={styles.departmentText} numberOfLines={2}>
          {hubDetails?.department}
          {hubDetails?.batch ? ` • Batch ${hubDetails.batch}` : ""}
          {hubDetails?.semesterNumber ? ` • Semester ${hubDetails.semesterNumber}` : ""}
        </Text>
      </View>

      {/* Invite Code Row */}
      <View style={styles.inviteCodeRow}>
        <Text style={styles.inviteLabel}>Invite Code:</Text>
        <View style={styles.inviteCodeBadge}>
          <Text style={styles.inviteCodeValue}>
            {hubDetails?.joinCode || "------"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.inviteActionBtn}
          onPress={handleCopyCode}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Copy invite code to clipboard"
          activeOpacity={0.75}
        >
          <Feather name="copy" size={15} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inviteActionBtn}
          onPress={handleShareCode}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Share invite code"
          activeOpacity={0.75}
        >
          <Feather name="share-2" size={15} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==================================================
// 2. STYLES
// ==================================================
const styles = StyleSheet.create({
  header: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingTop: 12,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...BENTO_COLORS.heroShadow,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  courseNameText: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  metaContainer: {
    gap: 8,
    marginBottom: 16,
  },
  metaPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  codePill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  codePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  creditPill: {
    backgroundColor: "rgba(96, 165, 250, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  creditPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#bfdbfe",
  },
  termPill: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  termPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  departmentText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 18,
  },
  inviteCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    alignSelf: "flex-start",
    gap: 8,
  },
  inviteLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  inviteCodeBadge: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  inviteCodeValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 1.5,
  },
  inviteActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
});
