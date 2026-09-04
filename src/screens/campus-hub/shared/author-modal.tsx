import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { CAMPUS_HUB_COLORS, fontFamily } from "./design-tokens";

const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export interface AuthorProfileModalData {
  id?: string;
  name: string;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  studentProfile?: {
    studentId?: string | null;
    department?: string | null;
    batch?: string | null;
    semester?: string | number | null;
    currentSemester?: string | number | null;
    section?: string | null;
  } | null;
  teacherProfile?: {
    department?: string | null;
    designation?: string | null;
    officeRoom?: string | null;
    consultationHours?: string | null;
  } | null;
}

const formatSemester = (
  sem: number | string | null | undefined
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

interface AuthorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  author: AuthorProfileModalData | null;
}

export const AuthorDetailsModal = React.memo(function AuthorDetailsModal({
  visible,
  onClose,
  author,
}: AuthorDetailsModalProps) {
  if (!author) return null;

  const initial = (author.name ?? "U").charAt(0).toUpperCase();

  const handleCall = () => {
    if (!author.phoneNumber) return;
    const phone = author.phoneNumber.replace(/\s+/g, "");
    Linking.openURL(`tel:${phone}`).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open phone dialer" });
    });
  };

  const handleEmail = () => {
    if (!author.email) return;
    Linking.openURL(`mailto:${author.email}`).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open email client" });
    });
  };

  const department =
    author.studentProfile?.department ||
    author.teacherProfile?.department ||
    null;

  const designation =
    author.teacherProfile?.designation ||
    (author.role === "ADMIN" ? "System Administrator" : null);

  const studentId = author.studentProfile?.studentId || null;
  const batch = author.studentProfile?.batch || null;
  const semester = formatSemester(
    author.studentProfile?.currentSemester ?? author.studentProfile?.semester
  );
  const section = author.studentProfile?.section || null;
  const officeRoom = author.teacherProfile?.officeRoom || null;
  const consultationHours = author.teacherProfile?.consultationHours || null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close author details"
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            {author.image ? (
              <Image source={{ uri: author.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{initial}</Text>
              </View>
            )}

            {author.role && (
              <View
                style={[
                  styles.roleBadge,
                  author.role === "TEACHER"
                    ? styles.roleTeacher
                    : author.role === "ADMIN"
                    ? styles.roleAdmin
                    : styles.roleStudent,
                ]}
              >
                <Text style={styles.roleBadgeText}>{author.role}</Text>
              </View>
            )}
          </View>

          <Text style={styles.authorName} numberOfLines={2}>
            {author.name}
          </Text>

          {designation && (
            <Text style={styles.designationText}>{designation}</Text>
          )}

          {department && (
            <View style={styles.infoPill}>
              <Feather
                name="book-open"
                size={12}
                color={CAMPUS_HUB_COLORS.subtleText}
              />
              <Text style={styles.infoPillText}>{department}</Text>
            </View>
          )}

          <View style={styles.detailsList}>
            {studentId && (
              <View style={styles.detailRow}>
                <Feather
                  name="hash"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.detailLabel}>Student ID:</Text>
                <Text style={styles.detailValue}>{studentId}</Text>
              </View>
            )}

            {batch && (
              <View style={styles.detailRow}>
                <Feather
                  name="layers"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.detailLabel}>Batch:</Text>
                <Text style={styles.detailValue}>{batch}</Text>
              </View>
            )}

            {semester && (
              <View style={styles.detailRow}>
                <Feather
                  name="calendar"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.detailLabel}>Semester:</Text>
                <Text style={styles.detailValue}>{semester}</Text>
              </View>
            )}

            {section && (
              <View style={styles.detailRow}>
                <Feather
                  name="grid"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.detailLabel}>Section:</Text>
                <Text style={styles.detailValue}>{section}</Text>
              </View>
            )}

            {officeRoom && (
              <View style={styles.detailRow}>
                <Feather
                  name="map-pin"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.detailLabel}>Office Room:</Text>
                <Text style={styles.detailValue}>{officeRoom}</Text>
              </View>
            )}

            {consultationHours && (
              <View style={styles.detailRow}>
                <Feather
                  name="clock"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.detailLabel}>Consultation:</Text>
                <Text style={styles.detailValue}>{consultationHours}</Text>
              </View>
            )}

            {author.bloodGroup && (
              <View style={styles.detailRow}>
                <Feather name="heart" size={14} color="#ef4444" />
                <Text style={styles.detailLabel}>Blood Group:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: "#ef4444", fontWeight: "700" },
                  ]}
                >
                  {BLOOD_GROUP_LABELS[author.bloodGroup] || author.bloodGroup}
                </Text>
              </View>
            )}

            {author.email && (
              <View style={styles.detailRow}>
                <Feather
                  name="mail"
                  size={14}
                  color={CAMPUS_HUB_COLORS.subtleText}
                />
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {author.email}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            {author.phoneNumber ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.callBtn]}
                onPress={handleCall}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Call author"
              >
                <Feather name="phone" size={16} color="#ffffff" />
                <Text style={styles.actionBtnText}>Call</Text>
              </TouchableOpacity>
            ) : null}

            {author.email ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.emailBtn]}
                onPress={handleEmail}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Email author"
              >
                <Feather
                  name="mail"
                  size={16}
                  color={CAMPUS_HUB_COLORS.deepNavy}
                />
                <Text style={[styles.actionBtnText, { color: CAMPUS_HUB_COLORS.deepNavy }]}>
                  Send Email
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.shadow,
    elevation: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#cbd5e1",
  },
  avatarFallbackText: {
    fontFamily,
    fontSize: 32,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  roleBadge: {
    position: "absolute",
    bottom: -4,
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  roleStudent: {
    backgroundColor: "#2563eb",
  },
  roleTeacher: {
    backgroundColor: "#059669",
  },
  roleAdmin: {
    backgroundColor: "#7c3aed",
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  authorName: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
    marginTop: 6,
  },
  designationText: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoPillText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontWeight: "600",
  },
  detailsList: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    minWidth: 88,
  },
  detailValue: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  callBtn: {
    backgroundColor: "#059669",
  },
  emailBtn: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
