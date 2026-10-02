import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CourseHubMember } from "@/types/member.types";
import { BENTO, fontFamily, formatSemester } from "../constants";

interface ProfileDetailsGridProps {
  member: CourseHubMember;
}

export const ProfileDetailsGrid = React.memo(function ProfileDetailsGrid({
  member,
}: ProfileDetailsGridProps) {
  const isTeacher = member.role === "TEACHER";
  const teacherProfile = member.user?.teacherProfile;
  const studentProfile = member.user?.studentProfile;

  return (
    <View style={styles.grid}>
      {isTeacher ? (
        <>
          <View style={styles.tile}>
            <View style={styles.iconBox}>
              <Feather name="hash" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>TEACHER ID</Text>
              <Text style={styles.value} numberOfLines={1}>
                {teacherProfile?.teacherId || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.tile}>
            <View style={styles.iconBox}>
              <Feather name="award" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>DESIGNATION</Text>
              <Text style={styles.value} numberOfLines={1}>
                {teacherProfile?.designation || "Faculty Member"}
              </Text>
            </View>
          </View>

          <View style={styles.tileFull}>
            <View style={styles.iconBox}>
              <Feather name="book-open" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>DEPARTMENT</Text>
              <Text style={styles.value} numberOfLines={1}>
                {teacherProfile?.department || teacherProfile?.faculty || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.tile}>
            <View style={styles.iconBox}>
              <Feather name="phone" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <Text style={styles.value} numberOfLines={1}>
                {member.user?.phoneNumber || "Not provided"}
              </Text>
            </View>
          </View>

          {teacherProfile?.officeRoom ? (
            <View style={styles.tile}>
              <View style={styles.iconBox}>
                <Feather name="map-pin" size={13} color={BENTO.slate} />
              </View>
              <View style={styles.textCol}>
                <Text style={styles.label}>OFFICE ROOM</Text>
                <Text style={styles.value} numberOfLines={1}>
                  {teacherProfile.officeRoom}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.tileFull}>
            <View style={styles.iconBox}>
              <Feather name="clock" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>CONSULTATION HOURS</Text>
              <Text style={styles.value} numberOfLines={2}>
                {teacherProfile?.consultationHours || "Not specified"}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.tile}>
            <View style={styles.iconBox}>
              <Feather name="hash" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>STUDENT ID</Text>
              <Text style={styles.value} numberOfLines={1}>
                {studentProfile?.studentId || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.tile}>
            <View style={styles.iconBox}>
              <Feather name="calendar" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>SEMESTER</Text>
              <Text style={styles.value} numberOfLines={1}>
                {formatSemester(studentProfile?.currentSemester) || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.tile}>
            <View style={styles.iconBox}>
              <Feather name="users" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>BATCH & SECTION</Text>
              <Text style={styles.value} numberOfLines={1}>
                {studentProfile?.batch ? `Batch ${studentProfile.batch}` : "—"}
                {studentProfile?.section ? ` • Sec ${studentProfile.section}` : ""}
              </Text>
            </View>
          </View>

          <View style={styles.tile}>
            <View style={styles.iconBox}>
              <Feather name="phone" size={13} color={BENTO.slate} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <Text style={styles.value} numberOfLines={1}>
                {member.user?.phoneNumber || "Not provided"}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.05)",
  },
  tile: {
    flexBasis: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tileFull: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: BENTO.slateLight,
    letterSpacing: 0.4,
  },
  value: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
    marginTop: 1,
  },
});
