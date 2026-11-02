import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Path } from "react-native-svg";
import {
  PROFILE_COLORS,
  BLOOD_GROUP_TO_UI,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../constants";
import { formatPhoneNumber } from "../utils";
import { ProfileLogoutButton } from "./shared/profile-logout-button";

interface AdminProfileProps {
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
    image?: string | null;
    phoneNumber?: string | null;
    bloodGroup?: string | null;
  };
}

function AdminShieldWatermark() {
  return (
    <Svg
      width={150}
      height={150}
      viewBox="0 0 150 150"
      style={styles.heroWatermark}
      aria-hidden={true}
    >
      <Circle cx="84" cy="72" r="72" fill="#ffffff" opacity={0.05} />
      <Path
        d="M75 26 119 42v31c0 27-18 43-44 55-26-12-44-28-44-55V42l44-16Z"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        opacity={0.16}
      />
      <Path
        d="m58 74 12 12 24-27"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.16}
      />
    </Svg>
  );
}

export default function AdminProfile({ sessionUser }: AdminProfileProps) {
  const insets = useSafeAreaInsets();
  const displayName = sessionUser.name || "Administrator";
  const displayBloodGroup = sessionUser.bloodGroup
    ? BLOOD_GROUP_TO_UI[sessionUser.bloodGroup] || sessionUser.bloodGroup
    : "Not provided";
  const displayPhone = formatPhoneNumber(sessionUser.phoneNumber);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: Math.max(insets.bottom + 120, 132),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.headingCopy}>
            <Text style={styles.pageTitle}>My Profile</Text>
            <Text style={styles.pageSubtitle}>
              Your account identity and administrative access.
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Feather name="shield" size={19} color="#4338ca" />
          </View>
        </View>

        <View style={styles.heroCard}>
          <AdminShieldWatermark />
          <View style={styles.identityRow}>
            <View style={styles.avatarFrame}>
              {sessionUser.image ? (
                <Image
                  source={{ uri: sessionUser.image }}
                  style={styles.avatar}
                  accessibilityLabel={`${displayName}'s profile picture`}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Feather name="user" size={29} color="#4338ca" />
                </View>
              )}
            </View>

            <View style={styles.identityCopy}>
              <Text style={styles.nameText} numberOfLines={2}>
                {displayName}
              </Text>
              <View style={styles.roleBadge}>
                <Feather name="shield" size={11} color="#4338ca" />
                <Text style={styles.roleText}>SYSTEM ADMIN</Text>
              </View>
              <Text style={styles.identityCaption}>UniCompanion administrator</Text>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <View style={styles.heroFooterIcon}>
              <Feather name="lock" size={13} color="#4338ca" />
            </View>
            <Text style={styles.heroFooterText}>
              Administrative account
            </Text>
          </View>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Feather name="user" size={15} color="#4338ca" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
              <Text style={styles.sectionSubtitle}>
                Information linked to your account
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, styles.emailIcon]}>
              <Feather name="mail" size={16} color="#2563eb" />
            </View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.detailValue} selectable numberOfLines={2}>
                {sessionUser.email || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, styles.idIcon]}>
              <Feather name="hash" size={16} color="#0d9488" />
            </View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>ACCOUNT ID</Text>
              <Text style={styles.detailValue} selectable numberOfLines={1}>
                {sessionUser.id}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contactCards}>
          <View style={[styles.contactCard, styles.bloodCard]}>
            <View style={styles.contactHeader}>
              <View style={styles.bloodIcon}>
                <Ionicons
                  name="water"
                  size={15}
                  color={SECTION_THEMES.BLOOD.primaryText}
                />
              </View>
              <Text style={[styles.contactLabel, styles.bloodText]}>
                BLOOD GROUP
              </Text>
            </View>
            <Text
              style={[styles.contactValue, styles.bloodText]}
              numberOfLines={1}
            >
              {displayBloodGroup}
            </Text>
          </View>

          <View style={[styles.contactCard, styles.phoneCard]}>
            <View style={styles.contactHeader}>
              <View style={styles.phoneIcon}>
                <Feather
                  name="phone"
                  size={14}
                  color={SECTION_THEMES.PHONE.primaryText}
                />
              </View>
              <Text style={[styles.contactLabel, styles.phoneText]}>
                PHONE NUMBER
              </Text>
            </View>
            <Text style={styles.contactValue} selectable numberOfLines={1}>
              {displayPhone}
            </Text>
          </View>
        </View>

        <View style={styles.accessCard}>
          <View style={styles.accessIcon}>
            <Feather name="key" size={17} color="#047857" />
          </View>
          <View style={styles.accessCopy}>
            <Text style={styles.accessTitle}>Administrator access</Text>
            <Text style={styles.accessDescription}>
              This account has access to administrative features in the app.
            </Text>
          </View>
          <Feather name="check-circle" size={18} color="#10b981" />
        </View>

        <View style={styles.logoutCard}>
          <View style={styles.logoutCopy}>
            <Text style={styles.logoutTitle}>Sign out</Text>
            <Text style={styles.logoutSubtitle}>
              End your current session on this device.
            </Text>
          </View>
          <ProfileLogoutButton />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: SPACING.xl,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  headingCopy: {
    flex: 1,
    marginRight: SPACING.md,
  },
  pageTitle: {
    fontFamily,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
    color: PROFILE_COLORS.deepNavy,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: PROFILE_COLORS.deepNavy,
    borderRadius: 26,
    padding: SPACING.lg,
    marginBottom: SPACING.cardGap,
    ...PROFILE_COLORS.heroShadow,
  },
  heroWatermark: {
    position: "absolute",
    right: -24,
    top: -34,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  avatarFrame: {
    position: "relative",
    width: 76,
    height: 76,
    padding: 3,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginRight: 14,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e0e7ff",
  },
  avatarFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e7ff",
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.35,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0e7ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 7,
  },
  roleText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#3730a3",
    letterSpacing: 0.6,
  },
  identityCaption: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#cbd5e1",
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
  },
  heroFooterIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e7ff",
  },
  heroFooterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  accountCard: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  contactCards: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.cardGap,
  },
  contactCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 112,
    justifyContent: "space-between",
    padding: SPACING.md,
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    ...PROFILE_COLORS.shadow,
  },
  bloodCard: {
    borderColor: "#fecdd3",
    backgroundColor: "#fffafb",
  },
  phoneCard: {
    borderColor: "#fde68a",
    backgroundColor: "#fffdf7",
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bloodIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: SECTION_THEMES.BLOOD.badgeBg,
  },
  phoneIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: SECTION_THEMES.PHONE.badgeBg,
  },
  contactLabel: {
    flex: 1,
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  bloodText: {
    color: SECTION_THEMES.BLOOD.primaryText,
  },
  phoneText: {
    color: SECTION_THEMES.PHONE.primaryText,
  },
  contactValue: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: PROFILE_COLORS.deepNavy,
  },
  sectionSubtitle: {
    fontFamily,
    fontSize: 10,
    color: PROFILE_COLORS.subtleText,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minHeight: 50,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emailIcon: {
    backgroundColor: "#eff6ff",
  },
  idIcon: {
    backgroundColor: "#f0fdfa",
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: PROFILE_COLORS.mutedText,
    letterSpacing: 0.7,
    marginBottom: 3,
  },
  detailValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 47,
  },
  accessCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#ecfdf5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c5f3df",
    padding: SPACING.md,
    marginBottom: SPACING.cardGap,
  },
  accessIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d1fae5",
  },
  accessCopy: {
    flex: 1,
  },
  accessTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 3,
  },
  accessDescription: {
    fontFamily,
    fontSize: 10,
    lineHeight: 15,
    color: "#047857",
  },
  logoutCard: {
    alignItems: "stretch",
    gap: SPACING.sm,
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginBottom: SPACING.md,
  },
  logoutCopy: {
    flex: 1,
  },
  logoutTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    marginBottom: 3,
  },
  logoutSubtitle: {
    fontFamily,
    fontSize: 10,
    lineHeight: 15,
    color: PROFILE_COLORS.subtleText,
  },
});
