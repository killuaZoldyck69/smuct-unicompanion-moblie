import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "../constants";
import SearchableTeacherSelect from "../../searchable-teacher-select";
import { styles } from "../styles";

interface InstructorSectionProps {
  isCR: boolean;
  isTeacher: boolean;
  selectedTeacherId: string;
  teachers?: any[];
  isLoadingTeachers?: boolean;
  currentUser: any;
  onSelectTeacher: (id: string) => void;
}

export const InstructorSection = React.memo(function InstructorSection({
  isCR,
  isTeacher,
  selectedTeacherId,
  teachers = [],
  isLoadingTeachers = false,
  currentUser,
  onSelectTeacher,
}: InstructorSectionProps) {
  // If CR, they must search and assign a faculty member
  if (isCR) {
    return (
      <View style={[styles.bentoCard, styles.purpleBentoCard]}>
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.cardHeaderIcon,
              { backgroundColor: BENTO_THEME.purpleHeaderBg },
            ]}
          >
            <Feather
              name="user-check"
              size={16}
              color={BENTO_THEME.purpleIcon}
            />
          </View>
          <View style={styles.cardHeaderTextGroup}>
            <Text style={styles.cardHeaderTitle}>Course Instructor</Text>
            <Text style={[styles.cardHeaderSub, { color: BENTO_THEME.purpleSub }]}>
              Assign a faculty member
            </Text>
          </View>
          <View
            style={[
              styles.requiredBadge,
              { backgroundColor: BENTO_THEME.purpleHeaderBg },
            ]}
          >
            <Text
              style={[
                styles.requiredBadgeText,
                { color: BENTO_THEME.purpleIcon },
              ]}
            >
              ASSIGN
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: BENTO_THEME.purpleLabel }]}>
            SEARCH TEACHER
          </Text>
          <SearchableTeacherSelect
            teachers={teachers}
            selectedId={selectedTeacherId}
            onSelect={onSelectTeacher}
            isLoading={isLoadingTeachers}
          />
        </View>
      </View>
    );
  }

  // If Teacher, they are the instructor
  if (isTeacher) {
    const teacherName = currentUser?.name || "You";
    const dept = currentUser?.teacherProfile?.department || "Faculty Member";

    return (
      <View style={[styles.bentoCard, styles.purpleBentoCard]}>
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.cardHeaderIcon,
              { backgroundColor: BENTO_THEME.purpleHeaderBg },
            ]}
          >
            <Feather
              name="user-check"
              size={16}
              color={BENTO_THEME.purpleIcon}
            />
          </View>
          <View style={styles.cardHeaderTextGroup}>
            <Text style={styles.cardHeaderTitle}>Course Instructor</Text>
            <Text style={[styles.cardHeaderSub, { color: BENTO_THEME.purpleSub }]}>
              Assigned to your profile
            </Text>
          </View>
        </View>

        <View style={styles.teacherSelfCard}>
          <View style={styles.teacherSelfAvatar}>
            <Feather name="user" size={18} color={BENTO_THEME.purpleIcon} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherSelfName}>{teacherName}</Text>
            <Text style={styles.teacherSelfSub}>{dept}</Text>
          </View>
          <Feather name="check-circle" size={18} color="#15803d" />
        </View>
      </View>
    );
  }

  return null;
});
