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

export function CourseDetailsSection({ form, onFieldChange }: Props) {
  return (
    <View style={[s.bentoCard, s.blueBentoCard]}>
      {/* Card Header */}
      <View style={s.cardHeaderRow}>
        <View style={[s.cardHeaderIcon, { backgroundColor: BENTO_THEME.blueHeaderBg }]}>
          <Feather name="book-open" size={16} color={BENTO_THEME.blueIcon} />
        </View>
        <View style={s.cardHeaderTextGroup}>
          <Text style={s.cardHeaderTitle}>Course Details</Text>
          <Text style={[s.cardHeaderSub, { color: BENTO_THEME.blueSub }]}>
            Title, code &amp; credits
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: BENTO_THEME.blueHeaderBg }]}>
          <Text style={[s.statusBadgeText, { color: BENTO_THEME.blueIcon }]}>
            REQUIRED
          </Text>
        </View>
      </View>

      {/* Course Name */}
      <View style={s.inputGroup}>
        <Text style={[s.inputLabel, { color: BENTO_THEME.blueLabel }]}>COURSE NAME</Text>
        <View style={[s.inputRow, s.blueInputRow]}>
          <Feather name="type" size={15} color={BENTO_THEME.blueIcon} style={s.leadingIcon} />
          <TextInput
            style={s.textInput}
            value={form.courseName}
            onChangeText={(v) => onFieldChange("courseName", v)}
            placeholder="e.g. Operating Systems"
            placeholderTextColor={BENTO_THEME.slateLight}
            autoCapitalize="words"
            accessible
            accessibilityLabel="Course name"
          />
        </View>
      </View>

      {/* Code & Credits Grid */}
      <View style={s.grid}>
        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.blueLabel }]}>COURSE CODE</Text>
          <View style={[s.inputRow, s.blueInputRow]}>
            <Feather name="hash" size={15} color={BENTO_THEME.blueIcon} style={s.leadingIcon} />
            <TextInput
              style={s.textInput}
              value={form.courseCode}
              onChangeText={(v) => onFieldChange("courseCode", v)}
              placeholder="e.g. CSE 3311"
              placeholderTextColor={BENTO_THEME.slateLight}
              autoCapitalize="characters"
              accessible
              accessibilityLabel="Course code"
            />
          </View>
        </View>

        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: BENTO_THEME.blueLabel }]}>CREDITS</Text>
          <View style={[s.inputRow, s.blueInputRow]}>
            <Feather name="award" size={15} color={BENTO_THEME.blueIcon} style={s.leadingIcon} />
            <TextInput
              style={s.textInput}
              value={form.credit}
              onChangeText={(v) => onFieldChange("credit", v)}
              placeholder="e.g. 3.0"
              placeholderTextColor={BENTO_THEME.slateLight}
              keyboardType="decimal-pad"
              accessible
              accessibilityLabel="Course credits"
            />
          </View>
        </View>
      </View>
    </View>
  );
}
