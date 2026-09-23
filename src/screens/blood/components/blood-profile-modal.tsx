import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatBloodGroupSymbol } from "../utils";
import type { BloodAuthor } from "@/features/blood/types";

interface BloodProfileModalProps {
  profile: BloodAuthor | null;
  onClose: () => void;
  onCall: (phone?: string) => void;
  onCopyPhone: (phone?: string) => void;
}

const formatSemester = (
  sem: number | string | null | undefined,
): string | null => {
  if (sem === null || sem === undefined || sem === "") return null;
  const num = typeof sem === "string" ? parseInt(sem, 10) : sem;
  if (!isNaN(num) && num > 0) {
    const s = ["th", "st", "nd", "rd"];
    const v = num % 100;
    const suffix = s[(v - 20) % 10] || s[v] || s[0];
    return `${num}${suffix} Semester`;
  }
  return String(sem);
};

export const BloodProfileModal = memo(function BloodProfileModal({
  profile,
  onClose,
  onCall,
  onCopyPhone,
}: BloodProfileModalProps) {
  if (!profile) return null;

  const profileInitial = (profile.name || "U").trim().charAt(0).toUpperCase();
  const profileBloodSymbol = formatBloodGroupSymbol(profile.bloodGroup || undefined);
  const profileDept =
    profile.studentProfile?.department ||
    profile.teacherProfile?.department ||
    null;
  const profileStudentId = profile.studentProfile?.studentId || null;
  const profileBatch = profile.studentProfile?.batch || null;
  const profileSemester = formatSemester(profile.studentProfile?.currentSemester);
  const profileDesignation =
    profile.teacherProfile?.designation ||
    (profile.role === "ADMIN" ? "System Administrator" : null);
  const profileRoom = profile.teacherProfile?.officeRoom || null;
  const profileRole =
    profile.role === "TEACHER"
      ? "Teacher"
      : profile.role === "ADMIN"
      ? "Admin"
      : profile.studentProfile
      ? "Student"
      : profile.role || null;

  return (
    <Modal
      visible={!!profile}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close profile details"
          >
            <Feather name="x" size={17} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>

          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{profileInitial}</Text>
            </View>
          )}

          <Text style={styles.name} numberOfLines={2}>
            {profile.name}
          </Text>

          <View style={styles.badgesRow}>
            {profileBloodSymbol && profileBloodSymbol !== "N/A" ? (
              <View style={styles.bloodBadge}>
                <Feather
                  name="droplet"
                  size={11}
                  color={BENTO_COLORS.crimson}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.bloodText}>{profileBloodSymbol}</Text>
              </View>
            ) : null}

            {profileRole ? (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{profileRole}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.detailsBox}>
            {profileDept ? (
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <Feather
                    name="book-open"
                    size={13}
                    color={BENTO_COLORS.subtleText}
                  />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {profileDept}
                  </Text>
                </View>
              </View>
            ) : null}

            {profileStudentId ? (
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <Feather
                    name="hash"
                    size={13}
                    color={BENTO_COLORS.subtleText}
                  />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Student ID</Text>
                  <Text style={styles.detailValue}>{profileStudentId}</Text>
                </View>
              </View>
            ) : null}

            {profileBatch || profileSemester ? (
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <Feather
                    name="layers"
                    size={13}
                    color={BENTO_COLORS.subtleText}
                  />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Academic Level</Text>
                  <Text style={styles.detailValue}>
                    {[profileBatch ? `${profileBatch} Batch` : null, profileSemester]
                      .filter(Boolean)
                      .join(" • ")}
                  </Text>
                </View>
              </View>
            ) : null}

            {profileDesignation ? (
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <Feather
                    name="briefcase"
                    size={13}
                    color={BENTO_COLORS.subtleText}
                  />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Designation</Text>
                  <Text style={styles.detailValue}>
                    {[
                      profileDesignation,
                      profileRoom ? `Room ${profileRoom}` : null,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </Text>
                </View>
              </View>
            ) : null}

            {profile.phoneNumber ? (
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.iconBox}>
                  <Feather name="phone" size={13} color="#059669" />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailLabel}>Phone Number</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: BENTO_COLORS.deepNavy },
                    ]}
                  >
                    {profile.phoneNumber}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {profile.phoneNumber && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => onCall(profile.phoneNumber || undefined)}
                activeOpacity={0.85}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Call user"
              >
                <Feather
                  name="phone-call"
                  size={14}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.callBtnText}>Direct Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => onCopyPhone(profile.phoneNumber || undefined)}
                activeOpacity={0.85}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Copy phone number"
              >
                <Feather
                  name="copy"
                  size={14}
                  color={BENTO_COLORS.deepNavy}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.copyBtnText}>Copy Phone</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  avatarText: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  name: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.15)",
  },
  bloodText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
  },
  roleBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  roleText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textTransform: "capitalize",
  },
  detailsBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.04)",
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    height: 42,
    borderRadius: 12,
  },
  callBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  copyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  copyBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
