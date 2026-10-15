import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Linking,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { TeacherDirectoryItem } from "@/services/directory-service";
import { DIRECTORY_COLORS, fontFamily } from "../constants";

interface TeacherDetailModalProps {
  teacher: TeacherDirectoryItem | null;
  visible: boolean;
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = React.memo(
  ({ teacher, visible, onClose }) => {
    if (!teacher) return null;

    const profile = teacher.teacherProfile;
    const initial = teacher.name?.charAt(0)?.toUpperCase() || "T";

    const handleCopy = async (text: string, label: string) => {
      if (!text) return;
      try {
        await Clipboard.setStringAsync(text);
        Toast.show({
          type: "success",
          text1: "Copied to Clipboard",
          text2: `${label} copied successfully.`,
          position: "bottom",
        });
      } catch {
        Toast.show({
          type: "error",
          text1: "Copy Failed",
          text2: "Unable to copy to clipboard.",
          position: "bottom",
        });
      }
    };

    const handleCall = (phone?: string | null) => {
      if (!phone) return;
      const cleanPhone = phone.replace(/[^\d+]/g, "");
      Linking.openURL(`tel:${cleanPhone}`).catch(() => {
        Toast.show({
          type: "error",
          text1: "Call Error",
          text2: "Unable to open dialer on this device.",
          position: "bottom",
        });
      });
    };

    const handleEmail = (email?: string | null) => {
      if (!email) return;
      Linking.openURL(`mailto:${email.trim()}`).catch(() => {
        Toast.show({
          type: "error",
          text1: "Email Error",
          text2: "Unable to open email client.",
          position: "bottom",
        });
      });
    };

    const handleOpenUrl = (url?: string | null, label = "Link") => {
      if (!url) return;
      const validUrl = url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
      Linking.openURL(validUrl).catch(() => {
        Toast.show({
          type: "error",
          text1: "Link Error",
          text2: `Unable to open ${label}.`,
          position: "bottom",
        });
      });
    };

    const handleShare = async () => {
      try {
        await Share.share({
          title: `Faculty Contact: ${teacher.name}`,
          message: `${teacher.name} (${profile?.designation || "Faculty Member"}, ${profile?.department || "Department"})\n` +
            `Teacher ID: ${profile?.teacherId || "N/A"}\n` +
            `Email: ${teacher.email || "N/A"}\n` +
            (teacher.phoneNumber ? `Phone: ${teacher.phoneNumber}\n` : "") +
            (profile?.officeRoom ? `Office: ${profile.officeRoom}\n` : "") +
            (profile?.consultationHours ? `Consultation: ${profile.consultationHours}\n` : ""),
        });
      } catch {
        // Ignored or cancelled
      }
    };

    // Helper to render academic qualifications safely
    const renderQualifications = () => {
      const quals = profile?.academicQualifications;
      if (!quals) return null;

      if (Array.isArray(quals)) {
        if (quals.length === 0) return null;
        return (
          <View style={styles.qualificationsList}>
            {quals.map((q: any, idx: number) => {
              const text =
                typeof q === "string"
                  ? q
                  : q?.degree
                  ? `${q.degree}${q.institution ? ` - ${q.institution}` : ""}${q.year ? ` (${q.year})` : ""}`
                  : JSON.stringify(q);
              return (
                <View key={idx} style={styles.qualificationItem}>
                  <View style={styles.qualBullet}>
                    <Feather name="award" size={13} color={DIRECTORY_COLORS.tealDark} />
                  </View>
                  <Text style={styles.qualificationText}>{text}</Text>
                </View>
              );
            })}
          </View>
        );
      }

      if (typeof quals === "string" && quals.trim().length > 0) {
        return (
          <View style={styles.qualificationItem}>
            <View style={styles.qualBullet}>
              <Feather name="award" size={13} color={DIRECTORY_COLORS.tealDark} />
            </View>
            <Text style={styles.qualificationText}>{quals}</Text>
          </View>
        );
      }

      return null;
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.modalSafeContainer} edges={["top", "bottom"]}>
          {/* Header Bar */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close faculty details"
            >
              <Feather name="x" size={22} color={DIRECTORY_COLORS.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle}>Faculty Profile</Text>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Share teacher details"
            >
              <Feather name="share-2" size={19} color={DIRECTORY_COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* HERO IDENTITY CARD */}
            <View style={styles.heroCard}>
              <View style={styles.avatarWrapper}>
                {teacher.image ? (
                  <Image
                    source={{ uri: teacher.image }}
                    style={styles.heroAvatar}
                    accessibilityLabel={`${teacher.name}'s profile photo`}
                  />
                ) : (
                  <View style={styles.heroAvatarFallback}>
                    <Text style={styles.heroAvatarInitial}>{initial}</Text>
                  </View>
                )}
                <View style={styles.heroVerifiedIcon}>
                  <Feather name="check" size={12} color="#ffffff" />
                </View>
              </View>

              <Text style={styles.heroName}>{teacher.name}</Text>

              <View style={styles.heroBadgeRow}>
                <View style={styles.verifiedFacultyPill}>
                  <Feather
                    name="shield"
                    size={11}
                    color={DIRECTORY_COLORS.tealDark}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.verifiedFacultyText}>Faculty Member</Text>
                </View>

                {profile?.teacherId ? (
                  <TouchableOpacity
                    style={styles.idChip}
                    onPress={() => handleCopy(profile.teacherId, "Teacher ID")}
                    activeOpacity={0.7}
                    accessibilityLabel={`Teacher ID ${profile.teacherId}. Tap to copy`}
                  >
                    <Feather
                      name="hash"
                      size={11}
                      color={DIRECTORY_COLORS.blueBadge}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.idChipText}>ID: {profile.teacherId}</Text>
                    <Feather
                      name="copy"
                      size={10}
                      color={DIRECTORY_COLORS.blueBadge}
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.heroDesignation}>
                {profile?.designation || "Academic Instructor"}
              </Text>
              <Text style={styles.heroDepartment}>
                {profile?.department || "Department not specified"}
              </Text>
              {profile?.faculty ? (
                <Text style={styles.heroFaculty}>{profile.faculty}</Text>
              ) : null}
            </View>

            {/* QUICK ACTIONS ROW */}
            <View style={styles.actionsRow}>
              {teacher.phoneNumber ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnCall]}
                  onPress={() => handleCall(teacher.phoneNumber)}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Call teacher phone"
                >
                  <Feather name="phone" size={16} color="#ffffff" />
                  <Text style={styles.actionBtnCallText}>Call</Text>
                </TouchableOpacity>
              ) : null}

              {teacher.email ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnEmail]}
                  onPress={() => handleEmail(teacher.email)}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Send email to teacher"
                >
                  <Feather name="mail" size={16} color={DIRECTORY_COLORS.blueText} />
                  <Text style={styles.actionBtnEmailText}>Email</Text>
                </TouchableOpacity>
              ) : null}

              {profile?.linkedInUrl ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnSocial]}
                  onPress={() => handleOpenUrl(profile.linkedInUrl, "LinkedIn")}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open teacher LinkedIn profile"
                >
                  <Feather name="linkedin" size={16} color={DIRECTORY_COLORS.textPrimary} />
                  <Text style={styles.actionBtnSocialText}>LinkedIn</Text>
                </TouchableOpacity>
              ) : null}

              {profile?.personalWebsiteUrl ? (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnSocial]}
                  onPress={() => handleOpenUrl(profile.personalWebsiteUrl, "Website")}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open teacher personal website"
                >
                  <Feather name="globe" size={16} color={DIRECTORY_COLORS.textPrimary} />
                  <Text style={styles.actionBtnSocialText}>Website</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* BENTO SECTION: ACADEMIC & OFFICE LOCATION */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: DIRECTORY_COLORS.tealSoft }]}>
                  <Feather name="map-pin" size={14} color={DIRECTORY_COLORS.tealDark} />
                </View>
                <Text style={styles.sectionTitle}>Office & Consultation</Text>
              </View>

              {/* Office Room */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Feather name="home" size={14} color={DIRECTORY_COLORS.textSecondary} />
                  <Text style={styles.detailLabel}>Office Room</Text>
                </View>
                <View style={styles.detailRight}>
                  <Text style={styles.detailValue}>
                    {profile?.officeRoom || "Not announced"}
                  </Text>
                  {profile?.officeRoom ? (
                    <TouchableOpacity
                      onPress={() => handleCopy(profile.officeRoom!, "Office Room")}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Copy office room"
                    >
                      <Feather name="copy" size={13} color={DIRECTORY_COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Advisory Batch */}
              {profile?.advisoryBatch ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Feather name="award" size={14} color={DIRECTORY_COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Advisory Batch</Text>
                  </View>
                  <View style={styles.detailRight}>
                    <Text style={styles.detailValue}>
                      Batch {profile.advisoryBatch}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Day Off */}
              {profile?.dayOff ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Feather name="coffee" size={14} color={DIRECTORY_COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Day Off</Text>
                  </View>
                  <View style={styles.detailRight}>
                    <Text style={styles.detailValue}>
                      {profile.dayOff}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* Consultation Hours */}
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.detailLeft}>
                  <Feather name="clock" size={14} color={DIRECTORY_COLORS.textSecondary} />
                  <Text style={styles.detailLabel}>Consultation</Text>
                </View>
                <View style={styles.detailRight}>
                  {profile?.consultationSlots && profile.consultationSlots.length > 0 ? (
                    <View style={{ gap: 4, alignItems: "flex-end" }}>
                      {profile.consultationSlots.map((s, idx) => (
                        <Text key={idx} style={styles.detailValue}>
                          {s.day}: {s.startTime || "TBD"} – {s.endTime || "TBD"}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.detailValue}>
                      {profile?.consultationHours || "By appointment via email"}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* BENTO SECTION: QUALIFICATIONS */}
            {renderQualifications() ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: DIRECTORY_COLORS.amberSoft }]}>
                    <Feather name="award" size={14} color={DIRECTORY_COLORS.amberDark} />
                  </View>
                  <Text style={styles.sectionTitle}>Academic Qualifications</Text>
                </View>
                {renderQualifications()}
              </View>
            ) : null}

            {/* BENTO SECTION: EXPERTISE FIELDS */}
            {profile?.expertiseFields && profile.expertiseFields.length > 0 ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: DIRECTORY_COLORS.purpleSoft }]}>
                    <Feather name="cpu" size={14} color={DIRECTORY_COLORS.purpleText} />
                  </View>
                  <Text style={styles.sectionTitle}>Fields of Expertise</Text>
                </View>
                <View style={styles.expertiseChipsRow}>
                  {profile.expertiseFields.map((field, i) => (
                    <View key={i} style={styles.expertiseChip}>
                      <Text style={styles.expertiseChipText}>{field}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* BENTO SECTION: CONTACT INFORMATION */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: DIRECTORY_COLORS.blueSoft }]}>
                  <Feather name="phone-call" size={14} color={DIRECTORY_COLORS.blueText} />
                </View>
                <Text style={styles.sectionTitle}>Contact Channels</Text>
              </View>

              {/* Email */}
              <View style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Feather name="mail" size={14} color={DIRECTORY_COLORS.textSecondary} />
                  <Text style={styles.detailLabel}>Email</Text>
                </View>
                <View style={styles.detailRight}>
                  <TouchableOpacity
                    onPress={() => handleEmail(teacher.email)}
                    style={{ flexShrink: 1 }}
                  >
                    <Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>
                      {teacher.email || "N/A"}
                    </Text>
                  </TouchableOpacity>
                  {teacher.email ? (
                    <TouchableOpacity
                      onPress={() => handleCopy(teacher.email, "Email")}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Copy email address"
                    >
                      <Feather name="copy" size={13} color={DIRECTORY_COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Phone */}
              {teacher.phoneNumber ? (
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <Feather name="phone" size={14} color={DIRECTORY_COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Phone</Text>
                  </View>
                  <View style={styles.detailRight}>
                    <TouchableOpacity
                      onPress={() => handleCall(teacher.phoneNumber)}
                      style={{ flexShrink: 1 }}
                    >
                      <Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>
                        {teacher.phoneNumber}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleCopy(teacher.phoneNumber!, "Phone Number")}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Copy phone number"
                    >
                      <Feather name="copy" size={13} color={DIRECTORY_COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* Blood Group */}
              {teacher.bloodGroup ? (
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.detailLeft}>
                    <Feather name="heart" size={14} color="#dc2626" />
                    <Text style={styles.detailLabel}>Blood Group</Text>
                  </View>
                  <View style={styles.detailRight}>
                    <View style={styles.bloodBadge}>
                      <Text style={styles.bloodBadgeText}>{teacher.bloodGroup.replace("_", " ")}</Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalSafeContainer: {
    flex: 1,
    backgroundColor: DIRECTORY_COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: DIRECTORY_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: DIRECTORY_COLORS.cardBorder,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
  },

  // HERO IDENTITY CARD
  heroCard: {
    backgroundColor: DIRECTORY_COLORS.surface,
    borderRadius: DIRECTORY_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.cardBorder,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    ...DIRECTORY_COLORS.cardShadow,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  heroAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
  },
  heroAvatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: DIRECTORY_COLORS.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: DIRECTORY_COLORS.blueBorder,
  },
  heroAvatarInitial: {
    fontFamily,
    fontSize: 34,
    fontWeight: "800",
    color: DIRECTORY_COLORS.blueText,
  },
  heroVerifiedIcon: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DIRECTORY_COLORS.tealDark,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  heroName: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 6,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  verifiedFacultyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIRECTORY_COLORS.tealSoft,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: DIRECTORY_COLORS.pillRadius,
  },
  verifiedFacultyText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: DIRECTORY_COLORS.tealDark,
  },
  idChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIRECTORY_COLORS.blueSoft,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: DIRECTORY_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.blueBorder,
  },
  idChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: DIRECTORY_COLORS.blueText,
  },
  heroDesignation: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: DIRECTORY_COLORS.blueText,
    textAlign: "center",
  },
  heroDepartment: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: DIRECTORY_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  heroFaculty: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: DIRECTORY_COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
  },

  // QUICK ACTIONS
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: DIRECTORY_COLORS.innerRadius,
    gap: 6,
    ...DIRECTORY_COLORS.shadow,
  },
  actionBtnCall: {
    backgroundColor: DIRECTORY_COLORS.deepNavy,
  },
  actionBtnCallText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionBtnEmail: {
    backgroundColor: DIRECTORY_COLORS.surface,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.blueBorder,
  },
  actionBtnEmailText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: DIRECTORY_COLORS.blueText,
  },
  actionBtnSocial: {
    backgroundColor: DIRECTORY_COLORS.surface,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.cardBorder,
  },
  actionBtnSocialText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: DIRECTORY_COLORS.textPrimary,
  },

  // BENTO SECTIONS
  sectionCard: {
    backgroundColor: DIRECTORY_COLORS.surface,
    borderRadius: DIRECTORY_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.cardBorder,
    padding: 16,
    marginBottom: 14,
    ...DIRECTORY_COLORS.cardShadow,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DIRECTORY_COLORS.divider,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 120,
  },
  detailLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: DIRECTORY_COLORS.textSecondary,
  },
  detailRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  detailValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: DIRECTORY_COLORS.textPrimary,
    textAlign: "right",
  },
  linkText: {
    color: DIRECTORY_COLORS.blueBadge,
  },
  bloodBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  bloodBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#dc2626",
  },

  // QUALIFICATIONS
  qualificationsList: {
    gap: 10,
  },
  qualificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  qualBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DIRECTORY_COLORS.tealSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  qualificationText: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: DIRECTORY_COLORS.textPrimary,
    lineHeight: 19,
  },

  // EXPERTISE
  expertiseChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  expertiseChip: {
    backgroundColor: DIRECTORY_COLORS.purpleSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DIRECTORY_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.purpleBorder,
  },
  expertiseChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: DIRECTORY_COLORS.purpleText,
  },
});
