import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import { THEME } from "../../constants";
import { AdminUser } from "../../types";

interface ProfileHeroCardProps {
  user: AdminUser;
}

export const ProfileHeroCard = React.memo(({ user }: ProfileHeroCardProps) => {
  const isStudent = user.role === "STUDENT";
  const isTeacher = user.role === "TEACHER";
  const hasCR = Boolean(user.studentProfile?.isCR);
  const teacherDesignation = user.teacherProfile?.designation || "Associate Professor";

  return (
    <View style={styles.detailProfileHeroCard}>
      {/* Avatar Container */}
      <View style={styles.detailAvatarWrapper}>
        <View style={styles.detailAvatarContainer}>
          {user.image ? (
            <Image
              source={{ uri: user.image }}
              style={styles.detailAvatarImg}
              resizeMode="cover"
            />
          ) : isTeacher ? (
            <View style={styles.teacherAvatarFallback}>
              <FontAwesome5 name="graduation-cap" size={32} color="#B45309" />
            </View>
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
        {user.isRestricted && (
          <View style={styles.detailRestrictedPill}>
            <Text style={styles.detailRestrictedPillText}>RESTRICTED</Text>
          </View>
        )}
        {isTeacher ? (
          <>
            {/* Designation Purple Pill */}
            <View style={styles.detailDesignationPill}>
              <FontAwesome5
                name="graduation-cap"
                size={11}
                color="#7C3AED"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.detailDesignationPillText}>
                {teacherDesignation}
              </Text>
            </View>

            {/* Leadership Role Pill (e.g. HOD, Dean, Coordinator) */}
            {Boolean(user.teacherProfile?.administrativeRole) && (
              <View style={styles.detailAdminRolePill}>
                <Ionicons
                  name="shield"
                  size={12}
                  color="#B45309"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.detailAdminRolePillText}>
                  {user.teacherProfile?.administrativeRole}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
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
          </>
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
  teacherAvatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  detailDesignationPill: {
    backgroundColor: "#EDE9FE",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  detailDesignationPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7C3AED",
  },
  detailRestrictedPill: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  detailRestrictedPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#E11D48",
    letterSpacing: 0.6,
  },
  detailAdminRolePill: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  detailAdminRolePillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.4,
  },
});
