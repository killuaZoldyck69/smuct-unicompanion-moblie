import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";

const BENTO_COLORS = {
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 20,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface Props {
  item: any;
  onPress: (item: any) => void;
}

const MemberRow = ({ item, onPress }: Props) => {
  const isTeacher = item.role === "TEACHER";
  const isLeader = item.role === "CR" || item.role === "TA";

  const idDisplay = isTeacher
    ? item.user?.teacherProfile?.teacherId
    : item.user?.studentProfile?.studentId;

  return (
    <TouchableOpacity
      style={styles.memberRow}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Member: ${item.user?.name}, Role: ${item.role}`}
    >
      <View style={styles.userInfoRow}>
        {item.user?.image ? (
          <Image source={{ uri: item.user.image }} style={styles.avatarImage} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              isTeacher && { backgroundColor: BENTO_COLORS.deepNavy },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isTeacher && { color: "#ffffff" },
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
          isTeacher
            ? styles.roleTeacher
            : isLeader
              ? styles.roleLeader
              : styles.roleStudent,
        ]}
      >
        <Text
          style={[
            styles.roleText,
            isTeacher
              ? styles.roleTextTeacher
              : isLeader
                ? styles.roleTextLeader
                : styles.roleTextStudent,
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
    backgroundColor: BENTO_COLORS.white,
    padding: 16,
    borderRadius: BENTO_COLORS.cardRadius,
    marginBottom: 10,
    ...BENTO_COLORS.shadow,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: "#edf2f7",
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily,
    fontSize: 15,
    color: "#0369a1",
    fontWeight: "800",
  },
  textContainer: {
    flex: 1,
  },
  memberListName: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.deepNavy,
    fontWeight: "800",
  },
  metaText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "500",
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  roleTeacher: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  roleLeader: {
    backgroundColor: "#e0f2fe",
  },
  roleStudent: {
    backgroundColor: "#f1f5f9",
  },
  roleText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  roleTextTeacher: {
    color: "#ffffff",
  },
  roleTextLeader: {
    color: "#0369a1",
  },
  roleTextStudent: {
    color: BENTO_COLORS.subtleText,
  },
});
