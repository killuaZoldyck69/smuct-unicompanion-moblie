import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

interface AdminHeroHeaderProps {
  userName: string | null | undefined;
  userImage: string | null | undefined;
  onPressBell?: () => void;
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
  onPressBell,
}: AdminHeroHeaderProps) {
  const router = useRouter();
  const greeting = useMemo(() => getGreeting(), []);
  const todayLabel = useMemo(() => getTodayLabel(), []);

  // Format initials, default to "S" as in System Administrator
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "S";

  const handleBellPress = () => {
    if (onPressBell) {
      onPressBell();
    } else {
      router.push("/(tabs)/notices");
    }
  };

  return (
    <View style={styles.container}>
      {/* Left: Text Block */}
      <View style={styles.textBlock}>
        <Text style={styles.dateLabel}>{todayLabel}</Text>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.title}>System{"\n"}Administrator</Text>
        <View style={styles.rolePill}>
          <View style={styles.roleDot} />
          <Text style={styles.roleLabel}>System Administrator</Text>
        </View>
      </View>

      {/* Right: Actions Block (Bell + Avatar) */}
      <View style={styles.topRightActions}>
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={handleBellPress}
          style={styles.bellBtn}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Feather name="bell" size={19} color="#1E293B" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>

        {/* Avatar -> Profile */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.avatarWrap}
          activeOpacity={0.75}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View admin profile"
        >
          {userImage ? (
            <Image
              source={{ uri: userImage }}
              style={styles.avatarImage}
              accessible={true}
              accessibilityLabel={`${userName ?? "Admin"}'s profile picture`}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
          )}
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8E9BAE",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 2,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
    lineHeight: 33,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    marginTop: 12,
    gap: 7,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4F46E5",
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4338CA",
    letterSpacing: 0.2,
  },
  topRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0D131F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  onlineBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#10B981",
  },
});
