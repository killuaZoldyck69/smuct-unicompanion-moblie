import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { getDepartmentShortName } from "@/data/programs";

import { THEME, AVATAR_PASTELS } from "../constants";
import { TabType, AdminUser } from "../types";

export interface UserCardProps {
  item: AdminUser;
  index: number;
  activeTab: TabType;
  onPress: (user: AdminUser) => void;
}

export const UserCard = React.memo(
  ({ item, index, activeTab, onPress }: UserCardProps) => {
    const isStudent = activeTab === "STUDENT";
    const identifier = isStudent
      ? item.studentProfile?.studentId
      : item.teacherProfile?.teacherId;
    const department = isStudent
      ? item.studentProfile?.department
      : item.teacherProfile?.department;
    const isCR = item.studentProfile?.isCR;
    const pastel = AVATAR_PASTELS[index % AVATAR_PASTELS.length];
    const [imageError, setImageError] = React.useState(false);
    const hasValidImage = Boolean(item.image && !imageError);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => onPress(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`User: ${item.name}, ${department || "No Dept"}`}
      >
        {/* Pastel Avatar Container */}
        <View
          style={[
            styles.avatarBox,
            { backgroundColor: pastel.bg, borderColor: pastel.border },
          ]}
        >
          {hasValidImage ? (
            <View style={styles.avatarImageWrapper}>
              <Image
                source={{ uri: item.image! }}
                style={styles.avatarImage}
                onError={() => setImageError(true)}
                accessible={true}
                accessibilityLabel={`${item.name}'s profile photo`}
              />
            </View>
          ) : (
            <View style={styles.avatarFallbackCircle}>
              <Text style={styles.avatarFallbackLetter}>
                {item.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>

        {/* User Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isRestricted && (
              <View style={styles.badgeRestricted}>
                <Text style={styles.badgeTextRestricted}>RESTRICTED</Text>
              </View>
            )}
            {isCR && (
              <View style={styles.badgeCR}>
                <Text style={styles.badgeTextCR}>CR</Text>
              </View>
            )}
            {Boolean(item.teacherProfile?.administrativeRole) && (
              <View style={styles.badgeAdminRole}>
                <Text style={styles.badgeTextAdminRole}>
                  {item.teacherProfile?.administrativeRole}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.userInfo} numberOfLines={1}>
            {identifier || "No ID"} • {getDepartmentShortName(department)}
          </Text>
        </View>

        {/* Right Arrow */}
        <Feather name="chevron-right" size={18} color={THEME.textMuted} />
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.cardBg,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImageWrapper: {
    width: "100%",
    height: "100%",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  avatarFallbackCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarFallbackLetter: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textPrimary,
    flexShrink: 1,
  },
  badgeCR: {
    backgroundColor: THEME.crBadgeBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeTextCR: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.crBadgeText,
  },
  badgeRestricted: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  badgeTextRestricted: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#E11D48",
    letterSpacing: 0.4,
  },
  badgeAdminRole: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  badgeTextAdminRole: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#92400E",
    letterSpacing: 0.4,
  },
  userInfo: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
});
