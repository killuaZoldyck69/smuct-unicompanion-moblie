import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { NotificationBell } from "@/components/ui/notification-bell";
import { FONT_FAMILIES } from "@/theme/typography";
import { colors } from "@/theme/colors";

interface AdminHeroHeaderProps {
  userName: string | null | undefined;
  userImage: string | null | undefined;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const getTodayLabel = () => {
  return new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();
};

export const AdminHeroHeader = React.memo(function AdminHeroHeader({
  userName,
  userImage,
}: AdminHeroHeaderProps) {
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [userImage]);

  const greeting = getGreeting();
  const todayLabel = getTodayLabel();
  const displayName = userName?.trim() || "System Administrator";

  // Format initials, defaulting to "SA" for System Administrator
  const initials = displayName
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Top Left: Date */}
      <Text style={styles.dateLabel} numberOfLines={1}>
        {todayLabel}
      </Text>

      {/* Main Row: Admin Avatar (left) — Greeting & Name (middle) — Cat Bell (far right) */}
      <View style={styles.mainRow}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.avatarWrap}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View admin profile"
        >
          {userImage && !avatarError ? (
            <Image
              source={{ uri: userImage }}
              style={styles.avatarImage}
              onError={() => setAvatarError(true)}
              accessible={true}
              accessibilityLabel={`${displayName}'s profile picture`}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initials || "SA"}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.textBlock}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {displayName}
          </Text>
        </View>

        <NotificationBell
          style={styles.bellBtn}
          iconColor={colors.slate800}
          iconSize={19}
          catSize={128}
          useCatAnimation
        />
      </View>

      {/* Bottom Left: Role Pill */}
      <View style={styles.rolePill}>
        <Text style={styles.roleLabel}>System Administrator</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bellBtn: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  dateLabel: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    color: colors.slate500,
    letterSpacing: 0.85,
    marginBottom: 8,
  },
  greeting: {
    fontFamily: FONT_FAMILIES.bodySemiBold,
    fontSize: 13,
    fontWeight: "600",
    color: colors.slate500,
    lineHeight: 18,
  },
  title: {
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 21,
    fontWeight: "800",
    color: colors.navyInk,
    letterSpacing: -0.35,
    lineHeight: 26,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.semantic.indigo.tint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    marginTop: 10,
  },
  roleLabel: {
    fontFamily: FONT_FAMILIES.bodyBold,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700",
    color: colors.semantic.indigo.deep,
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.avatarDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.navyInk,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarInitial: {
    fontFamily: FONT_FAMILIES.titleExtraBold,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.white,
  },
});
