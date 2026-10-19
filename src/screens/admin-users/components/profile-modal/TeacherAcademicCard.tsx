import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

import { TeacherProfile } from "../../types";
import { getFullDepartmentDisplayName, parseOrdinalParts } from "../../utils";

interface TeacherAcademicCardProps {
  profile?: TeacherProfile | null;
}

export const TeacherAcademicCard = React.memo(
  ({ profile }: TeacherAcademicCardProps) => {
    const advisoryParts = React.useMemo(() => {
      if (
        profile?.advisoryBatch === undefined ||
        profile?.advisoryBatch === null ||
        profile?.advisoryBatch === ""
      ) {
        return null;
      }
      const cleanVal = String(profile.advisoryBatch).replace(/batch/i, "").trim();
      if (!cleanVal) return null;
      return parseOrdinalParts(cleanVal);
    }, [profile?.advisoryBatch]);

    return (
      <View style={styles.cardContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <FontAwesome5 name="briefcase" size={13} color="#D97706" />
            </View>
            <Text style={styles.headerTitle}>ACADEMIC POSITION</Text>
          </View>
        </View>

        {/* Teacher ID */}
        <View style={styles.dataRow}>
          <View style={styles.rowLeft}>
            <FontAwesome5
              name="id-badge"
              size={14}
              color="#D97706"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Teacher ID</Text>
          </View>
          <Text style={styles.rowValueBold}>{profile?.teacherId || "N/A"}</Text>
        </View>

        {/* Designation */}
        <View style={styles.dataRow}>
          <View style={styles.rowLeft}>
            <FontAwesome5
              name="user-tie"
              size={13}
              color="#D97706"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Designation</Text>
          </View>
          <Text style={styles.rowValue} numberOfLines={1}>
            {profile?.designation || "Faculty"}
          </Text>
        </View>

        {/* Leadership Role */}
        <View style={styles.dataRow}>
          <View style={styles.rowLeft}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color="#D97706"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Leadership Role</Text>
          </View>
          {profile?.administrativeRole ? (
            <View style={styles.leadershipPill}>
              <Text style={styles.leadershipPillText}>
                {profile.administrativeRole}
              </Text>
            </View>
          ) : (
            <Text style={styles.rowValue}>None</Text>
          )}
        </View>

        {/* Faculty */}
        <View style={styles.dataRow}>
          <View style={styles.rowLeft}>
            <FontAwesome5
              name="university"
              size={13}
              color="#D97706"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Faculty</Text>
          </View>
          <Text style={styles.rowValueRight} numberOfLines={2}>
            {profile?.faculty || "Science & Information Technology"}
          </Text>
        </View>

        {/* Department */}
        <View style={styles.dataRow}>
          <View style={styles.rowLeft}>
            <Feather
              name="layers"
              size={14}
              color="#D97706"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Department</Text>
          </View>
          <Text style={styles.rowValueRight} numberOfLines={2}>
            {getFullDepartmentDisplayName(profile?.department)}
          </Text>
        </View>

        {/* Advisory Batch */}
        <View style={[styles.dataRow, styles.lastDataRow]}>
          <View style={styles.rowLeft}>
            <Feather
              name="users"
              size={14}
              color="#D97706"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Advisory Batch</Text>
          </View>
          {advisoryParts ? (
            <View style={styles.ordinalContainer}>
              <Text style={styles.rowValueBold}>{advisoryParts.numberPart}</Text>
              {Boolean(advisoryParts.suffix) && (
                <Text style={styles.ordinalSuperscript}>
                  {advisoryParts.suffix}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.rowValue}>None</Text>
          )}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FEFCE8",
    borderWidth: 1.2,
    borderColor: "#FEF08A",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#854D0E",
    letterSpacing: 0.8,
  },
  ordinalContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  ordinalSuperscript: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 14,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(254, 240, 138, 0.5)",
  },
  lastDataRow: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    width: 20,
    marginRight: 8,
  },
  rowLabel: {
    fontSize: 13,
    color: "#78350F",
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  rowValueBold: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  rowValueRight: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  leadershipPill: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 8,
  },
  leadershipPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
    letterSpacing: 0.3,
  },
});
