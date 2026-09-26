import React from "react";
import { View, Text, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "../constants";
import { formatCourseName, formatCourseCode, formatCredit } from "../utils";
import { styles } from "../styles";

interface CourseDetailsSectionProps {
  courseName: string;
  courseCode: string;
  credit: string;
  onChangeName: (val: string) => void;
  onChangeCode: (val: string) => void;
  onChangeCredit: (val: string) => void;
}

export const CourseDetailsSection = React.memo(
  function CourseDetailsSection({
    courseName,
    courseCode,
    credit,
    onChangeName,
    onChangeCode,
    onChangeCredit,
  }: CourseDetailsSectionProps) {
    return (
      <View style={[styles.bentoCard, styles.blueBentoCard]}>
        {/* Section Header */}
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.cardHeaderIcon,
              { backgroundColor: BENTO_THEME.blueHeaderBg },
            ]}
          >
            <Feather
              name="book-open"
              size={16}
              color={BENTO_THEME.blueIcon}
            />
          </View>
          <View style={styles.cardHeaderTextGroup}>
            <Text style={styles.cardHeaderTitle}>Course Details</Text>
            <Text
              style={[
                styles.cardHeaderSub,
                { color: BENTO_THEME.blueSub },
              ]}
            >
              Title, code & credits
            </Text>
          </View>
          <View
            style={[
              styles.requiredBadge,
              { backgroundColor: BENTO_THEME.blueHeaderBg },
            ]}
          >
            <Text
              style={[
                styles.requiredBadgeText,
                { color: BENTO_THEME.blueIcon },
              ]}
            >
              REQUIRED
            </Text>
          </View>
        </View>

        {/* 1. Course Name */}
        <View style={styles.inputGroup}>
          <Text
            style={[
              styles.inputLabel,
              { color: BENTO_THEME.blueLabel },
            ]}
          >
            COURSE NAME
          </Text>
          <View style={[styles.inputBox, styles.blueInputBox]}>
            <Feather
              name="type"
              size={15}
              color={BENTO_THEME.blueIcon}
              style={styles.inputLeadingIcon}
            />
            <TextInput
              style={styles.input}
              value={courseName}
              onChangeText={(text) => onChangeName(formatCourseName(text))}
              placeholder="e.g. Operating Systems"
              placeholderTextColor={BENTO_THEME.slateLight}
              autoCapitalize="words"
              accessible={true}
              accessibilityLabel="Course Name"
            />
          </View>
        </View>

        {/* 2. Course Code & Credits Grid */}
        <View style={styles.gridRow}>
          {/* Course Code */}
          <View style={styles.gridItem}>
            <Text
              style={[
                styles.inputLabel,
                { color: BENTO_THEME.blueLabel },
              ]}
            >
              COURSE CODE
            </Text>
            <View style={[styles.inputBox, styles.blueInputBox]}>
              <Feather
                name="hash"
                size={15}
                color={BENTO_THEME.blueIcon}
                style={styles.inputLeadingIcon}
              />
              <TextInput
                style={styles.input}
                value={courseCode}
                onChangeText={(text) => onChangeCode(formatCourseCode(text))}
                onBlur={() => onChangeCode(formatCourseCode(courseCode).trim())}
                placeholder="e.g. CSE 3311"
                placeholderTextColor={BENTO_THEME.slateLight}
                autoCapitalize="characters"
                accessible={true}
                accessibilityLabel="Course Code"
              />
            </View>
          </View>

          {/* Credits */}
          <View style={styles.gridItem}>
            <Text
              style={[
                styles.inputLabel,
                { color: BENTO_THEME.blueLabel },
              ]}
            >
              CREDITS
            </Text>
            <View style={[styles.inputBox, styles.blueInputBox]}>
              <Feather
                name="award"
                size={15}
                color={BENTO_THEME.blueIcon}
                style={styles.inputLeadingIcon}
              />
              <TextInput
                style={styles.input}
                value={credit}
                onChangeText={(text) => onChangeCredit(formatCredit(text))}
                placeholder="e.g. 3.0"
                placeholderTextColor={BENTO_THEME.slateLight}
                keyboardType="decimal-pad"
                accessible={true}
                accessibilityLabel="Credits"
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
);
