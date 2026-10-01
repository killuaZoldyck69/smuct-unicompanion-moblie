import React, { useState, createElement } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BENTO, DEADLINE_PRESETS, fontFamily } from "./constants";
import { toDateTimeLocalString } from "./utils";

interface Props {
  deadline: Date;
  onChangeDeadline: (date: Date) => void;
}

export const CourseworkDeadlineSection: React.FC<Props> = ({
  deadline,
  onChangeDeadline,
}) => {
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [nativePickerMode, setNativePickerMode] = useState<"date" | "time">("date");

  const applyPreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(23, 59, 0, 0);
    onChangeDeadline(d);
  };

  const openNativePicker = () => {
    if (Platform.OS === "web") return;
    setNativePickerMode("date");
    setShowNativePicker(true);
  };

  const handleNativeDateChange = (event: any, selectedDate?: any) => {
    if (event?.type === "dismissed") {
      setShowNativePicker(false);
      return;
    }

    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      onChangeDeadline(currentDate);

      if (Platform.OS === "android" && nativePickerMode === "date") {
        setNativePickerMode("time");
        setShowNativePicker(true);
      } else {
        setShowNativePicker(false);
      }
    }
  };

  return (
    <View style={styles.sectionBlock}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.fieldLabel}>DEADLINE & TIME</Text>
      </View>

      {/* Clickable Bento Card */}
      <TouchableOpacity
        style={styles.deadlineContainer}
        onPress={openNativePicker}
        activeOpacity={Platform.OS === "web" ? 1 : 0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Select deadline date and time"
      >
        <View style={styles.deadlineIconBox}>
          <Feather name="calendar" size={18} color={BENTO.navy} />
        </View>
        <View style={styles.deadlinInfoCol}>
          <Text style={styles.deadlineSubLabel}>Submission Closes</Text>
          <Text style={styles.deadlineDateText}>
            {deadline.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.deadlineActionBadge}>
          <Feather name="edit-2" size={13} color={BENTO.slate} style={{ marginRight: 4 }} />
          <Text style={styles.deadlineActionText}>Edit</Text>
        </View>

        {/* On Web: Invisible overlay input that opens native browser picker */}
        {Platform.OS === "web" && (
          createElement("input", {
            type: "datetime-local",
            value: toDateTimeLocalString(deadline),
            onChange: (e: any) => {
              if (e?.target?.value) {
                onChangeDeadline(new Date(e.target.value));
              }
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
          })
        )}
      </TouchableOpacity>

      {/* Quick Preset Pills */}
      <View style={styles.presetChipsRow}>
        <Text style={styles.presetHeading}>Quick Presets:</Text>
        {DEADLINE_PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            onPress={() => applyPreset(p.days)}
            style={styles.presetChip}
            activeOpacity={0.7}
          >
            <Text style={styles.presetChipText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Native DateTimePicker for iOS & Android */}
      {showNativePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={deadline}
          mode={Platform.OS === "ios" ? "datetime" : nativePickerMode}
          display="default"
          onValueChange={(_event, date) => handleNativeDateChange({ type: "set" }, date)}
          onDismiss={() => setShowNativePicker(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BENTO.navy,
    marginRight: 6,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  deadlineContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 13,
    marginBottom: 8,
  },
  deadlineIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BENTO.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deadlinInfoCol: {
    flex: 1,
  },
  deadlineSubLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  deadlineDateText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
    marginTop: 2,
  },
  deadlineActionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deadlineActionText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  presetChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  presetHeading: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
    marginRight: 2,
  },
  presetChip: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  presetChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.navy,
  },
});
