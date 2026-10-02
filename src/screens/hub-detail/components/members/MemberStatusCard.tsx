import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./constants";

interface MemberStatusCardProps {
  total: number;
  teachers: number;
  students: number;
}

export const MemberStatusCard = React.memo(function MemberStatusCard({
  total,
  teachers,
  students,
}: MemberStatusCardProps) {
  if (total === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Feather name="users" size={17} color={BENTO.blueText} />
        </View>
        <View>
          <Text style={styles.label}>COURSE MEMBERS</Text>
          <Text style={styles.countNumber}>
            {total} <Text style={styles.countUnit}>{total === 1 ? "Member" : "Members"}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.badgeTeacher}>
          <Text style={styles.badgeTextTeacher}>
            {teachers} {teachers === 1 ? "Teacher" : "Teachers"}
          </Text>
        </View>
        <View style={styles.badgeStudent}>
          <Text style={styles.badgeTextStudent}>
            {students} {students === 1 ? "Student" : "Students"}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BENTO.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.07)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    marginTop: 6,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: BENTO.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  label: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  countNumber: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
    marginTop: 1,
  },
  countUnit: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeTeacher: {
    backgroundColor: BENTO.blueSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.blueBorder,
  },
  badgeTextTeacher: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.blueText,
  },
  badgeStudent: {
    backgroundColor: BENTO.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  badgeTextStudent: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
});
