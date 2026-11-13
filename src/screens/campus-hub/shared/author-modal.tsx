import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { CAMPUS_HUB_COLORS, fontFamily } from "./design-tokens";
import { formatConsultationSlots } from "@/utils/consultation-formatter";

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
    faculty?: string | null;
    department?: string | null;
    program?: string | null;
    batch?: string | null;
    semester?: string | number | null;
    currentSemester?: string | number | null;
    section?: string | null;
    isCR?: boolean;
    skills?: string[];
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  } | null;
  teacherProfile?: {
    teacherId?: string | null;
    faculty?: string | null;
    department?: string | null;
    designation?: string | null;
    officeRoom?: string | null;
    officeDayOff?: string | null;
    consultationSlots?:
      | Array<{ day: string; startTime: string; endTime: string }>
      | any
      | null;
    expertiseFields?: string[];
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  } | null;
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

function sanitizeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

interface AuthorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  author: AuthorProfileModalData | null;
  isOwnProfile?: boolean;
  onReportAuthor?: (author: AuthorProfileModalData) => void;
  renderInline?: boolean;
}

export const AuthorDetailsModal = React.memo(function AuthorDetailsModal({
  visible,
  onClose,
  author,
  isOwnProfile = false,
  onReportAuthor,
  renderInline = false,
}: AuthorDetailsModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 20) + 12;

  useEffect(() => {
    if (!renderInline || !visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [renderInline, visible, onClose]);

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

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open external link" });
    });
  };

  const sp = author.studentProfile;
  const tp = author.teacherProfile;

  const department = sp?.department || tp?.department || null;
  const faculty = sp?.faculty || tp?.faculty || null;
  const designation =
    tp?.designation ||
    (author.role === "ADMIN" ? "System Administrator" : null);

  const studentId = sp?.studentId || null;
  const program = sp?.program || null;
  const batch = sp?.batch || null;
  const semester = formatSemester(sp?.currentSemester ?? sp?.semester);
  const section = sp?.section || null;

  const teacherId = tp?.teacherId || null;
  const officeRoom = tp?.officeRoom || null;
  const officeDayOff = tp?.officeDayOff || null;
  const consultationSchedule = formatConsultationSlots(
    tp?.consultationSlots,
    "",
  );

  const tags =
    sp?.skills && sp.skills.length > 0
      ? sp.skills
      : tp?.expertiseFields && tp.expertiseFields.length > 0
        ? tp.expertiseFields
        : [];

  const linkedInUrl = sanitizeExternalUrl(sp?.linkedInUrl || tp?.linkedInUrl);
  const websiteUrl = sanitizeExternalUrl(
    sp?.personalWebsiteUrl || tp?.personalWebsiteUrl,
  );

  const detailRows: Array<{
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    value: string;
    accentColor?: string;
  }> = [];

  if (studentId) {
    detailRows.push({ icon: "hash", label: "Student ID", value: studentId });
  }
  if (teacherId) {
    detailRows.push({ icon: "hash", label: "Teacher ID", value: teacherId });
  }
  if (faculty) {
    detailRows.push({ icon: "home", label: "Faculty", value: faculty });
  }
  if (program) {
    detailRows.push({ icon: "award", label: "Program", value: program });
  }
  if (batch) {
    detailRows.push({ icon: "layers", label: "Batch", value: batch });
  }
  if (semester) {
    detailRows.push({ icon: "calendar", label: "Semester", value: semester });
  }
  if (section) {
    detailRows.push({ icon: "grid", label: "Section", value: section });
  }
  if (officeRoom) {
    detailRows.push({ icon: "map-pin", label: "Office Room", value: officeRoom });
  }
  if (officeDayOff) {
    detailRows.push({ icon: "coffee", label: "Day Off", value: officeDayOff });
  }
  if (consultationSchedule) {
    detailRows.push({
      icon: "clock",
      label: "Consultation",
      value: consultationSchedule,
    });
  }
  if (author.bloodGroup) {
    detailRows.push({
      icon: "heart",
      label: "Blood Group",
      value: BLOOD_GROUP_LABELS[author.bloodGroup] || author.bloodGroup,
      accentColor: "#ef4444",
    });
  }
  if (author.email) {
    detailRows.push({ icon: "mail", label: "Email", value: author.email });
  }

  const showSafetyActions =
    !isOwnProfile && Boolean(author.id) && Boolean(onReportAuthor);

  const modalOverlay = (
    <View style={[styles.overlay, renderInline && styles.inlineOverlay]}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        accessible={false}
      />

      <View style={[styles.sheet, { paddingBottom: bottomPadding }]}>
        <View style={styles.dragHandle} />

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close author details"
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroSection}>
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

              {designation ? (
                <Text style={styles.designationText}>{designation}</Text>
              ) : null}

              <View style={styles.badgesWrap}>
                {department ? (
                  <View style={styles.infoPill}>
                    <Feather
                      name="book-open"
                      size={12}
                      color={CAMPUS_HUB_COLORS.subtleText}
                    />
                    <Text style={styles.infoPillText}>{department}</Text>
                  </View>
                ) : null}

                {sp?.isCR ? (
                  <View style={styles.crPill}>
                    <Feather
                      name="star"
                      size={11}
                      color={CAMPUS_HUB_COLORS.forumAccent}
                    />
                    <Text style={styles.crPillText}>Class Representative</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {detailRows.length > 0 && (
              <View style={styles.detailsList}>
                {detailRows.map((row) => (
                  <View key={row.label} style={styles.detailRow}>
                    <Feather
                      name={row.icon}
                      size={14}
                      color={row.accentColor || CAMPUS_HUB_COLORS.subtleText}
                    />
                    <Text style={styles.detailLabel}>{row.label}:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        row.accentColor
                          ? { color: row.accentColor, fontWeight: "700" }
                          : undefined,
                      ]}
                      numberOfLines={2}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsTitle}>
                  {tp?.expertiseFields?.length ? "Expertise" : "Skills"}
                </Text>
                <View style={styles.tagsWrap}>
                  {tags.slice(0, 8).map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(linkedInUrl || websiteUrl) && (
              <View style={styles.linksRow}>
                {linkedInUrl && (
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => handleOpenLink(linkedInUrl)}
                    activeOpacity={0.75}
                  >
                    <Feather
                      name="linkedin"
                      size={14}
                      color={CAMPUS_HUB_COLORS.forumAccent}
                    />
                    <Text style={styles.linkBtnText}>LinkedIn</Text>
                  </TouchableOpacity>
                )}
                {websiteUrl && (
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={() => handleOpenLink(websiteUrl)}
                    activeOpacity={0.75}
                  >
                    <Feather
                      name="globe"
                      size={14}
                      color={CAMPUS_HUB_COLORS.forumAccent}
                    />
                    <Text style={styles.linkBtnText}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {(author.phoneNumber || author.email) && (
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
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: CAMPUS_HUB_COLORS.deepNavy },
                      ]}
                    >
                      Send Email
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {showSafetyActions && (
              <View style={styles.safetyRow}>
                {onReportAuthor && (
                  <TouchableOpacity
                    style={styles.safetyBtn}
                    onPress={() => onReportAuthor(author)}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Report content by this user"
                  >
                    <Feather
                      name="flag"
                      size={14}
                      color={CAMPUS_HUB_COLORS.dangerText}
                    />
                    <Text style={styles.safetyBtnText}>Report</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
  );

  if (renderInline) {
    return visible ? modalOverlay : null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      {modalOverlay}
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  inlineOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 200,
    elevation: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "88%",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 10,
  },
  closeBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 6,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 6,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 82,
    height: 82,
    borderRadius: 41,
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
    fontSize: 19,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
    marginTop: 4,
  },
  designationText: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
    textAlign: "center",
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoPillText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.deepNavy,
    fontWeight: "600",
  },
  crPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: CAMPUS_HUB_COLORS.forumAccentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  crPillText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.forumAccent,
  },
  detailsList: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    fontSize: 12.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
    flex: 1,
  },
  tagsSection: {
    width: "100%",
    marginTop: 14,
  },
  tagsTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagChip: {
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagChipText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  linkBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  linkBtnText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.forumAccent,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
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
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  safetyRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  safetyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
  },
  safetyBtnText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
});
