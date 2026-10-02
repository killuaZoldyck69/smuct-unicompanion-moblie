import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CourseHubMember } from "@/types/member.types";
import { BENTO, fontFamily, getMemberSubtext } from "./constants";

interface MemberRowItemProps {
  member: CourseHubMember;
  onPress: (member: CourseHubMember) => void;
}

export const MemberRowItem = React.memo(function MemberRowItem({
  member,
  onPress,
}: MemberRowItemProps) {
  const isTeacher = member.role === "TEACHER";
  const isCR = member.role === "CR";
  const isTA = member.role === "TA";
  const subtext = getMemberSubtext(member);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => onPress(member)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${member.user?.name || "Member"}, ${member.role}`}
    >
      <View style={styles.avatarWrapper}>
        {member.user?.image ? (
          <Image source={{ uri: member.user.image }} style={styles.avatarImage} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              isTeacher && styles.avatarTeacher,
              (isCR || isTA) && styles.avatarLeadership,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isTeacher && styles.avatarTextTeacher,
                (isCR || isTA) && styles.avatarTextLeadership,
              ]}
            >
              {member.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infoCol}>
        <Text style={styles.name} numberOfLines={1}>
          {member.user?.name}
        </Text>
        <Text style={styles.subtext} numberOfLines={1}>
          {subtext}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {isTeacher && (
          <View style={[styles.pill, styles.pillTeacher]}>
            <Text style={[styles.pillText, styles.pillTextTeacher]}>Teacher</Text>
          </View>
        )}
        {isCR && (
          <View style={[styles.pill, styles.pillCR]}>
            <Text style={[styles.pillText, styles.pillTextCR]}>CR</Text>
          </View>
        )}
        {isTA && (
          <View style={[styles.pill, styles.pillTA]}>
            <Text style={[styles.pillText, styles.pillTextTA]}>TA</Text>
          </View>
        )}
        <Feather name="chevron-right" size={17} color="#cbd5e1" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#e0f2fe",
    padding: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTeacher: {
    backgroundColor: BENTO.navy,
  },
  avatarLeadership: {
    backgroundColor: BENTO.blueSoft,
  },
  avatarText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: "#0369a1",
  },
  avatarTextTeacher: {
    color: "#ffffff",
  },
  avatarTextLeadership: {
    color: BENTO.blueText,
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
    justifyContent: "center",
  },
  name: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: BENTO.navy,
    letterSpacing: -0.1,
    marginBottom: 3,
  },
  subtext: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
    backgroundColor: "#f0f4f9",
  },
  pillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  pillTeacher: {
    backgroundColor: BENTO.blueSoft,
  },
  pillTextTeacher: {
    color: "#2563eb",
  },
  pillCR: {
    backgroundColor: BENTO.blueSoft,
  },
  pillTextCR: {
    color: "#0284c7",
    fontWeight: "700",
  },
  pillTA: {
    backgroundColor: BENTO.purpleSoft,
  },
  pillTextTA: {
    color: BENTO.purpleText,
    fontWeight: "700",
  },
  chevron: {
    marginLeft: 2,
  },
});
