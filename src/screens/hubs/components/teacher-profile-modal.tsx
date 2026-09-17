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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
  teacherProfile?: {
    department?: string | null;
    designation?: string | null;
    faculty?: string | null;
    officeRoom?: string | null;
    consultationHours?: string | null;
    expertiseFields?: string[] | null;
    linkedInUrl?: string | null;
    personalWebsiteUrl?: string | null;
  } | null;
}

interface TeacherProfileModalProps {
  teacher: Teacher | null;
  onClose: () => void;
  onAssign: (teacher: Teacher) => void;
}

const BENTO_COLORS = {
  deepNavy: "#131b2e",
  blueSoft: "#d0e4ff",
  blueDark: "#1e3a8a",
  mintSoft: "#c3f0d2",
  mintDark: "#065f46",
  lavenderSoft: "#f3e8ff",
  lavenderDark: "#581c87",
  subtleText: "#64748b",
  borderLight: "rgba(19, 27, 46, 0.08)",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export default function TeacherProfileModal({
  teacher,
  onClose,
  onAssign,
}: TeacherProfileModalProps) {
  if (!teacher) return null;

  const handleOpenLink = (url?: string | null) => {
    if (!url) return;
    const validUrl = url.startsWith("http") ? url : `https://${url}`;
    Linking.openURL(validUrl).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open link" });
    });
  };

  const handleCall = (phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open dialer" });
    });
  };

  const handleEmail = (email?: string | null) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {
      Toast.show({ type: "error", text1: "Unable to open mail client" });
    });
  };

  return (
    <Modal
      visible={!!teacher}
      animationType="fade"
      transparent
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.profileModalOverlay}>
        <TouchableOpacity
          style={styles.profileModalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.profileBentoCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.profileBadge}>
              <Feather
                name="shield"
                size={12}
                color={BENTO_COLORS.blueDark}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.profileBadgeText}>Faculty Member</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.profileCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close profile details"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.profileHero}>
              {teacher.image ? (
                <Image
                  source={{ uri: teacher.image }}
                  style={styles.profileHeroAvatar}
                />
              ) : (
                <View style={styles.profileHeroAvatarFallback}>
                  <Text style={styles.profileHeroAvatarFallbackText}>
                    {teacher.name?.charAt(0)?.toUpperCase() || "T"}
                  </Text>
                </View>
              )}

              <Text style={styles.profileHeroName}>{teacher.name}</Text>

              <View style={styles.profileHeroPills}>
                <View style={styles.profileDesignationPill}>
                  <Text style={styles.profileDesignationText}>
                    {teacher.teacherProfile?.designation || "Faculty"}
                  </Text>
                </View>
                <Text style={styles.profileDepartmentText}>
                  {teacher.teacherProfile?.department || "University Faculty"}
                </Text>
              </View>
            </View>

            <View style={[styles.profileSectionBox, styles.sectionMint]}>
              <Text style={styles.sectionTitleMint}>CAMPUS LOCATION</Text>

              <View style={styles.infoRow}>
                <Feather
                  name="map-pin"
                  size={15}
                  color={BENTO_COLORS.mintDark}
                  style={styles.infoRowIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoRowLabel}>Office Room</Text>
                  <Text style={styles.infoRowValue}>
                    {teacher.teacherProfile?.officeRoom || "Not specified"}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: 10 }]}>
                <Feather
                  name="clock"
                  size={15}
                  color={BENTO_COLORS.mintDark}
                  style={styles.infoRowIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoRowLabel}>Consultation Hours</Text>
                  <Text style={styles.infoRowValue}>
                    {teacher.teacherProfile?.consultationHours ||
                      "Available by appointment"}
                  </Text>
                </View>
              </View>

              {!!teacher.teacherProfile?.faculty && (
                <View style={[styles.infoRow, { marginTop: 10 }]}>
                  <Feather
                    name="award"
                    size={15}
                    color={BENTO_COLORS.mintDark}
                    style={styles.infoRowIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoRowLabel}>Faculty</Text>
                    <Text style={styles.infoRowValue}>
                      {teacher.teacherProfile.faculty}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.profileSectionBox, styles.sectionBlue]}>
              <Text style={styles.sectionTitleBlue}>COMMUNICATION</Text>

              {!!teacher.email && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleEmail(teacher.email)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Send email to ${teacher.email}`}
                >
                  <Feather
                    name="mail"
                    size={15}
                    color={BENTO_COLORS.blueDark}
                    style={styles.infoRowIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoRowLabel}>Email Address</Text>
                    <Text style={styles.contactValueText}>{teacher.email}</Text>
                  </View>
                  <Feather
                    name="arrow-up-right"
                    size={14}
                    color={BENTO_COLORS.blueDark}
                  />
                </TouchableOpacity>
              )}

              {!!teacher.phoneNumber && (
                <TouchableOpacity
                  style={[styles.contactRow, { marginTop: 10 }]}
                  onPress={() => handleCall(teacher.phoneNumber)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${teacher.phoneNumber}`}
                >
                  <Feather
                    name="phone"
                    size={15}
                    color={BENTO_COLORS.blueDark}
                    style={styles.infoRowIcon}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoRowLabel}>Phone Number</Text>
                    <Text style={styles.contactValueText}>
                      {teacher.phoneNumber}
                    </Text>
                  </View>
                  <Feather
                    name="arrow-up-right"
                    size={14}
                    color={BENTO_COLORS.blueDark}
                  />
                </TouchableOpacity>
              )}
            </View>

            {Array.isArray(teacher.teacherProfile?.expertiseFields) &&
              teacher.teacherProfile.expertiseFields.length > 0 && (
                <View style={[styles.profileSectionBox, styles.sectionLavender]}>
                  <Text style={styles.sectionTitleLavender}>AREAS OF EXPERTISE</Text>
                  <View style={styles.expertisePillContainer}>
                    {teacher.teacherProfile.expertiseFields.map((field, idx) => (
                      <View key={idx} style={styles.expertisePill}>
                        <Text style={styles.expertisePillText}>{field}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {(teacher.teacherProfile?.linkedInUrl ||
              teacher.teacherProfile?.personalWebsiteUrl) && (
              <View style={styles.linksRow}>
                {!!teacher.teacherProfile?.linkedInUrl && (
                  <TouchableOpacity
                    style={styles.socialLinkBtn}
                    onPress={() =>
                      handleOpenLink(teacher.teacherProfile?.linkedInUrl)
                    }
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Open LinkedIn Profile"
                  >
                    <Feather
                      name="linkedin"
                      size={14}
                      color={BENTO_COLORS.deepNavy}
                    />
                    <Text style={styles.socialLinkText}>LinkedIn</Text>
                  </TouchableOpacity>
                )}
                {!!teacher.teacherProfile?.personalWebsiteUrl && (
                  <TouchableOpacity
                    style={styles.socialLinkBtn}
                    onPress={() =>
                      handleOpenLink(teacher.teacherProfile?.personalWebsiteUrl)
                    }
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Open Website"
                  >
                    <Feather
                      name="globe"
                      size={14}
                      color={BENTO_COLORS.deepNavy}
                    />
                    <Text style={styles.socialLinkText}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.profileAssignBtn}
            onPress={() => onAssign(teacher)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Assign ${teacher.name} as Course Instructor`}
            activeOpacity={0.85}
          >
            <Feather
              name="check-circle"
              size={18}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.profileAssignBtnText}>
              Assign as Course Instructor
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  profileModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileBentoCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 10,
  },
  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  profileBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.blueDark,
    fontFamily,
  },
  profileCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 16,
  },
  profileHero: {
    alignItems: "center",
    marginBottom: 18,
  },
  profileHeroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: "#e2e8f0",
    marginBottom: 12,
  },
  profileHeroAvatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: BENTO_COLORS.blueSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileHeroAvatarFallbackText: {
    fontSize: 36,
    fontWeight: "800",
    color: BENTO_COLORS.blueDark,
    fontFamily,
  },
  profileHeroName: {
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
    textAlign: "center",
  },
  profileHeroPills: {
    alignItems: "center",
    marginTop: 6,
  },
  profileDesignationPill: {
    backgroundColor: BENTO_COLORS.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  profileDesignationText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.mintDark,
    fontFamily,
  },
  profileDepartmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    fontFamily,
    textAlign: "center",
  },
  profileSectionBox: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  sectionMint: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "rgba(6, 95, 70, 0.12)",
  },
  sectionTitleMint: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.mintDark,
    letterSpacing: 0.8,
    marginBottom: 12,
    fontFamily,
  },
  sectionBlue: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.1)",
  },
  sectionTitleBlue: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.blueDark,
    letterSpacing: 0.8,
    marginBottom: 12,
    fontFamily,
  },
  sectionLavender: {
    backgroundColor: "#faf5ff",
    borderWidth: 1,
    borderColor: "rgba(88, 28, 135, 0.1)",
  },
  sectionTitleLavender: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.lavenderDark,
    letterSpacing: 0.8,
    marginBottom: 12,
    fontFamily,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoRowIcon: {
    marginRight: 10,
  },
  infoRowLabel: {
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
    fontFamily,
  },
  infoRowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginTop: 1,
    fontFamily,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 12,
  },
  contactValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.blueDark,
    marginTop: 1,
    fontFamily,
  },
  expertisePillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  expertisePill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(88, 28, 135, 0.1)",
  },
  expertisePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.lavenderDark,
    fontFamily,
  },
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  socialLinkBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    gap: 6,
  },
  socialLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    fontFamily,
  },
  profileAssignBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  profileAssignBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
    fontFamily,
  },
});
