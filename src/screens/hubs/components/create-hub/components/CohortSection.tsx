import React from "react";
import { View, Text, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "../constants";
import {
  formatBatch,
  formatSection,
  formatTermOffer,
  formatSemester,
} from "../utils";
import { styles } from "../styles";

interface CohortSectionProps {
  isCR: boolean;
  department: string;
  batch: string;
  section: string;
  semesterNumber: string;
  termOffer: string;
  userDepartment?: string;
  userBatch?: string;
  userSection?: string;
  userSemester?: number | string;
  userTerm?: string;
  onChangeDepartment: (val: string) => void;
  onChangeBatch: (val: string) => void;
  onChangeSection: (val: string) => void;
  onChangeSemester: (val: string) => void;
  onChangeTerm: (val: string) => void;
}

export const CohortSection = React.memo(function CohortSection({
  isCR,
  department,
  batch,
  section,
  semesterNumber,
  termOffer,
  userDepartment,
  userBatch,
  userSection,
  userSemester,
  userTerm,
  onChangeDepartment,
  onChangeBatch,
  onChangeSection,
  onChangeSemester,
  onChangeTerm,
}: CohortSectionProps) {
  // CR View: Clean auto-assigned cohort chips
  if (isCR) {
    const displayDept = department || userDepartment || "Department";
    const displayBatch = batch || userBatch || "—";
    const displaySection = section || userSection || "A";
    const displaySemester = semesterNumber || userSemester || "—";
    const displayTerm = termOffer || userTerm || "Fall 2026";

    return (
      <View
        style={[
          styles.bentoCard,
          styles.mintBentoCard,
          styles.crCohortCard,
        ]}
      >
        <View style={styles.crCohortHeaderRow}>
          <View
            style={[
              styles.cardHeaderIcon,
              { backgroundColor: BENTO_THEME.mintHeaderBg },
            ]}
          >
            <Feather
              name="shield"
              size={16}
              color={BENTO_THEME.mintIcon}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text style={styles.crCohortHeaderTitle}>Target Cohort</Text>
              <View style={styles.crVerifiedBadge}>
                <Feather name="check" size={10} color="#15803d" />
                <Text style={styles.crVerifiedText}>CR Linked</Text>
              </View>
            </View>
            <Text
              style={[
                styles.cardHeaderSub,
                { color: BENTO_THEME.mintSub },
              ]}
            >
              Auto-assigned from your verified student profile
            </Text>
          </View>
        </View>

        <View style={styles.crCohortPillsGrid}>
          <View style={styles.crCohortChip}>
            <Feather
              name="book-open"
              size={12}
              color={BENTO_THEME.mintIcon}
            />
            <Text style={styles.crCohortChipText} numberOfLines={1}>
              {displayDept}
            </Text>
          </View>

          <View style={styles.crCohortChip}>
            <Feather name="users" size={12} color={BENTO_THEME.mintIcon} />
            <Text style={styles.crCohortChipText}>
              Batch {displayBatch} (Sec {displaySection})
            </Text>
          </View>

          <View style={styles.crCohortChip}>
            <Feather name="grid" size={12} color={BENTO_THEME.mintIcon} />
            <Text style={styles.crCohortChipText}>Sem {displaySemester}</Text>
          </View>

          <View style={styles.crCohortChip}>
            <Feather
              name="calendar"
              size={12}
              color={BENTO_THEME.mintIcon}
            />
            <Text style={styles.crCohortChipText}>{displayTerm}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Teacher View: Full editable cohort parameters
  return (
    <View style={[styles.bentoCard, styles.mintBentoCard]}>
      <View style={styles.cardHeaderRow}>
        <View
          style={[
            styles.cardHeaderIcon,
            { backgroundColor: BENTO_THEME.mintHeaderBg },
          ]}
        >
          <Feather name="layers" size={16} color={BENTO_THEME.mintIcon} />
        </View>
        <View style={styles.cardHeaderTextGroup}>
          <Text style={styles.cardHeaderTitle}>Cohort & Term</Text>
          <Text
            style={[styles.cardHeaderSub, { color: BENTO_THEME.mintSub }]}
          >
            Department, batch & semester
          </Text>
        </View>
      </View>

      {/* Department */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: BENTO_THEME.mintLabel }]}>
          DEPARTMENT
        </Text>
        <View style={[styles.inputBox, styles.mintInputBox]}>
          <Feather
            name="briefcase"
            size={15}
            color={BENTO_THEME.mintIcon}
            style={styles.inputLeadingIcon}
          />
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={onChangeDepartment}
            placeholder="e.g. Computer Science and Engineering"
            placeholderTextColor={BENTO_THEME.slateLight}
            autoCapitalize="words"
            accessible={true}
            accessibilityLabel="Department"
          />
        </View>
      </View>

      {/* Grid: Batch & Section */}
      <View style={styles.gridRow}>
        {/* Batch */}
        <View style={styles.gridItem}>
          <Text
            style={[styles.inputLabel, { color: BENTO_THEME.mintLabel }]}
          >
            BATCH
          </Text>
          <View style={[styles.inputBox, styles.mintInputBox]}>
            <Feather
              name="users"
              size={15}
              color={BENTO_THEME.mintIcon}
              style={styles.inputLeadingIcon}
            />
            <TextInput
              style={styles.input}
              value={batch}
              onChangeText={(t) => onChangeBatch(formatBatch(t))}
              placeholder="e.g. 37"
              placeholderTextColor={BENTO_THEME.slateLight}
              keyboardType="number-pad"
              accessible={true}
              accessibilityLabel="Batch"
            />
          </View>
        </View>

        {/* Section */}
        <View style={styles.gridItem}>
          <Text
            style={[styles.inputLabel, { color: BENTO_THEME.mintLabel }]}
          >
            SECTION
          </Text>
          <View style={[styles.inputBox, styles.mintInputBox]}>
            <Feather
              name="bookmark"
              size={15}
              color={BENTO_THEME.mintIcon}
              style={styles.inputLeadingIcon}
            />
            <TextInput
              style={styles.input}
              value={section}
              onChangeText={(t) => onChangeSection(formatSection(t))}
              onBlur={() => onChangeSection(formatSection(section).trim())}
              placeholder="e.g. B"
              placeholderTextColor={BENTO_THEME.slateLight}
              autoCapitalize="characters"
              accessible={true}
              accessibilityLabel="Section"
            />
          </View>
        </View>
      </View>

      {/* Grid: Term / Offer & Semester */}
      <View style={styles.gridRow}>
        {/* Term/Offer */}
        <View style={styles.gridItem}>
          <Text
            style={[styles.inputLabel, { color: BENTO_THEME.mintLabel }]}
          >
            TERM / OFFER
          </Text>
          <View style={[styles.inputBox, styles.mintInputBox]}>
            <Feather
              name="calendar"
              size={15}
              color={BENTO_THEME.mintIcon}
              style={styles.inputLeadingIcon}
            />
            <TextInput
              style={styles.input}
              value={termOffer}
              onChangeText={(t) => onChangeTerm(formatTermOffer(t))}
              onBlur={() => onChangeTerm(formatTermOffer(termOffer).trim())}
              placeholder="e.g. Fall 2026"
              placeholderTextColor={BENTO_THEME.slateLight}
              autoCapitalize="words"
              accessible={true}
              accessibilityLabel="Term or Offer"
            />
          </View>
        </View>

        {/* Semester */}
        <View style={styles.gridItem}>
          <Text
            style={[styles.inputLabel, { color: BENTO_THEME.mintLabel }]}
          >
            SEMESTER
          </Text>
          <View style={[styles.inputBox, styles.mintInputBox]}>
            <Feather
              name="grid"
              size={15}
              color={BENTO_THEME.mintIcon}
              style={styles.inputLeadingIcon}
            />
            <TextInput
              style={styles.input}
              value={semesterNumber}
              onChangeText={(t) => onChangeSemester(formatSemester(t))}
              placeholder="e.g. 9"
              placeholderTextColor={BENTO_THEME.slateLight}
              keyboardType="number-pad"
              accessible={true}
              accessibilityLabel="Semester number"
            />
          </View>
        </View>
      </View>
    </View>
  );
});
