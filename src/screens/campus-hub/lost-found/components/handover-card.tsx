import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { colors } from "@/theme/colors";

import type { LostFoundAuthor } from "@/services/lost-found-service";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
  formatCampusUserSubtitle,
} from "../../shared/design-tokens";

interface HandoverCardProps {
  counterpart: LostFoundAuthor;
  role: "AUTHOR" | "CLAIMANT";
  onViewProfile?: () => void;
}

export const HandoverCard = React.memo(function HandoverCard({
  counterpart,
  role,
  onViewProfile,
}: HandoverCardProps) {
  const isAuthor = role === "AUTHOR";
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [counterpart?.image]);

  const counterpartRoleLabel = isAuthor
    ? "Verified Owner"
    : "Finder / Post Author";
  const counterpartSubtitle = formatCampusUserSubtitle(
    counterpart,
    "SMUCT Community Member",
  );

  const handleEmail = () => {
    if (!counterpart.email) return;
    Linking.openURL(`mailto:${counterpart.email}`).catch(() =>
      Toast.show({ type: "error", text1: "Could not open mail app." }),
    );
  };

  const handleCall = () => {
    if (!counterpart.phoneNumber) return;
    const sanitizedPhone = counterpart.phoneNumber.replace(/\s+/g, "");
    Linking.openURL(`tel:${sanitizedPhone}`).catch(() =>
      Toast.show({ type: "error", text1: "Could not initiate call." }),
    );
  };

  return (
    <View style={styles.card}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Feather
            name="shield"
            size={18}
            color={colors.semantic.emerald.darker}
          />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Item Handover Ready</Text>
          <Text style={styles.headerSubtitle}>
            {isAuthor
              ? "You accepted this claim. Reach out to coordinate handover on campus."
              : "Your claim was accepted! Contact the finder to collect your item."}
          </Text>
        </View>
      </View>

      {/* Counterpart Contact Card */}
      <View style={styles.contactBox}>
        <View style={styles.personRow}>
          <Pressable
            style={({ pressed }) => [
              styles.personLeft,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onViewProfile}
            android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`View profile for ${counterpart.name}, ${counterpartRoleLabel}`}
          >
            {counterpart?.image && !avatarError ? (
              <Image
                source={{ uri: counterpart.image }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="memory-disk"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {counterpart?.name
                    ? counterpart.name.charAt(0).toUpperCase()
                    : "?"}
                </Text>
              </View>
            )}
            <View style={styles.nameCol}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText} maxFontSizeMultiplier={1.25}>
                  {counterpartRoleLabel}
                </Text>
              </View>
              <Text style={styles.personName} numberOfLines={1}>
                {counterpart.name}
              </Text>
              <Text style={styles.personSub} numberOfLines={1}>
                {counterpartSubtitle}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Contact Actions */}
        <View style={styles.contactActions}>
          {!!counterpart.email && (
            <Pressable
              style={({ pressed }) => [
                styles.contactBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleEmail}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Email ${counterpart.name} at ${counterpart.email}`}
            >
              <Feather
                name="mail"
                size={14}
                color={CAMPUS_HUB_COLORS.skyAccentInk}
              />
              <Text
                style={styles.contactBtnText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {counterpart.email}
              </Text>
            </Pressable>
          )}

          {!!counterpart.phoneNumber && (
            <Pressable
              style={({ pressed }) => [
                styles.contactBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleCall}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Call ${counterpart.name} at ${counterpart.phoneNumber}`}
            >
              <Feather
                name="phone"
                size={14}
                color={CAMPUS_HUB_COLORS.emeraldFill}
              />
              <Text style={styles.contactBtnText} numberOfLines={1}>
                {counterpart.phoneNumber}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Safety Protocol Reminder */}
      <View style={styles.safetyBox}>
        <View style={styles.safetyHeader}>
          <Feather
            name="alert-triangle"
            size={13}
            color={CAMPUS_HUB_COLORS.lostFoundAccentText}
          />
          <Text style={styles.safetyTitle}>SAFE CAMPUS HANDOVER TIPS</Text>
        </View>
        <Text style={styles.safetyItem}>
          • Meet in open campus areas (e.g. SMUCT Central Library or Dept
          Office).
        </Text>
        <Text style={styles.safetyItem}>
          • Inspect the item in person before completing the exchange.
        </Text>
        <Text style={styles.safetyItem}>
          • Never share banking credentials, cards, or verification OTPs.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.semantic.emerald.tint,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.mintBorder,
    ...CAMPUS_HUB_COLORS.shadow,
    gap: 14,
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.semantic.emerald.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: colors.semantic.emerald.darker,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.emeraldFill,
    marginTop: 2,
    lineHeight: 17,
  },
  contactBox: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.semantic.emerald.border,
    gap: 12,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  personLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    overflow: "hidden",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.slate200,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.slate200,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  nameCol: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: colors.semantic.emerald.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: colors.semantic.emerald.darker,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  personName: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  personSub: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  contactActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    paddingTop: 10,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.slate50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
    maxWidth: "100%",
    overflow: "hidden",
  },
  contactBtnText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    flexShrink: 1,
    includeFontPadding: false,
  },
  safetyBox: {
    backgroundColor: colors.semantic.amber.tint,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    gap: 4,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  safetyTitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.5,
  },
  safetyItem: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.lostFoundAccentInk,
    lineHeight: 16,
  },
});
