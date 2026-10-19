import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

import { StudentProfile } from "../../types";
import {
  parseOrdinalParts,
  getProgramName,
  getFullDepartmentDisplayName,
} from "../../utils";

interface StudentAcademicCardProps {
  profile?: StudentProfile | null;
}

export const StudentAcademicCard = React.memo(
  ({ profile }: StudentAcademicCardProps) => {
    const batchOrdinal = parseOrdinalParts(profile?.batch);
    const semesterOrdinal = parseOrdinalParts(profile?.currentSemester);

    return (
      <View style={styles.academicCardStudent}>
        {/* Academic Header */}
        <View style={styles.academicHeaderRow}>
          <View style={styles.academicHeaderLeft}>
            <View style={styles.academicIconBoxAmber}>
              <Ionicons name="school" size={16} color="#B45309" />
            </View>
            <Text style={styles.academicTitleAmber}>ACADEMIC INFORMATION</Text>
          </View>
        </View>

        {/* Student ID */}
        <View style={styles.academicRowAmber}>
          <View style={styles.academicRowLeft}>
            <Feather
              name="hash"
              size={15}
              color="#D97706"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.academicLabelAmber}>Student ID</Text>
          </View>
          <Text style={styles.academicValueId}>
            {profile?.studentId || "N/A"}
          </Text>
        </View>

        {/* Program */}
        <View style={styles.academicRowAmber}>
          <View style={styles.academicRowLeft}>
            <Feather
              name="book"
              size={15}
              color="#D97706"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.academicLabelAmber}>Program</Text>
          </View>
          <Text style={styles.academicValueAmberRight} numberOfLines={2}>
            {getProgramName(profile?.program, profile?.department)}
          </Text>
        </View>

        {/* Department (Full Name) */}
        <View style={styles.academicRowAmber}>
          <View style={styles.academicRowLeft}>
            <Feather
              name="layers"
              size={15}
              color="#D97706"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.academicLabelAmber}>Department</Text>
          </View>
          <Text style={styles.academicValueAmberRight} numberOfLines={2}>
            {getFullDepartmentDisplayName(profile?.department)}
          </Text>
        </View>

        {/* 3-Column Pill Grid: BATCH, SEMESTER, SECTION with Superscript */}
        <View style={styles.metricGridRow}>
          {/* BATCH */}
          <View style={styles.metricGridBox}>
            <Text style={styles.metricGridSubtitle}>BATCH</Text>
            <View style={styles.metricValueWithSuperscriptRow}>
              <Text style={styles.metricGridValue}>
                {batchOrdinal.numberPart}
              </Text>
              {!!batchOrdinal.suffix && (
                <Text style={styles.metricGridSuperscript}>
                  {batchOrdinal.suffix}
                </Text>
              )}
            </View>
          </View>

          {/* SEMESTER */}
          <View style={styles.metricGridBox}>
            <Text style={styles.metricGridSubtitle}>SEMESTER</Text>
            <View style={styles.metricValueWithSuperscriptRow}>
              <Text style={styles.metricGridValue}>
                {semesterOrdinal.numberPart}
              </Text>
              {!!semesterOrdinal.suffix && (
                <Text style={styles.metricGridSuperscript}>
                  {semesterOrdinal.suffix}
                </Text>
              )}
            </View>
          </View>

          {/* SECTION */}
          <View style={styles.metricGridBox}>
            <Text style={styles.metricGridSubtitle}>SECTION</Text>
            <Text style={styles.metricGridValue}>
              {profile?.section || "A"}
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  academicCardStudent: {
    backgroundColor: "#FFFDF0",
    borderWidth: 1.2,
    borderColor: "#FDE68A",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#B45309",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  academicHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  academicHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  academicIconBoxAmber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  academicTitleAmber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400E",
    letterSpacing: 0.8,
  },
  academicRowAmber: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  academicRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  academicLabelAmber: {
    fontSize: 13,
    color: "#78350F",
    fontWeight: "500",
  },
  academicValueId: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  academicValueAmberRight: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
    flex: 1,
    marginLeft: 14,
  },
  metricGridRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  metricGridBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEF08A",
  },
  metricGridSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  metricValueWithSuperscriptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 3,
  },
  metricGridValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 22,
  },
  metricGridSuperscript: {
    fontSize: 10,
    fontWeight: "800",
    color: "#92400E",
    lineHeight: 12,
    marginLeft: 1,
    marginTop: 1,
  },
});
