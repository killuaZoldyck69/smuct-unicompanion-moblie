import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded } from "../../../theme/layout";

interface Props {
  item: any;
  onPress: (item: any) => void;
}

const MemberRow = ({ item, onPress }: Props) => {
  // Extract ID based on the user's role profile
  const idDisplay =
    item.role === "TEACHER"
      ? item.user?.teacherProfile?.teacherId
      : item.user?.studentProfile?.studentId;

  return (
    <TouchableOpacity
      style={styles.memberRow}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      <View style={styles.userInfoRow}>
        {item.user?.image ? (
          <Image source={{ uri: item.user.image }} style={styles.avatarImage} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              item.role === "TEACHER" && {
                backgroundColor: colors.primaryContainer,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                item.role === "TEACHER" && { color: colors.onPrimary },
              ]}
            >
              {item.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.memberListName}>{item.user?.name}</Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {idDisplay ? `${idDisplay} • ` : ""}
            {item.user?.email}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.roleBadge,
          item.role === "TEACHER" && {
            backgroundColor: colors.primaryContainer + "20",
          },
        ]}
      >
        <Text
          style={[
            styles.roleText,
            item.role === "TEACHER" && { color: colors.primary },
          ]}
        >
          {item.role}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default memo(MemberRow);

const styles = StyleSheet.create({
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackMd,
    borderRadius: rounded.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.stackMd,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  avatarText: {
    ...typography.bodyLg,
    color: colors.secondary,
    fontWeight: "800",
  },
  textContainer: {
    flex: 1,
  },
  memberListName: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "800",
  },
  metaText: {
    ...typography.labelSm,
    color: colors.outline,
    fontSize: 11,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.md,
  },
  roleText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "800",
    fontSize: 10,
  },
});
