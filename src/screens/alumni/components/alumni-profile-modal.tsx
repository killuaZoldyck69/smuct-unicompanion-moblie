import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ImageStyle,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../constants";
import { AlumniItem } from "../types";
import {
  getDeptTheme,
  getAvatarTheme,
  getInitials,
  openSafeLink,
  copyToClipboard,
  shareAlumniProfile,
} from "../utils";

interface AlumniProfileModalProps {
  alumni: AlumniItem | null;
  onClose: () => void;
}

export const AlumniProfileModal: React.FC<AlumniProfileModalProps> = React.memo(
  ({ alumni, onClose }) => {
    const [imageError, setImageError] = useState(false);

    if (!alumni) return null;

    const deptTheme = getDeptTheme(alumni.department);
    const avatarTheme = getAvatarTheme(alumni.name, alumni.department);
    const imageUrl = alumni.image || alumni.imageUrl;
    const hasImage = Boolean(imageUrl) && !imageError;
    const linkedIn = alumni.linkedInUrl || alumni.linkedinUrl;

    const role =
      alumni.currentPosition ||
      alumni.designation ||
      alumni.currentRole ||
      "Professional";
    const batch = alumni.batch || alumni.graduationBatch;
    const year = alumni.graduationYear || alumni.passingYear;

    return (
      <Modal
        visible={Boolean(alumni)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
        transparent={Platform.OS === "web"}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.safeArea} accessibilityViewIsModal={true}>
            {/* Drag Handle Bar */}
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerTitle}>Graduate Profile</Text>
                <Text style={styles.headerSub}>SMUCT Alumni Network</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close profile"
              >
                <Feather name="x" size={18} color={BENTO.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 1. Hero Identity Card */}
              <View style={styles.heroCard}>
                <View style={styles.avatarContainer}>
                  {hasImage ? (
                    <Image
                      source={{ uri: imageUrl! }}
                      style={styles.avatarImg as ImageStyle}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarFallback,
                        {
                          backgroundColor: avatarTheme.bg,
                          borderColor: avatarTheme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarInitial,
                          { color: avatarTheme.text },
                        ]}
                      >
                        {getInitials(alumni.name)}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.deptTag,
                      {
                        backgroundColor: deptTheme.bg,
                        borderColor: deptTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.deptTagText, { color: deptTheme.text }]}
                    >
                      {deptTheme.badge}
                    </Text>
                  </View>
                </View>

                <Text style={styles.heroName}>{alumni.name}</Text>

                {/* Role and Company */}
                <View style={styles.roleWrap}>
                  <Feather
                    name="briefcase"
                    size={14}
                    color={BENTO.indigo}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.roleText}>
                    {role}
                    {alumni.currentCompany ? ` at ${alumni.currentCompany}` : ""}
                  </Text>
                </View>

                {/* Academic Summary Badge */}
                <View style={styles.eduBadge}>
                  <Feather
                    name="award"
                    size={13}
                    color={BENTO.slate}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.eduBadgeText}>
                    {batch ? `${batch} • ` : ""}
                    Class of {year || "Alumni"} • {alumni.department}
                  </Text>
                </View>
              </View>

              {/* 2. Quick Action Grid */}
              <View style={styles.actionGrid}>
                {Boolean(linkedIn) ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionLinkedIn]}
                    onPress={() => openSafeLink(linkedIn)}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Open LinkedIn profile"
                  >
                    <Feather
                      name="linkedin"
                      size={15}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.actionTextWhite}>LinkedIn</Text>
                  </TouchableOpacity>
                ) : null}

                {Boolean(alumni.email) ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionEmail]}
                    onPress={() => openSafeLink(`mailto:${alumni.email}`)}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Send email to alumnus"
                  >
                    <Feather
                      name="mail"
                      size={15}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.actionTextWhite}>Email</Text>
                  </TouchableOpacity>
                ) : null}

                {Boolean(alumni.email) ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionSubtle]}
                    onPress={() => copyToClipboard(alumni.email!, "Email")}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Copy email address"
                  >
                    <Feather
                      name="copy"
                      size={14}
                      color={BENTO.navy}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.actionTextDark}>Copy</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionSubtle]}
                  onPress={() => shareAlumniProfile(alumni)}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Share alumni profile"
                >
                  <Feather
                    name="share-2"
                    size={14}
                    color={BENTO.navy}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.actionTextDark}>Share</Text>
                </TouchableOpacity>
              </View>

              {/* 3. Career & Industry Card */}
              {Boolean(
                alumni.currentCompany ||
                  alumni.currentPosition ||
                  alumni.designation ||
                  alumni.personalWebsiteUrl,
              ) ? (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View
                      style={[
                        styles.sectionIconWrap,
                        { backgroundColor: BENTO.indigoBg },
                      ]}
                    >
                      <Feather
                        name="briefcase"
                        size={14}
                        color={BENTO.indigo}
                      />
                    </View>
                    <Text style={styles.sectionTitle}>CAREER & INDUSTRY</Text>
                  </View>

                  {Boolean(alumni.currentCompany) ? (
                    <View style={styles.infoLine}>
                      <Text style={styles.infoLabel}>Company</Text>
                      <Text style={styles.infoValue}>
                        {alumni.currentCompany}
                      </Text>
                    </View>
                  ) : null}

                  {Boolean(
                    alumni.currentPosition ||
                      alumni.designation ||
                      alumni.currentRole,
                  ) ? (
                    <View style={styles.infoLine}>
                      <Text style={styles.infoLabel}>Designation / Role</Text>
                      <Text style={styles.infoValue}>{role}</Text>
                    </View>
                  ) : null}

                  {Boolean(alumni.personalWebsiteUrl) ? (
                    <View style={styles.infoLine}>
                      <Text style={styles.infoLabel}>Portfolio / Web</Text>
                      <TouchableOpacity
                        onPress={() => openSafeLink(alumni.personalWebsiteUrl)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.infoLink}>
                          {alumni.personalWebsiteUrl}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* 4. Academic Background Card */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View
                    style={[
                      styles.sectionIconWrap,
                      { backgroundColor: BENTO.emeraldBg },
                    ]}
                  >
                    <Feather
                      name="book-open"
                      size={14}
                      color={BENTO.emerald}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>ACADEMIC BACKGROUND</Text>
                </View>

                <View style={styles.infoLine}>
                  <Text style={styles.infoLabel}>Institution</Text>
                  <Text style={styles.infoValue}>
                    Shanto-Mariam University of Creative Technology
                  </Text>
                </View>

                {Boolean(alumni.department) ? (
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Department</Text>
                    <Text style={styles.infoValue}>{alumni.department}</Text>
                  </View>
                ) : null}

                {Boolean(alumni.degree) ? (
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Degree</Text>
                    <Text style={styles.infoValue}>{alumni.degree}</Text>
                  </View>
                ) : null}

                {Boolean(batch) ? (
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Batch</Text>
                    <Text style={styles.infoValue}>{batch}</Text>
                  </View>
                ) : null}

                {Boolean(year) ? (
                  <View style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Graduation Year</Text>
                    <Text style={styles.infoValue}>{year}</Text>
                  </View>
                ) : null}
              </View>

              {/* 5. Professional Skills Grid */}
              {alumni.skills && alumni.skills.length > 0 ? (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <View
                      style={[
                        styles.sectionIconWrap,
                        { backgroundColor: BENTO.amberBg },
                      ]}
                    >
                      <Feather name="zap" size={14} color={BENTO.amber} />
                    </View>
                    <Text style={styles.sectionTitle}>EXPERTISE & SKILLS</Text>
                  </View>

                  <View style={styles.skillsGrid}>
                    {alumni.skills.map((skill, index) => (
                      <View key={index} style={styles.skillTag}>
                        <Text style={styles.skillTagText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* 6. Mentorship Guidance Card */}
              <View style={styles.mentorshipCard}>
                <Feather
                  name="compass"
                  size={18}
                  color={BENTO.indigo}
                  style={{ marginRight: 10, marginTop: 2 }}
                />
                <Text style={styles.mentorshipText}>
                  Tip: You can reach out to alumni on LinkedIn or email for career
                  mentoring, resume guidance, or industry insights.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  safeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: BENTO.card,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: BENTO.card,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
  },
  headerSub: {
    fontSize: 11,
    color: BENTO.slate,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  heroCard: {
    backgroundColor: BENTO.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 12,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)" }
      : { elevation: 2 }),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: BENTO.canvas,
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  deptTag: {
    position: "absolute",
    bottom: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  deptTagText: {
    fontSize: 10,
    fontWeight: "800",
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 5,
    fontFamily: BENTO.fontHeading,
  },
  roleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navySecondary,
    textAlign: "center",
  },
  eduBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },
  eduBadgeText: {
    fontSize: 11,
    color: BENTO.slate,
    fontWeight: "600",
    textAlign: "center",
  },
  actionGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
  },
  actionLinkedIn: {
    backgroundColor: "#0a66c2",
  },
  actionEmail: {
    backgroundColor: BENTO.navy,
  },
  actionSubtle: {
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  actionTextWhite: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionTextDark: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  sectionCard: {
    backgroundColor: BENTO.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  infoLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.04)",
  },
  infoLabel: {
    fontSize: 12,
    color: BENTO.slate,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  infoLink: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
    textDecorationLine: "underline",
    textAlign: "right",
  },
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  skillTag: {
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  skillTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.indigo,
  },
  mentorshipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: BENTO.indigoBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  mentorshipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: BENTO.indigo,
    fontWeight: "600",
  },
});
