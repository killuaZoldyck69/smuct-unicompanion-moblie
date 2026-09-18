import React, { memo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../../constants";
import type { ForumAuthor } from "../../types";

interface DiscussionProfileModalProps {
  visible: boolean;
  profile: ForumAuthor | null;
  onClose: () => void;
}

interface InfoRowProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  iconColor?: string;
}

const InfoRow = memo(function InfoRow({
  icon,
  label,
  value,
  iconColor = BENTO_COLORS.primaryBlue,
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBox, { backgroundColor: iconColor + "18" }]}>
        <Feather name={icon} size={14} color={iconColor} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
});

export const DiscussionProfileModal = memo(function DiscussionProfileModal({
  visible,
  profile,
  onClose,
}: DiscussionProfileModalProps) {
  if (!profile) return null;

  const initial = profile.name?.charAt(0).toUpperCase() || "U";
  const isStudent = Boolean(profile.studentProfile);
  const isTeacher = Boolean(profile.teacherProfile);
  const isAdmin = profile.role === "ADMIN";

  const roleColor = isStudent
    ? BENTO_COLORS.primaryBlue
    : isTeacher
      ? BENTO_COLORS.emerald
      : isAdmin
        ? "#7c3aed"
        : BENTO_COLORS.subtleText;

  const roleBg = isStudent
    ? "rgba(30,58,138,0.08)"
    : isTeacher
      ? BENTO_COLORS.emeraldBg
      : isAdmin
        ? "rgba(124,58,237,0.08)"
        : BENTO_COLORS.slateBg;

  const roleIcon: React.ComponentProps<typeof Feather>["name"] = isStudent
    ? "book-open"
    : isTeacher
      ? "award"
      : isAdmin
        ? "shield"
        : "user";

  const roleName = isStudent
    ? "Student"
    : isTeacher
      ? "Faculty"
      : isAdmin
        ? "Admin"
        : "Member";

  const sp = profile.studentProfile;
  const tp = profile.teacherProfile;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* X close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close profile"
          >
            <Feather name="x" size={16} color={BENTO_COLORS.subtleText} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {/* Avatar & name hero */}
            <View style={styles.heroSection}>
              <View style={styles.avatarRing}>
                {profile.image ? (
                  <Image
                    source={{ uri: profile.image }}
                    style={styles.avatar}
                    accessible={true}
                    accessibilityLabel={`${profile.name}'s photo`}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      { backgroundColor: roleColor + "1a" },
                    ]}
                  >
                    <Text style={[styles.avatarInitial, { color: roleColor }]}>
                      {initial}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.name}>{profile.name}</Text>

              <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
                <Feather
                  name={roleIcon}
                  size={11}
                  color={roleColor}
                  style={styles.roleBadgeIcon}
                />
                <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                  {roleName}
                </Text>
              </View>
            </View>

            {/* Contact info (always shown if present) */}
            {(profile.email || profile.phoneNumber) && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardHeader}>Contact</Text>

                {profile.email && (
                  <InfoRow
                    icon="mail"
                    label="Email"
                    value={profile.email}
                    iconColor={BENTO_COLORS.sky}
                  />
                )}
                {profile.phoneNumber && (
                  <InfoRow
                    icon="phone"
                    label="Phone"
                    value={profile.phoneNumber}
                    iconColor={BENTO_COLORS.emerald}
                  />
                )}
              </View>
            )}

            {/* Student info */}
            {isStudent && sp && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardHeader}>Academic Info</Text>

                {sp.studentId && (
                  <InfoRow
                    icon="hash"
                    label="Student ID"
                    value={sp.studentId}
                    iconColor="#7c3aed"
                  />
                )}

                {sp.department && (
                  <InfoRow
                    icon="layers"
                    label="Department"
                    value={sp.department}
                    iconColor={BENTO_COLORS.primaryBlue}
                  />
                )}
                {sp.program && (
                  <InfoRow
                    icon="book"
                    label="Program"
                    value={sp.program}
                    iconColor={BENTO_COLORS.deepNavy}
                  />
                )}
                {sp.batch && (
                  <InfoRow
                    icon="users"
                    label="Batch"
                    value={sp.batch}
                    iconColor={BENTO_COLORS.sky}
                  />
                )}
                {sp.currentSemester != null && (
                  <InfoRow
                    icon="calendar"
                    label="Semester"
                    value={`Semester ${sp.currentSemester}`}
                    iconColor={BENTO_COLORS.sky}
                  />
                )}
                {sp.section && (
                  <InfoRow
                    icon="grid"
                    label="Section"
                    value={`Section ${sp.section}`}
                    iconColor="#7c3aed"
                  />
                )}

                {/* CR / TA badges */}
                {(sp.isCR || sp.isTA) && (
                  <View style={styles.badgeRow}>
                    {sp.isCR && (
                      <View style={styles.rolePill}>
                        <Feather
                          name="star"
                          size={10}
                          color={BENTO_COLORS.primaryBlue}
                          style={styles.pillIcon}
                        />
                        <Text style={styles.rolePillText}>
                          Class Representative
                        </Text>
                      </View>
                    )}
                    {sp.isTA && (
                      <View style={[styles.rolePill, styles.rolePillTA]}>
                        <Feather
                          name="zap"
                          size={10}
                          color={BENTO_COLORS.emerald}
                          style={styles.pillIcon}
                        />
                        <Text
                          style={[
                            styles.rolePillText,
                            { color: BENTO_COLORS.emerald },
                          ]}
                        >
                          Teaching Assistant
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Teacher info */}
            {isTeacher && tp && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardHeader}>Faculty Info</Text>

                {tp.teacherId && (
                  <InfoRow
                    icon="hash"
                    label="Teacher ID"
                    value={tp.teacherId}
                    iconColor="#7c3aed"
                  />
                )}
                {tp.designation && (
                  <InfoRow
                    icon="briefcase"
                    label="Designation"
                    value={tp.designation}
                    iconColor={BENTO_COLORS.emerald}
                  />
                )}
                {tp.faculty && (
                  <InfoRow
                    icon="home"
                    label="Faculty"
                    value={tp.faculty}
                    iconColor={BENTO_COLORS.subtleText}
                  />
                )}
                {tp.department && (
                  <InfoRow
                    icon="layers"
                    label="Department"
                    value={tp.department}
                    iconColor={BENTO_COLORS.primaryBlue}
                  />
                )}
                {tp.officeRoom && (
                  <InfoRow
                    icon="map-pin"
                    label="Office Room"
                    value={tp.officeRoom}
                    iconColor={BENTO_COLORS.sky}
                  />
                )}
                {tp.consultationHours && (
                  <InfoRow
                    icon="clock"
                    label="Consultation Hours"
                    value={tp.consultationHours}
                    iconColor="#d97706"
                  />
                )}
              </View>
            )}

            {/* Admin info */}
            {isAdmin && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardHeader}>Role Info</Text>
                <InfoRow
                  icon="shield"
                  label="Access Level"
                  value="System Administrator"
                  iconColor="#7c3aed"
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: "90%",
    ...BENTO_COLORS.heroShadow,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 4,
  },

  // Hero
  heroSection: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 4,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 14,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 32,
    fontWeight: "800",
  },
  name: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 8,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  roleBadgeIcon: {
    marginRight: 5,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },

  // Info card
  infoCard: {
    backgroundColor: BENTO_COLORS.slateBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  infoCardHeader: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginTop: 1,
  },

  // CR / TA badges
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,58,138,0.08)",
    borderRadius: BENTO_COLORS.pillRadius,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rolePillTA: {
    backgroundColor: BENTO_COLORS.emeraldBg,
  },
  pillIcon: {
    marginRight: 4,
  },
  rolePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.primaryBlue,
  },
});
