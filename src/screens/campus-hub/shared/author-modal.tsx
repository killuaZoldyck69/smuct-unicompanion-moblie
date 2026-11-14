import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  StatusBar,
  BackHandler,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { colors } from "@/theme/colors";
import { getDepartmentFullName } from "@/data/programs";
import { parseOrdinalParts } from "@/utils/academic-ordinal";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "./design-tokens";

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
    administrativeRole?: string | null;
    officeRoom?: string | null;
    officeDayOff?: string | null;
    consultationSlots?:
      | Array<{ day: string; startTime: string; endTime: string }>
      | unknown
      | null;
    expertiseFields?: string[];
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  } | null;
}

interface AuthorDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  author: AuthorProfileModalData | null;
  isOwnProfile?: boolean;
  onReportAuthor?: (author: AuthorProfileModalData) => void;
  renderInline?: boolean;
}

function parseAcademicOrdinal(
  value: string | number | null | undefined,
): { numberPart: string; suffix: string } | null {
  if (value === null || value === undefined) return null;
  const cleaned = String(value)
    .replace(/\b(?:semester|sem|batch)\b\s*[:#-]?\s*/gi, "")
    .trim();
  if (!cleaned) return null;

  const parts = parseOrdinalParts(cleaned);
  if (!parts.numberPart || parts.numberPart === "—") return null;
  return parts;
}

function formatShortAcademicRole(role?: string | null): string | null {
  if (!role) return null;
  const trimmed = role.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (lower === "none") return null;
  if (
    lower === "hod" ||
    lower.includes("(hod)") ||
    lower.includes("head of department") ||
    lower.includes("head of the department")
  ) {
    return "HoD";
  }
  if (lower === "coordinator" || lower.includes("coordinator")) {
    return "Coord.";
  }
  if (lower.includes("assistant dean")) {
    return "Asst. Dean";
  }
  if (lower === "dean") {
    return "Dean";
  }
  return trimmed;
}

function parseTagList(raw: string | string[] | null | undefined): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => item.trim()).filter(Boolean);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function sanitizeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

interface OrdinalMetricProps {
  label: string;
  ordinal: { numberPart: string; suffix: string } | null;
  fallbackText?: string;
}

function OrdinalMetricTile({
  label,
  ordinal,
  fallbackText = "—",
}: OrdinalMetricProps) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      {ordinal ? (
        <View style={styles.metricOrdinalRow}>
          <Text style={styles.metricValue}>{ordinal.numberPart}</Text>
          {ordinal.suffix ? (
            <Text style={styles.metricSuperscript}>{ordinal.suffix}</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.metricOrdinalRow}>
          <Text style={styles.metricValue}>{fallbackText}</Text>
        </View>
      )}
    </View>
  );
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
  const [failedAvatar, setFailedAvatar] = useState(false);

  useEffect(() => {
    setFailedAvatar(false);
  }, [author?.image]);

  useEffect(() => {
    if (!renderInline || !visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [renderInline, visible, onClose]);

  if (!author) return null;

  const sp = author.studentProfile;
  const tp = author.teacherProfile;
  const normalizedRole = (author.role ?? "").toUpperCase();
  const isAdmin =
    normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN";
  const isTeacher = !isAdmin && (normalizedRole === "TEACHER" || Boolean(tp));
  const isStudent =
    !isAdmin && !isTeacher && (normalizedRole === "STUDENT" || Boolean(sp));

  const initial = (author.name ?? "U").charAt(0).toUpperCase();
  const shortAcademicRole = isTeacher
    ? formatShortAcademicRole(tp?.administrativeRole)
    : null;
  const teacherDesignation = isTeacher ? tp?.designation?.trim() || null : null;

  const studentDeptRaw = sp?.department?.trim() || "";
  const studentDepartment = studentDeptRaw
    ? getDepartmentFullName(studentDeptRaw) || studentDeptRaw
    : null;
  const batchOrdinal = parseAcademicOrdinal(sp?.batch);
  const semesterOrdinal = parseAcademicOrdinal(
    sp?.currentSemester ?? sp?.semester,
  );
  const studentSection = sp?.section?.trim()
    ? sp.section.trim().toUpperCase()
    : null;

  const teacherFaculty = tp?.faculty?.trim() || null;
  const teacherOfficeRoom = tp?.officeRoom?.trim() || null;

  const tags = isStudent
    ? parseTagList(sp?.skills)
    : isTeacher
      ? parseTagList(tp?.expertiseFields)
      : [];

  const websiteUrl = !isAdmin
    ? sanitizeExternalUrl(sp?.personalWebsiteUrl || tp?.personalWebsiteUrl)
    : null;
  const linkedInUrl = !isAdmin
    ? sanitizeExternalUrl(sp?.linkedInUrl || tp?.linkedInUrl)
    : null;

  const showSafetyActions =
    !isOwnProfile && Boolean(author.id) && Boolean(onReportAuthor);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open external link" });
    });
  };

  const rolePillLabel = isAdmin
    ? "ADMIN"
    : isTeacher
      ? "TEACHER"
      : normalizedRole || "STUDENT";

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
          hitSlop={6}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close author details"
        >
          <Feather name="x" size={17} color={colors.navyInk} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero: Avatar + Role Badge, Name, Designation & Class/Academic Short Role */}
          <View style={styles.heroSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRing}>
                {author.image && !failedAvatar ? (
                  <Image
                    source={{ uri: author.image }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    onError={() => setFailedAvatar(true)}
                  />
                ) : isTeacher ? (
                  <View style={styles.teacherAvatarFallback}>
                    <FontAwesome5
                      name="graduation-cap"
                      size={28}
                      color={colors.semantic.amber.deep}
                    />
                  </View>
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{initial}</Text>
                  </View>
                )}
              </View>

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
                <Text style={styles.roleBadgeText}>{rolePillLabel}</Text>
              </View>
            </View>

            <Text style={styles.authorName} numberOfLines={2}>
              {author.name}
            </Text>

            {teacherDesignation ? (
              <Text style={styles.designationText}>{teacherDesignation}</Text>
            ) : null}

            {((isStudent && Boolean(sp?.isCR)) || Boolean(shortAcademicRole)) && (
              <View style={styles.badgesRow}>
                {isStudent && sp?.isCR ? (
                  <View style={styles.crBadge}>
                    <Ionicons
                      name="ribbon"
                      size={12}
                      color={colors.semantic.yellow.darkText}
                    />
                    <Text style={styles.crBadgeText}>CR</Text>
                  </View>
                ) : null}

                {shortAcademicRole ? (
                  <View style={styles.academicRoleBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={12}
                      color={colors.semantic.amber.deep}
                    />
                    <Text style={styles.academicRoleBadgeText}>
                      {shortAcademicRole}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* Student Academic Info: Department + 3-Column Batch / Semester / Section */}
          {isStudent && (
            <View style={styles.bentoCard}>
              {studentDepartment ? (
                <>
                  <View style={styles.infoRow}>
                    <View style={[styles.infoIconBox, styles.infoIconBoxBlue]}>
                      <Feather
                        name="book-open"
                        size={15}
                        color={colors.semantic.blue.accent}
                      />
                    </View>
                    <View style={styles.infoTextCol}>
                      <Text style={styles.infoLabel}>DEPARTMENT</Text>
                      <Text style={styles.infoValue}>{studentDepartment}</Text>
                    </View>
                  </View>
                  <View style={styles.cardDivider} />
                </>
              ) : null}

              <View style={styles.metricRow}>
                <OrdinalMetricTile label="BATCH" ordinal={batchOrdinal} />
                <OrdinalMetricTile label="SEMESTER" ordinal={semesterOrdinal} />
                <OrdinalMetricTile
                  label="SECTION"
                  ordinal={null}
                  fallbackText={studentSection || "—"}
                />
              </View>
            </View>
          )}

          {/* Teacher Academic Info: Faculty + Office Room */}
          {isTeacher && (teacherFaculty || teacherOfficeRoom) && (
            <View style={styles.bentoCard}>
              {teacherFaculty ? (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBox, styles.infoIconBoxEmerald]}>
                    <FontAwesome5
                      name="university"
                      size={13}
                      color={colors.semantic.emerald.darker}
                    />
                  </View>
                  <View style={styles.infoTextCol}>
                    <Text style={styles.infoLabel}>FACULTY</Text>
                    <Text style={styles.infoValue}>{teacherFaculty}</Text>
                  </View>
                </View>
              ) : null}

              {teacherFaculty && teacherOfficeRoom ? (
                <View style={styles.cardDivider} />
              ) : null}

              {teacherOfficeRoom ? (
                <View style={styles.infoRow}>
                  <View style={[styles.infoIconBox, styles.infoIconBoxAmber]}>
                    <Feather
                      name="map-pin"
                      size={14}
                      color={colors.semantic.amber.deep}
                    />
                  </View>
                  <View style={styles.infoTextCol}>
                    <Text style={styles.infoLabel}>OFFICE ROOM</Text>
                    <Text style={styles.infoValue}>{teacherOfficeRoom}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          )}

          {/* Student Skills / Teacher Expertise */}
          {tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionHeading}>
                {isTeacher ? "EXPERTISE" : "SKILLS"}
              </Text>
              <View style={styles.tagsWrap}>
                {tags.slice(0, 12).map((tag, index) => (
                  <View
                    key={`${tag}-${index}`}
                    style={[
                      styles.tagChip,
                      isTeacher && styles.tagChipExpertise,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        isTeacher && styles.tagChipTextExpertise,
                      ]}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Two-Column Links Row: Personal Website & LinkedIn */}
          {(websiteUrl || linkedInUrl) && (
            <View style={styles.linksRow}>
              {websiteUrl ? (
                <TouchableOpacity
                  style={[styles.linkBtn, styles.linkBtnWebsite]}
                  onPress={() => handleOpenLink(websiteUrl)}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${author.name}'s personal website`}
                >
                  <View style={styles.linkIconBadge}>
                    <Feather
                      name="globe"
                      size={14}
                      color={colors.semantic.teal.solid}
                    />
                  </View>
                  <Text style={styles.linkBtnTextWebsite} numberOfLines={1}>
                    Website
                  </Text>
                </TouchableOpacity>
              ) : null}

              {linkedInUrl ? (
                <TouchableOpacity
                  style={[styles.linkBtn, styles.linkBtnLinkedIn]}
                  onPress={() => handleOpenLink(linkedInUrl)}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${author.name}'s LinkedIn profile`}
                >
                  <View style={styles.linkIconBadge}>
                    <Feather
                      name="linkedin"
                      size={14}
                      color={colors.semantic.blue.linkedin}
                    />
                  </View>
                  <Text style={styles.linkBtnTextLinkedIn} numberOfLines={1}>
                    LinkedIn
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {showSafetyActions && onReportAuthor ? (
            <View style={styles.safetyRow}>
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
                <Text style={styles.safetyBtnText}>Report User</Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
    backgroundColor: CAMPUS_HUB_COLORS.memeSheetScrim,
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
    paddingTop: 10,
    maxHeight: "88%",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate200,
    alignSelf: "center",
    marginBottom: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slate100,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 2,
  },
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 3,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.slate200,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    backgroundColor: colors.navyInk,
    alignItems: "center",
    justifyContent: "center",
  },
  teacherAvatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    backgroundColor: colors.semantic.amber.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontFamily: titleFontFamily,
    fontSize: 30,
    fontWeight: "800",
    color: colors.white,
  },
  roleBadge: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.white,
  },
  roleBadgeStudent: {
    backgroundColor: colors.semantic.blue.accent,
  },
  roleBadgeTeacher: {
    backgroundColor: colors.semantic.emerald.darker,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.semantic.violet.accent,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  authorName: {
    fontFamily: titleFontFamily,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    color: colors.navyInk,
    textAlign: "center",
    letterSpacing: -0.3,
    marginTop: 10,
    paddingHorizontal: 24,
  },
  designationText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: colors.slate500,
    marginTop: 3,
    textAlign: "center",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  crBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.semantic.yellow.soft,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  crBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: colors.semantic.yellow.darkText,
    letterSpacing: 0.4,
  },
  academicRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.semantic.amber.soft,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  academicRoleBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: colors.semantic.amber.deep,
    letterSpacing: 0.4,
  },
  bentoCard: {
    width: "100%",
    backgroundColor: colors.slate50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.slate200,
    padding: 14,
    marginTop: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoIconBoxBlue: {
    backgroundColor: colors.semantic.blue.soft,
  },
  infoIconBoxEmerald: {
    backgroundColor: colors.semantic.emerald.soft,
  },
  infoIconBoxAmber: {
    backgroundColor: colors.semantic.amber.soft,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: colors.slate400,
    letterSpacing: 0.6,
  },
  infoValue: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: "700",
    color: colors.navyInk,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.slate200,
    marginVertical: 12,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricTile: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: colors.slate400,
    letterSpacing: 0.6,
  },
  metricOrdinalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 4,
  },
  metricValue: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.navyInk,
  },
  metricSuperscript: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.blue.accent,
    marginLeft: 1,
    marginTop: 1,
  },
  tagsSection: {
    width: "100%",
    marginTop: 16,
  },
  sectionHeading: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: colors.slate400,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  tagChip: {
    backgroundColor: colors.slate100,
    borderWidth: 1,
    borderColor: colors.slate200,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagChipExpertise: {
    backgroundColor: colors.semantic.indigo.tint,
    borderColor: colors.semantic.indigo.border,
  },
  tagChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.navyInk,
  },
  tagChipTextExpertise: {
    color: colors.semantic.indigo.deep,
  },
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  linkBtn: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  linkBtnWebsite: {
    backgroundColor: colors.semantic.teal.tint,
    borderColor: colors.semantic.emerald.mintBorder,
  },
  linkBtnLinkedIn: {
    backgroundColor: colors.semantic.blue.tint,
    borderColor: colors.semantic.blue.border,
  },
  linkIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  linkBtnTextWebsite: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: colors.semantic.teal.darkText,
  },
  linkBtnTextLinkedIn: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: colors.semantic.blue.linkedin,
  },
  safetyRow: {
    flexDirection: "row",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
  },
  safetyBtn: {
    flex: 1,
    minHeight: 46,
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
