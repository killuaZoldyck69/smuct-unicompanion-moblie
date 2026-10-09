import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../constants";
import {
  formatTime,
  formatPurposeWithEmoji,
  formatFullHeaderDate,
  getBookingDateKey,
} from "../utils";

interface ReserverProfileModalProps {
  visible: boolean;
  booking: FieldBookingItem | null;
  onClose: () => void;
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

export const ReserverProfileModal = memo(function ReserverProfileModal({
  visible,
  booking,
  onClose,
}: ReserverProfileModalProps) {
  const insets = useSafeAreaInsets();

  if (!booking) return null;

  const user = booking.user;
  const userName = user?.name || "University Member";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";
  const email = user?.email;
  const phone = user?.phoneNumber;

  const sp = user?.studentProfile;
  const tp = user?.teacherProfile;

  const isTeacher = Boolean(tp || user?.role === "TEACHER");
  const isAdmin = user?.role === "ADMIN";
  const isStudent = Boolean(sp || user?.role === "STUDENT" || (!isTeacher && !isAdmin));

  const roleLabel = isAdmin
    ? "Admin"
    : isTeacher
      ? "Faculty Member"
      : "Student";

  const department =
    sp?.department ||
    tp?.department ||
    tp?.faculty ||
    null;

  const studentId = sp?.studentId || null;
  const teacherId = tp?.teacherId || null;
  const designation = tp?.designation || null;
  const batch = sp?.batch || null;
  const semesterStr = formatSemester(sp?.currentSemester);
  const section = sp?.section || null;
  const program = sp?.program || null;
  const officeRoom = tp?.officeRoom || null;

  const handleCall = () => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\s+/g, "");
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Toast.show({
        type: "error",
        text1: "Unable to open phone dialer",
      });
    });
  };

  const handleEmail = () => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {
      Toast.show({
        type: "error",
        text1: "Unable to open email client",
      });
    });
  };

  const purposeFormatted = formatPurposeWithEmoji(booking.purpose);
  const timeFormatted = `${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`;
  const dateKey = getBookingDateKey(booking);
  const rawDate = dateKey || booking.bookingDate || booking.startTime || "";
  const dateFormatted = formatFullHeaderDate(rawDate) || "Scheduled Date";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top + 14, 24),
            paddingBottom: Math.max(insets.bottom + 14, 24),
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.modalCard}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close profile details"
          >
            <Feather name="x" size={18} color={BENTO.navy} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Reserver Header */}
            <View style={styles.headerSection}>
              {user?.image ? (
                <Image
                  source={{ uri: user.image }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{userInitial}</Text>
                </View>
              )}

              <Text style={styles.userNameText} numberOfLines={2}>
                {userName}
              </Text>

              {/* Role Badge */}
              <View
                style={[
                  styles.roleBadge,
                  isAdmin
                    ? styles.roleBadgeAdmin
                    : isTeacher
                      ? styles.roleBadgeTeacher
                      : styles.roleBadgeStudent,
                ]}
              >
                <Feather
                  name={isAdmin ? "shield" : isTeacher ? "award" : "book-open"}
                  size={12}
                  color={
                    isAdmin
                      ? "#7c3aed"
                      : isTeacher
                        ? BENTO.emerald
                        : BENTO.indigo
                  }
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.roleBadgeText,
                    isAdmin
                      ? styles.roleTextAdmin
                      : isTeacher
                        ? styles.roleTextTeacher
                        : styles.roleTextStudent,
                  ]}
                >
                  {roleLabel}
                </Text>
              </View>
            </View>

            {/* Academic & Identity Box */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>Academic Details</Text>

              {department && (
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Feather name="layers" size={14} color={BENTO.navy} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Department</Text>
                    <Text style={styles.infoValue}>{department}</Text>
                  </View>
                </View>
              )}

              {program && (
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Feather name="bookmark" size={14} color={BENTO.navy} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Program</Text>
                    <Text style={styles.infoValue}>{program}</Text>
                  </View>
                </View>
              )}

              {studentId && (
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Feather name="hash" size={14} color={BENTO.navy} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Student ID</Text>
                    <Text style={styles.infoValue}>{studentId}</Text>
                  </View>
                </View>
              )}

              {teacherId && (
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Feather name="hash" size={14} color={BENTO.navy} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Faculty ID</Text>
                    <Text style={styles.infoValue}>{teacherId}</Text>
                  </View>
                </View>
              )}

              {designation && (
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Feather name="briefcase" size={14} color={BENTO.navy} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Designation</Text>
                    <Text style={styles.infoValue}>{designation}</Text>
                  </View>
                </View>
              )}

              {officeRoom && (
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Feather name="map-pin" size={14} color={BENTO.navy} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Office Room</Text>
                    <Text style={styles.infoValue}>{officeRoom}</Text>
                  </View>
                </View>
              )}

              {(batch || semesterStr || section) && (
                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Feather name="users" size={14} color={BENTO.navy} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Cohort</Text>
                    <Text style={styles.infoValue}>
                      {[
                        batch ? `Batch ${batch}` : null,
                        semesterStr,
                        section ? `Sec ${section}` : null,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Reservation Summary Box */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>Reservation Details</Text>

              <View style={styles.infoRow}>
                <View style={[styles.iconBox, { backgroundColor: BENTO.emeraldBg }]}>
                  <Feather name="calendar" size={14} color={BENTO.emerald} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{dateFormatted}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={[styles.iconBox, { backgroundColor: BENTO.indigoBg }]}>
                  <Feather name="clock" size={14} color={BENTO.indigo} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Time Slot</Text>
                  <Text style={styles.infoValue}>{timeFormatted}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <View style={styles.iconBox}>
                  <Feather name="activity" size={14} color={BENTO.navy} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Purpose</Text>
                  <Text style={[styles.infoValue, { fontWeight: "700" }]}>
                    {purposeFormatted}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions (Call / Email) */}
            <View style={styles.actionRow}>
              {email ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnOutline]}
                  onPress={handleEmail}
                  activeOpacity={0.8}
                >
                  <Feather name="mail" size={15} color={BENTO.navy} />
                  <Text style={styles.actionBtnOutlineText}>Send Email</Text>
                </TouchableOpacity>
              ) : null}

              {phone ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={handleCall}
                  activeOpacity={0.8}
                >
                  <Feather name="phone-call" size={15} color="#ffffff" />
                  <Text style={styles.actionBtnPrimaryText}>Call Reserver</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 390,
    maxHeight: "92%",
    backgroundColor: BENTO.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BENTO.border,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      web: {
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.2)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    borderWidth: 2.5,
    borderColor: BENTO.emerald,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BENTO.navy,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 2.5,
    borderColor: BENTO.border,
  },
  avatarFallbackText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  userNameText: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleBadgeStudent: {
    backgroundColor: BENTO.indigoBg,
    borderColor: BENTO.indigoBorder,
  },
  roleBadgeTeacher: {
    backgroundColor: BENTO.emeraldBg,
    borderColor: BENTO.emeraldBorder,
  },
  roleBadgeAdmin: {
    backgroundColor: "rgba(124, 58, 237, 0.08)",
    borderColor: "rgba(124, 58, 237, 0.2)",
  },
  roleBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  roleTextStudent: {
    color: BENTO.indigo,
  },
  roleTextTeacher: {
    color: BENTO.emerald,
  },
  roleTextAdmin: {
    color: "#7c3aed",
  },
  sectionCard: {
    backgroundColor: BENTO.canvas,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 11.5,
    fontWeight: "800",
    color: BENTO.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.04)",
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10.5,
    color: BENTO.slate,
    fontWeight: "600",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO.navy,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    gap: 7,
  },
  actionBtnOutline: {
    backgroundColor: BENTO.canvas,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  actionBtnOutlineText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: BENTO.navy,
  },
  actionBtnPrimary: {
    backgroundColor: BENTO.emerald,
  },
  actionBtnPrimaryText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
