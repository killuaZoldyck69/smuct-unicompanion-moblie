import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";

import { TeacherProfile } from "../../types";
import { parseOrdinalParts, getFullDepartmentDisplayName } from "../../utils";

interface TeacherAcademicCardProps {
  profile?: TeacherProfile | null;
}

export const TeacherAcademicCard = React.memo(
  ({ profile }: TeacherAcademicCardProps) => {
    const advisoryOrdinal = profile?.advisoryBatch
      ? parseOrdinalParts(profile.advisoryBatch)
      : null;

    const expertiseList = profile?.expertiseFields
      ? Array.isArray(profile.expertiseFields)
        ? profile.expertiseFields
        : String(profile.expertiseFields).split(",")
      : [];

    return (
      <View style={styles.academicCardTeacher}>
        {/* Academic Header */}
        <View style={styles.academicHeaderRow}>
          <View style={styles.academicHeaderLeft}>
            <View style={styles.academicIconBoxIndigo}>
              <FontAwesome5 name="graduation-cap" size={14} color="#6366F1" />
            </View>
            <Text style={styles.academicTitleIndigo}>ACADEMIC INFORMATION</Text>
          </View>
        </View>

        {/* Teacher ID */}
        <View style={styles.academicRowIndigo}>
          <View style={styles.academicRowLeft}>
            <Feather
              name="hash"
              size={15}
              color="#6366F1"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.academicLabelIndigo}>Teacher ID</Text>
          </View>
          <Text style={styles.academicValueId}>
            {profile?.teacherId || "N/A"}
          </Text>
        </View>

        {/* Designation */}
        <View style={styles.academicRowIndigo}>
          <View style={styles.academicRowLeft}>
            <Feather
              name="award"
              size={15}
              color="#6366F1"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.academicLabelIndigo}>Designation</Text>
          </View>
          <Text style={styles.academicValueIndigoRight} numberOfLines={1}>
            {profile?.designation || "Faculty"}
          </Text>
        </View>

        {/* Department (Full Name) */}
        <View style={styles.academicRowIndigo}>
          <View style={styles.academicRowLeft}>
            <Feather
              name="layers"
              size={15}
              color="#6366F1"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.academicLabelIndigo}>Department</Text>
          </View>
          <Text style={styles.academicValueIndigoRight} numberOfLines={2}>
            {getFullDepartmentDisplayName(profile?.department)}
          </Text>
        </View>

        {/* Office Room (if available) */}
        {profile?.officeRoom && (
          <View style={styles.academicRowIndigo}>
            <View style={styles.academicRowLeft}>
              <Feather
                name="map-pin"
                size={15}
                color="#6366F1"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.academicLabelIndigo}>Office Room</Text>
            </View>
            <Text style={styles.academicValueIndigoRight} numberOfLines={1}>
              {profile.officeRoom}
            </Text>
          </View>
        )}

        {/* Consultation Hours (if available) */}
        {profile?.consultationHours && (
          <View style={styles.academicRowIndigo}>
            <View style={styles.academicRowLeft}>
              <Feather
                name="clock"
                size={15}
                color="#6366F1"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.academicLabelIndigo}>Consultation</Text>
            </View>
            <Text style={styles.academicValueIndigoRight} numberOfLines={1}>
              {profile.consultationHours}
            </Text>
          </View>
        )}

        {/* 3-Column Pill Grid: DAY OFF, ADVISORY, STATUS */}
        <View style={styles.metricGridRow}>
          <View style={styles.metricGridBoxIndigo}>
            <Text style={styles.metricGridSubtitle}>DAY OFF</Text>
            <Text style={styles.metricGridValueIndigo} numberOfLines={1}>
              {profile?.dayOff || "Friday"}
            </Text>
          </View>

          <View style={styles.metricGridBoxIndigo}>
            <Text style={styles.metricGridSubtitle}>ADVISORY</Text>
            {advisoryOrdinal ? (
              <View style={styles.metricValueWithSuperscriptRow}>
                <Text style={styles.metricGridValueIndigo}>
                  {advisoryOrdinal.numberPart}
                </Text>
                {!!advisoryOrdinal.suffix && (
                  <Text style={styles.metricGridSuperscriptIndigo}>
                    {advisoryOrdinal.suffix}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.metricGridValueIndigo}>None</Text>
            )}
          </View>

          <View style={styles.metricGridBoxIndigo}>
            <Text style={styles.metricGridSubtitle}>STATUS</Text>
            <Text style={styles.metricGridValueIndigo}>Faculty</Text>
          </View>
        </View>

        {/* Expertise Fields Chips (if available) */}
        {expertiseList.length > 0 && (
          <View style={styles.teacherExpertiseContainer}>
            <Text style={styles.teacherExpertiseTitle}>AREAS OF EXPERTISE</Text>
            <View style={styles.teacherExpertiseWrap}>
              {expertiseList.map((item: string, idx: number) => {
                const trimmed = item.trim();
                if (!trimmed) return null;
                return (
                  <View key={idx} style={styles.teacherExpertiseChip}>
                    <Text style={styles.teacherExpertiseChipText}>
                      {trimmed}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  academicCardTeacher: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1.2,
    borderColor: "#DDD6FE",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#6366F1",
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
  academicIconBoxIndigo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  academicTitleIndigo: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4338CA",
    letterSpacing: 0.8,
  },
  academicRowIndigo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  academicRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  academicLabelIndigo: {
    fontSize: 13,
    color: "#4338CA",
    fontWeight: "500",
  },
  academicValueId: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  academicValueIndigoRight: {
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
  metricGridBoxIndigo: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  metricGridSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  metricGridValueIndigo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 3,
  },
  metricValueWithSuperscriptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 3,
  },
  metricGridSuperscriptIndigo: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4338CA",
    lineHeight: 12,
    marginLeft: 1,
    marginTop: 1,
  },
  teacherExpertiseContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDE9FE",
  },
  teacherExpertiseTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366F1",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  teacherExpertiseWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  teacherExpertiseChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teacherExpertiseChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4338CA",
  },
});
