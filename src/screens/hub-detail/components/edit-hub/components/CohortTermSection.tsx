import React from "react";
import { View, Text, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "@/screens/hubs/components/create-hub";
import { editHubStyles as s } from "../styles";
import type { EditHubFormState } from "../types";

interface Props {
  form: EditHubFormState;
  onFieldChange: (key: keyof EditHubFormState, value: string) => void;
}

export function CohortTermSection({ form, onFieldChange }: Props) {
  return (
    <View style={[s.bentoCard, s.mintBentoCard]}>
      {/* Card Header */}
      <View style={s.cardHeaderRow}>
        <View style={[s.cardHeaderIcon, { backgroundColor: BENTO_THEME.mintHeaderBg }]}>
          <Feather name="users" size={16} color={BENTO_THEME.mintIcon} />
        </View>
        <View style={s.cardHeaderTextGroup}>
          <Text style={s.cardHeaderTitle}>Cohort &amp; Term</Text>
          <Text style={[s.cardHeaderSub, { color: BENTO_THEME.mintSub }]}>
            Department, batch, section &amp; term
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: BENTO_THEME.mintHeaderBg }]}>
          <Text style={[s.statusBadgeText, { color: BENTO_THEME.mintIcon }]}>
            REQUIRED
          </Text>
        </View>
      </View>

      {/* Department & Batch */}
      <View style={s.grid}>
        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.mintLabel }]}>DEPARTMENT</Text>
          <View style={[s.inputRow, s.mintInputRow]}>
            <Feather name="briefcase" size={15} color={BENTO_THEME.mintIcon} style={s.leadingIcon} />
            <TextInput
              style={s.textInput}
              value={form.department}
              onChangeText={(v) => onFieldChange("department", v)}
              placeholder="e.g. CSE"
              placeholderTextColor={BENTO_THEME.slateLight}
              autoCapitalize="characters"
              accessible
              accessibilityLabel="Department"
            />
          </View>
        </View>

        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.mintLabel }]}>BATCH</Text>
          <View style={[s.inputRow, s.mintInputRow]}>
            <Feather name="hash" size={15} color={BENTO_THEME.mintIcon} style={s.leadingIcon} />
            <TextInput
              style={s.textInput}
              value={form.batch}
              onChangeText={(v) => onFieldChange("batch", v)}
              placeholder="e.g. 37"
              placeholderTextColor={BENTO_THEME.slateLight}
              keyboardType="number-pad"
              accessible
              accessibilityLabel="Batch number"
            />
          </View>
        </View>
      </View>

      {/* Section & Semester */}
      <View style={s.grid}>
        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.mintLabel }]}>SECTION</Text>
          <View style={[s.inputRow, s.mintInputRow]}>
            <Feather name="layers" size={15} color={BENTO_THEME.mintIcon} style={s.leadingIcon} />
            <TextInput
              style={s.textInput}
              value={form.section}
              onChangeText={(v) => onFieldChange("section", v)}
              placeholder="e.g. A or 6B"
              placeholderTextColor={BENTO_THEME.slateLight}
              autoCapitalize="characters"
              accessible
              accessibilityLabel="Section"
            />
          </View>
        </View>

        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.mintLabel }]}>SEMESTER</Text>
          <View style={[s.inputRow, s.mintInputRow]}>
            <Feather name="calendar" size={15} color={BENTO_THEME.mintIcon} style={s.leadingIcon} />
            <TextInput
              style={s.textInput}
              value={form.semesterNumber}
              onChangeText={(v) => onFieldChange("semesterNumber", v)}
              placeholder="e.g. 6"
              placeholderTextColor={BENTO_THEME.slateLight}
              keyboardType="number-pad"
              accessible
              accessibilityLabel="Semester number"
            />
          </View>
        </View>
      </View>

      {/* Academic Term */}
      <View style={[s.inputGroup, { marginBottom: 0 }]}>
        <Text style={[s.inputLabel, { color: BENTO_THEME.mintLabel }]}>
          ACADEMIC TERM / OFFER
        </Text>
        <View style={[s.inputRow, s.mintInputRow]}>
          <Feather name="clock" size={15} color={BENTO_THEME.mintIcon} style={s.leadingIcon} />
          <TextInput
            style={s.textInput}
            value={form.termOffer}
            onChangeText={(v) => onFieldChange("termOffer", v)}
            placeholder="e.g. Spring 2026"
            placeholderTextColor={BENTO_THEME.slateLight}
            accessible
            accessibilityLabel="Academic term offer"
          />
        </View>
      </View>
    </View>
  );
}
