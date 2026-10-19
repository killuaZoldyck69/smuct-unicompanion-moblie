import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

export interface TeacherProfileHeroCardProps {
  name: string;
  email: string;
  image?: string | null;
  designation?: string | null;
  administrativeRole?: string | null;
  isRestricted?: boolean;
}

export const TeacherProfileHeroCard = React.memo(
  ({
    name,
    email,
    image,
    designation,
    administrativeRole,
    isRestricted,
  }: TeacherProfileHeroCardProps) => {
    const displayDesignation = designation || "Faculty Member";

    return (
      <View style={styles.detailProfileHeroCard}>
        {/* Avatar Container */}
        <View style={styles.detailAvatarWrapper}>
          <View style={styles.detailAvatarContainer}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.detailAvatarImg}
                resizeMode="cover"
                accessible={true}
                accessibilityLabel={`${name}'s photo`}
              />
            ) : (
              <View style={styles.teacherAvatarFallback}>
                <FontAwesome5 name="graduation-cap" size={32} color="#B45309" />
              </View>
            )}
          </View>
        </View>

        <Text style={styles.detailUserName}>{name}</Text>
        <Text style={styles.detailUserEmail}>{email}</Text>

        {/* Badges Row */}
        <View style={styles.detailHeroBadgesRow}>
          {isRestricted && (
            <View style={styles.detailRestrictedPill}>
              <Text style={styles.detailRestrictedPillText}>RESTRICTED</Text>
            </View>
          )}

          {/* Designation Purple Pill */}
          <View style={styles.detailDesignationPill}>
            <FontAwesome5
              name="graduation-cap"
              size={11}
              color="#7C3AED"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.detailDesignationPillText}>
              {displayDesignation}
            </Text>
          </View>

          {/* Leadership Role Pill (e.g. HOD, Dean, Coordinator) */}
          {Boolean(administrativeRole) && (
            <View style={styles.detailAdminRolePill}>
              <Ionicons
                name="shield"
                size={12}
                color="#B45309"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.detailAdminRolePillText}>
                {administrativeRole}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  },
);

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
  teacherAvatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  detailUserName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  detailUserEmail: {
    fontSize: 14,
    color: "#64748B",
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
