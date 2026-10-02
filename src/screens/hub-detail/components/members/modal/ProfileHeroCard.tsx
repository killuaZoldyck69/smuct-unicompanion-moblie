import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { CourseHubMember } from "@/types/member.types";
import { BENTO, fontFamily, ROLE_CONFIG } from "../constants";

interface ProfileHeroCardProps {
  member: CourseHubMember;
  isSelf: boolean;
}

export const ProfileHeroCard = React.memo(function ProfileHeroCard({
  member,
  isSelf,
}: ProfileHeroCardProps) {
  const roleMeta = ROLE_CONFIG[member.role] || ROLE_CONFIG.STUDENT;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          {member.user?.image ? (
            <Image source={{ uri: member.user.image }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: roleMeta.bg }]}>
              <Text style={[styles.avatarText, { color: roleMeta.color }]}>
                {member.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.textCol}>
          <Text style={styles.name} numberOfLines={1}>
            {member.user?.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {member.user?.email}
          </Text>
          {isSelf && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>Your Account</Text>
            </View>
          )}
        </View>

        {member.role !== "STUDENT" && (
          <View style={[styles.rolePill, { backgroundColor: roleMeta.bg }]}>
            <Text style={[styles.rolePillText, { color: roleMeta.color }]}>
              {roleMeta.badgeLabel}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO.canvas,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    padding: 14,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#e0f2fe",
    padding: 1.5,
    marginRight: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "700",
  },
  textCol: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  email: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO.slate,
    marginTop: 2,
  },
  youBadge: {
    alignSelf: "flex-start",
    backgroundColor: BENTO.blueSoft,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginTop: 3,
  },
  youBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "700",
    color: BENTO.blueText,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  rolePillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
  },
});
