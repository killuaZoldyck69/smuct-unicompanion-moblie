import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Platform,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface HubHeaderProps {
  hubDetails: any;
  canManage?: boolean;
  canEditClassLink?: boolean;
  onOptionsPress: () => void;
  onLiveClassPress?: () => void;
  onEditClassLink?: () => void;
  onBack?: () => void;
}

const getOrdinal = (num?: number | string) => {
  if (!num) return "";
  const n = parseInt(String(num), 10);
  if (isNaN(n)) return String(num);
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function HubHeader({
  hubDetails,
  canManage,
  canEditClassLink,
  onOptionsPress,
  onLiveClassPress,
  onEditClassLink,
  onBack,
}: HubHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
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
          message: `Join our class "${hubDetails.courseName}" on UniCompanion using the invite code: ${hubDetails.joinCode}`,
        });
      } catch {
        Toast.show({ type: "error", text1: "Error sharing invite code" });
      }
    }
  };

  const handleShareMeet = async () => {
    if (hubDetails?.meetUrl) {
      try {
        await Share.share({
          message: `Join the online class for "${hubDetails.courseName}": ${hubDetails.meetUrl}`,
        });
      } catch {
        Toast.show({ type: "error", text1: "Error sharing class link" });
      }
    } else if (canManage && onLiveClassPress) {
      onLiveClassPress();
    }
  };

  const teacherMember = hubDetails?.members?.find(
    (m: any) => m.role === "TEACHER"
  );
  const crMember = hubDetails?.members?.find((m: any) => m.role === "CR");
  const teacherName =
    teacherMember?.user?.name || hubDetails?.teacher?.name || "Instructor";
  const teacherImage = teacherMember?.user?.image;

  const rawSection =
    hubDetails?.section ||
    crMember?.user?.studentProfile?.section ||
    hubDetails?.members?.find((m: any) => m.user?.studentProfile?.section)?.user?.studentProfile?.section ||
    "";
  const cleanSection = rawSection
    ? String(rawSection).replace(/^sec(tion)?\s*/i, "").trim()
    : "";

  const semesterDisplay = hubDetails?.semesterNumber
    ? `${getOrdinal(hubDetails.semesterNumber)} Semester`
    : hubDetails?.termOffer || "1st Semester";

  const handleJoinMeet = () => {
    if (hubDetails?.meetUrl) {
      Linking.openURL(hubDetails.meetUrl);
    } else if (onLiveClassPress) {
      onLiveClassPress();
    } else {
      Toast.show({
        type: "info",
        text1: "No Class Link",
        text2: "Your instructor has not configured an online class link yet.",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Navigation Row: Back, Centered Course Title, Settings Button */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={handleBack}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={18} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.courseTitle} numberOfLines={1}>
          {hubDetails?.courseName || "Course Name"}
        </Text>

        <TouchableOpacity
          style={styles.iconCircleBtn}
          onPress={onOptionsPress}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Course options and settings"
        >
          <Feather name="settings" size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* 2. Metadata Pills: [Code] [Credits] [Semester] */}
      <View style={styles.pillsRow}>
        {hubDetails?.courseCode ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{hubDetails.courseCode}</Text>
          </View>
        ) : null}

        {hubDetails?.credit !== undefined && hubDetails?.credit !== null ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{hubDetails.credit} Credits</Text>
          </View>
        ) : null}

        <View style={styles.pill}>
          <Text style={styles.pillText}>{semesterDisplay}</Text>
        </View>
      </View>

      {/* 3. Department & Batch / Section */}
      <Text style={styles.subtitleText} numberOfLines={1}>
        {hubDetails?.department || "General Department"}
        {hubDetails?.batch
          ? ` • Batch ${hubDetails.batch}${
              cleanSection ? ` (Sec ${cleanSection})` : ""
            }`
          : cleanSection
          ? ` • Sec ${cleanSection}`
          : ""}
      </Text>

      {/* 4. Teacher Information */}
      <View style={styles.instructorsRow}>
        <View style={styles.instructorCol}>
          {teacherImage ? (
            <Image source={{ uri: teacherImage }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>
                {teacherName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.instructorTextWrapper}>
            <Text style={styles.instructorName} numberOfLines={1}>
              {teacherName}
            </Text>
            <Text style={styles.instructorRole}>Teacher</Text>
          </View>
        </View>
      </View>

      {/* 5. Bento Bottom Row: Spacious Invite Code Card + Online Class Card */}
      <View style={styles.bentoRow}>
        {/* Left Bento Card: Invite Code + Copy + Share */}
        <View style={styles.bentoCard}>
          <Text style={styles.codeLabel}>INVITE CODE</Text>
          <View style={styles.cardBodyRow}>
            <Text style={styles.codeValue} numberOfLines={1}>
              {hubDetails?.joinCode || "------"}
            </Text>

            <View style={styles.actionBtnGroup}>
              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={handleCopyCode}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Copy invite code"
              >
                <Feather name="copy" size={13} color="#0f172a" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCircleBtn}
                onPress={handleShareCode}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Share invite code"
              >
                <Feather name="share-2" size={13} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Right Bento Card: Online Class + Edit + Share + Action Button */}
        <View style={styles.bentoCard}>
          <View style={styles.meetHeaderRow}>
            <View style={styles.meetTitleGroup}>
              <Feather
                name="video"
                size={13}
                color={hubDetails?.isClassLive ? "#16a34a" : "#0f172a"}
              />
              <Text style={styles.meetTitle} numberOfLines={1}>
                {hubDetails?.isClassLive ? "Class is Live" : "Online Class"}
              </Text>
            </View>

            <View style={styles.actionBtnGroup}>
              {canEditClassLink && (
                <TouchableOpacity
                  style={styles.meetShareBtn}
                  onPress={onEditClassLink || onLiveClassPress}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Edit class link"
                >
                  <Feather name="edit-2" size={11} color="#0f172a" />
                </TouchableOpacity>
              )}

              {hubDetails?.meetUrl ? (
                <TouchableOpacity
                  style={styles.meetShareBtn}
                  onPress={handleShareMeet}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Share online class link"
                >
                  <Feather name="share-2" size={11} color="#0f172a" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.joinMeetingBtn,
              hubDetails?.isClassLive && { backgroundColor: "#16a34a" },
              !hubDetails?.meetUrl && !canEditClassLink && { backgroundColor: "#94a3b8" },
            ]}
            onPress={hubDetails?.meetUrl ? handleJoinMeet : (onEditClassLink || onLiveClassPress)}
            activeOpacity={0.85}
            disabled={!hubDetails?.meetUrl && !canEditClassLink}
          >
            <Text style={styles.joinMeetingBtnText}>
              {hubDetails?.isClassLive
                ? "Join Live"
                : hubDetails?.meetUrl
                ? "Join Class"
                : canEditClassLink
                ? "Set Link"
                : "No Link"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#d6f5e3", // Soft pastel mint background
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  courseTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily,
    fontSize: 21,
    fontWeight: "800",
    color: "#0f172a",
    marginHorizontal: 8,
    letterSpacing: -0.4,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  pill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  pillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitleText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
    textAlign: "center",
    marginBottom: 8,
  },
  instructorsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  instructorCol: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    marginRight: 8,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarLetter: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  instructorTextWrapper: {
    justifyContent: "center",
  },
  instructorName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  instructorRole: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#475569",
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 68,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  codeLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  cardBodyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  codeValue: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.6,
  },
  actionBtnGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  meetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  meetTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  meetTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  meetShareBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  joinMeetingBtn: {
    backgroundColor: "#131b2e",
    borderRadius: 9999,
    height: 28,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  joinMeetingBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
});
