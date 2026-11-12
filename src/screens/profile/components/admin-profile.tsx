import React, { useState } from "react";
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
import { colors } from "@/theme/colors";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  PROFILE_COLORS,
  BLOOD_GROUP_TO_UI,
  SECTION_THEMES,
  SPACING,
  fontFamily,
  titleFontFamily,
} from "../constants";
import { formatPhoneNumber } from "../utils";
import { ProfileLogoutButton } from "./shared/profile-logout-button";
import { ProfileOfflineBanner } from "./shared/profile-states";
import { ProfileAccountActions } from "./shared/profile-account-actions";
import { DeleteAccountModal } from "./shared/delete-account-modal";

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
      <Circle cx="84" cy="72" r="72" fill={colors.white} opacity={0.05} />
      <Path
        d="M75 26 119 42v31c0 27-18 43-44 55-26-12-44-28-44-55V42l44-16Z"
        fill="none"
        stroke={colors.white}
        strokeWidth="3"
        opacity={0.16}
      />
      <Path
        d="m58 74 12 12 24-27"
        fill="none"
        stroke={colors.white}
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
  const { isOffline } = useNetworkStatus();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
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
        <ProfileOfflineBanner visible={isOffline} />
        <View style={styles.pageHeader}>
          <View style={styles.headingCopy}>
            <Text style={styles.pageTitle}>My Profile</Text>
            <Text style={styles.pageSubtitle}>
              Your account identity and administrative access.
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Feather name="shield" size={19} color={colors.semantic.indigo.deep} />
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
                  <Feather name="user" size={29} color={colors.semantic.indigo.deep} />
                </View>
              )}
            </View>

            <View style={styles.identityCopy}>
              <Text style={styles.nameText} numberOfLines={2}>
                {displayName}
              </Text>
              <View style={styles.roleBadge}>
                <Feather name="shield" size={11} color={colors.semantic.indigo.deep} />
                <Text style={styles.roleText}>SYSTEM ADMIN</Text>
              </View>
              <Text style={styles.identityCaption}>UniCompanion administrator</Text>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <View style={styles.heroFooterIcon}>
              <Feather name="lock" size={13} color={colors.semantic.indigo.deep} />
            </View>
            <Text style={styles.heroFooterText}>
              Administrative account
            </Text>
          </View>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Feather name="user" size={15} color={colors.semantic.indigo.deep} />
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
              <Feather name="mail" size={16} color={colors.semantic.blue.accent} />
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
              <Feather name="hash" size={16} color={colors.semantic.teal.solid} />
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
            <Feather name="key" size={17} color={colors.semantic.emerald.darker} />
          </View>
          <View style={styles.accessCopy}>
            <Text style={styles.accessTitle}>Administrator access</Text>
            <Text style={styles.accessDescription}>
              This account has access to administrative features in the app.
            </Text>
          </View>
          <Feather name="check-circle" size={18} color={colors.semantic.emerald.solid} />
        </View>

        <ProfileAccountActions
          onPressDeleteAccount={() => setDeleteModalVisible(true)}
          isOffline={isOffline}
        />

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

      <DeleteAccountModal
        visible={deleteModalVisible}
        isOffline={isOffline}
        onClose={() => setDeleteModalVisible(false)}
      />
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
    fontFamily: titleFontFamily,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: PROFILE_COLORS.deepNavy,
    lineHeight: 30,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: -0.1,
    marginTop: 4,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.indigo.tint,
    borderWidth: 1,
    borderColor: colors.semantic.indigo.border,
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
    backgroundColor: colors.whiteAlpha18,
    marginRight: 14,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.semantic.indigo.border,
  },
  avatarFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.indigo.border,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.35,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.semantic.indigo.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 7,
  },
  roleText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: colors.semantic.indigo.darker,
    letterSpacing: 0.6,
  },
  identityCaption: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: colors.slate300,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.whiteAlpha12,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
  },
  heroFooterIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.indigo.border,
  },
  heroFooterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: colors.slate200,
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
    borderColor: colors.semantic.rose.border,
    backgroundColor: colors.semantic.rose.warmSurface,
  },
  phoneCard: {
    borderColor: colors.semantic.amber.border,
    backgroundColor: colors.semantic.amber.paleSurface,
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
    backgroundColor: colors.semantic.indigo.tint,
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
    backgroundColor: colors.semantic.blue.tint,
  },
  idIcon: {
    backgroundColor: colors.semantic.teal.tint,
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
    backgroundColor: colors.slate100,
    marginLeft: 47,
  },
  accessCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: colors.semantic.emerald.tint,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.mintBorderSoft,
    padding: SPACING.md,
    marginBottom: SPACING.cardGap,
  },
  accessIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.emerald.border,
  },
  accessCopy: {
    flex: 1,
  },
  accessTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: colors.semantic.emerald.darkText,
    marginBottom: 3,
  },
  accessDescription: {
    fontFamily,
    fontSize: 10,
    lineHeight: 15,
    color: colors.semantic.emerald.darker,
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
