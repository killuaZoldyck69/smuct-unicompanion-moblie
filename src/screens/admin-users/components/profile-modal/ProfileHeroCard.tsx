import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { THEME } from "../../constants";
import { AdminUser } from "../../types";

interface ProfileHeroCardProps {
  user: AdminUser;
}

export const ProfileHeroCard = React.memo(({ user }: ProfileHeroCardProps) => {
  const isStudent = user.role === "STUDENT";
  const hasCR = Boolean(user.studentProfile?.isCR);

  return (
    <View style={styles.detailProfileHeroCard}>
      <View style={styles.detailAvatarWrapper}>
        <View style={styles.detailAvatarContainer}>
          {user.image ? (
            <Image
              source={{ uri: user.image }}
              style={styles.detailAvatarImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.detailAvatarFallback}>
              <Text style={styles.detailAvatarLetter}>
                {user.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.detailUserName}>{user.name}</Text>
      <Text style={styles.detailUserEmail}>{user.email}</Text>

      {/* Badges Row */}
      <View style={styles.detailHeroBadgesRow}>
        <View style={styles.detailRolePill}>
          <Text style={styles.detailRolePillText}>{user.role}</Text>
        </View>

        {isStudent && hasCR && (
          <View style={styles.detailCrPill}>
            <Ionicons
              name="ribbon"
              size={13}
              color="#854D0E"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.detailCrPillText}>CR</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  detailProfileHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailAvatarWrapper: {
    position: "relative",
  },
  detailAvatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailAvatarImg: {
    width: "100%",
    height: "100%",
  },
  detailAvatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  detailAvatarLetter: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  detailUserName: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.textPrimary,
    marginTop: 12,
    textAlign: "center",
  },
  detailUserEmail: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  detailHeroBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  detailRolePill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailRolePillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.6,
  },
  detailCrPill: {
    backgroundColor: "#FEF9C3",
    borderWidth: 1,
    borderColor: "#FDE047",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  detailCrPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#854D0E",
  },
});
