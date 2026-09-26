import React, { createElement } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME, formatTimeDisplay } from "@/screens/hubs/components/create-hub";
import { editHubStyles as s } from "../styles";
import type { ExamState, DateTimePickerTarget } from "../types";
import { formatShortDate, toHHMM, toISODate } from "../utils";

interface ExamCardProps {
  label: "MIDTERM EXAM" | "FINAL EXAM";
  iconName: "edit-3" | "award";
  exam: ExamState;
  pickerTarget: "midterm" | "final";
  onClear: () => void;
  onRoomChange: (room: string) => void;
  onOpenPicker: (cfg: DateTimePickerTarget) => void;
  onWebDateChange: (d: Date) => void;
  onWebTimeChange: (d: Date) => void;
  accessibilityPrefix: string;
}

function ExamCard({
  label,
  iconName,
  exam,
  pickerTarget,
  onClear,
  onRoomChange,
  onOpenPicker,
  onWebDateChange,
  onWebTimeChange,
  accessibilityPrefix,
}: ExamCardProps) {
  const isWeb = Platform.OS === "web";
  const hasSomething = !!exam.date || !!exam.room;

  return (
    <View style={s.examCard}>
      {/* Exam Card Header */}
      <View style={s.examCardHeader}>
        <View style={s.examBadge}>
          <Feather
            name={iconName}
            size={13}
            color={BENTO_THEME.roseIcon}
            style={{ marginRight: 5 }}
          />
          <Text style={s.examBadgeText}>{label}</Text>
        </View>
        {hasSomething && (
          <TouchableOpacity
            onPress={onClear}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label.toLowerCase()}`}
          >
            <Text style={s.clearExamText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date & Time Grid */}
      <View style={s.grid}>
        {/* Date Picker */}
        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: "#9f1239" }]}>EXAM DATE</Text>
          <TouchableOpacity
            style={[s.inputRow, s.roseInputRow]}
            onPress={!isWeb ? () => onOpenPicker({ target: pickerTarget, mode: "date" }) : undefined}
            activeOpacity={isWeb ? 1 : 0.7}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityPrefix} exam date`}
          >
            <Feather name="calendar" size={15} color={BENTO_THEME.roseIcon} style={s.leadingIcon} />
            <Text style={s.pickerText}>{formatShortDate(exam.date)}</Text>
            {isWeb &&
              createElement("input", {
                type: "date",
                value: exam.date ? toISODate(exam.date) : toISODate(new Date()),
                onChange: (e: any) => {
                  if (!e?.target?.value) return;
                  const [y, mo, d] = e.target.value.split("-").map(Number);
                  const base = exam.date ? new Date(exam.date) : new Date();
                  base.setFullYear(y, mo - 1, d);
                  onWebDateChange(base);
                },
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  zIndex: 10,
                },
              })}
          </TouchableOpacity>
        </View>

        {/* Time Picker */}
        <View style={s.gridItem}>
          <Text style={[s.inputLabel, { color: "#9f1239" }]}>START TIME</Text>
          <TouchableOpacity
            style={[s.inputRow, s.roseInputRow]}
            onPress={!isWeb ? () => onOpenPicker({ target: pickerTarget, mode: "time" }) : undefined}
            activeOpacity={isWeb ? 1 : 0.7}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${accessibilityPrefix} exam time`}
          >
            <Feather name="clock" size={15} color={BENTO_THEME.roseIcon} style={s.leadingIcon} />
            <Text style={s.pickerText}>
              {exam.date ? formatTimeDisplay(exam.date) : "Set Time"}
            </Text>
            {isWeb &&
              createElement("input", {
                type: "time",
                value: exam.date ? toHHMM(exam.date) : "10:00",
                onChange: (e: any) => {
                  if (!e?.target?.value) return;
                  const [h, m] = e.target.value.split(":").map(Number);
                  const base = exam.date ? new Date(exam.date) : new Date();
                  base.setHours(h, m, 0, 0);
                  onWebTimeChange(base);
                },
                style: {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  zIndex: 10,
                },
              })}
          </TouchableOpacity>
        </View>
      </View>

      {/* Room Input */}
      <View style={[s.inputGroup, { marginBottom: 0 }]}>
        <Text style={[s.inputLabel, { color: "#9f1239" }]}>EXAM ROOM / HALL</Text>
        <View style={[s.inputRow, s.roseInputRow]}>
          <Feather name="map-pin" size={15} color={BENTO_THEME.roseIcon} style={s.leadingIcon} />
          <TextInput
            style={s.textInput}
            value={exam.room}
            onChangeText={onRoomChange}
            placeholder="e.g. Exam Hall A, Room 402"
            placeholderTextColor={BENTO_THEME.slateLight}
            accessible
            accessibilityLabel={`${accessibilityPrefix} exam room`}
          />
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Public component — wraps both Midterm and Final cards
// ---------------------------------------------------------------------------
interface Props {
  midterm: ExamState;
  final: ExamState;
  onMidtermChange: (updated: Partial<ExamState>) => void;
  onFinalChange: (updated: Partial<ExamState>) => void;
  onOpenPicker: (cfg: DateTimePickerTarget) => void;
}

export function ExamsSection({
  midterm,
  final,
  onMidtermChange,
  onFinalChange,
  onOpenPicker,
}: Props) {
  return (
    <View style={[s.bentoCard, s.roseBentoCard]}>
      {/* Card Header */}
      <View style={s.cardHeaderRow}>
        <View style={[s.cardHeaderIcon, { backgroundColor: "#fee2e2" }]}>
          <Feather name="award" size={16} color={BENTO_THEME.roseIcon} />
        </View>
        <View style={s.cardHeaderTextGroup}>
          <Text style={s.cardHeaderTitle}>Term Examinations</Text>
          <Text style={[s.cardHeaderSub, { color: BENTO_THEME.roseIcon }]}>
            Midterm &amp; Final exam routine
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: "#fee2e2" }]}>
          <Text style={[s.statusBadgeText, { color: BENTO_THEME.roseIcon }]}>EXAMS</Text>
        </View>
      </View>

      <ExamCard
        label="MIDTERM EXAM"
        iconName="edit-3"
        exam={midterm}
        pickerTarget="midterm"
        accessibilityPrefix="Midterm"
        onClear={() => onMidtermChange({ date: null, room: "" })}
        onRoomChange={(room) => onMidtermChange({ room })}
        onOpenPicker={onOpenPicker}
        onWebDateChange={(d) => onMidtermChange({ date: d })}
        onWebTimeChange={(d) => onMidtermChange({ date: d })}
      />

      <ExamCard
        label="FINAL EXAM"
        iconName="award"
        exam={final}
        pickerTarget="final"
        accessibilityPrefix="Final"
        onClear={() => onFinalChange({ date: null, room: "" })}
        onRoomChange={(room) => onFinalChange({ room })}
        onOpenPicker={onOpenPicker}
        onWebDateChange={(d) => onFinalChange({ date: d })}
        onWebTimeChange={(d) => onFinalChange({ date: d })}
      />
    </View>
  );
}
