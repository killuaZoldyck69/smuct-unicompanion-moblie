import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { useNetworkStatus } from "@/hooks/use-network-status";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../constants";
import { ProfileRoleHeader } from "./shared/profile-role-header";
import { ProfileContactCards } from "./shared/profile-contact-cards";
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

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <ProfileRoleHeader
        insetsTop={insets.top}
        maxWidth={520}
        subtitle="Your account identity and administrative access."
        rightAccessory={
          <View style={styles.headerIcon}>
            <Feather
              name="shield"
              size={18}
              color={colors.semantic.indigo.deep}
            />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom + 120, 132),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileOfflineBanner visible={isOffline} />

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
                  <Feather
                    name="user"
                    size={29}
                    color={colors.semantic.indigo.deep}
                  />
                </View>
              )}
            </View>

            <View style={styles.identityCopy}>
              <Text style={styles.nameText} numberOfLines={2}>
                {displayName}
              </Text>
              <View style={styles.roleBadge}>
                <Feather
                  name="shield"
                  size={12}
                  color={colors.semantic.indigo.deep}
                />
                <Text style={styles.roleText}>SYSTEM ADMIN</Text>
              </View>
              <Text style={styles.identityCaption}>
                UniCompanion administrator
              </Text>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <View style={styles.heroFooterIcon}>
              <Feather
                name="lock"
                size={13}
                color={colors.semantic.indigo.deep}
              />
            </View>
            <Text style={styles.heroFooterText}>Administrative account</Text>
          </View>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Feather
                name="user"
                size={15}
                color={SECTION_THEMES.SOCIAL.primaryText}
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, styles.emailIcon]}>
              <Feather
                name="mail"
                size={16}
                color={colors.semantic.blue.accent}
              />
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
              <Feather
                name="hash"
                size={16}
                color={colors.semantic.teal.solid}
              />
            </View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>ACCOUNT ID</Text>
              <Text style={styles.detailValue} selectable numberOfLines={1}>
                {sessionUser.id}
              </Text>
            </View>
          </View>
        </View>

        <ProfileContactCards
          phoneNumber={sessionUser.phoneNumber || ""}
          bloodGroup={sessionUser.bloodGroup || ""}
          dbBloodGroup={sessionUser.bloodGroup}
          profilePhone={sessionUser.phoneNumber}
          emptyBloodLabel="Not set"
          emptyPhoneLabel="Not set"
        />

        <View style={styles.accessCard}>
          <View style={styles.accessIcon}>
            <Feather
              name="key"
              size={17}
              color={colors.semantic.emerald.darker}
            />
          </View>
          <View style={styles.accessCopy}>
            <Text style={styles.accessTitle}>Administrator access</Text>
            <Text style={styles.accessDescription}>
              This account has access to administrative features in the app.
            </Text>
          </View>
          <Feather
            name="check-circle"
            size={18}
            color={colors.semantic.emerald.solid}
          />
        </View>

        <ProfileAccountActions
          onPressDeleteAccount={() => setDeleteModalVisible(true)}
          isOffline={isOffline}
        />

        <ProfileLogoutButton />
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
    paddingTop: SPACING.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: PROFILE_COLORS.cardRadius,
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
    width: 80,
    height: 80,
    padding: 3,
    borderRadius: 40,
    backgroundColor: colors.whiteAlpha18,
    marginRight: 16,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.semantic.indigo.border,
  },
  avatarFallback: {
    width: 74,
    height: 74,
    borderRadius: 37,
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
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.4,
    lineHeight: 26,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.semantic.indigo.border,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 7,
  },
  roleText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: colors.semantic.indigo.darker,
    letterSpacing: 0.4,
  },
  identityCaption: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: colors.slate300,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.whiteAlpha12,
    marginTop: SPACING.md,
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
    fontSize: 12,
    fontWeight: "600",
    color: colors.slate200,
  },
  accountCard: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.indigo.tint,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: SECTION_THEMES.SOCIAL.primaryText,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontSize: 10,
    fontWeight: "700",
    color: PROFILE_COLORS.mutedText,
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.dividerSubtle,
    marginLeft: 48,
    marginVertical: 2,
  },
  accessCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.semantic.emerald.tint,
    borderRadius: PROFILE_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.mintBorderSoft,
    padding: SPACING.lg,
    marginBottom: SPACING.cardGap,
  },
  accessIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.semantic.emerald.border,
  },
  accessCopy: {
    flex: 1,
    minWidth: 0,
  },
  accessTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: colors.semantic.emerald.darkText,
    marginBottom: 2,
  },
  accessDescription: {
    fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.semantic.emerald.darker,
  },
});
