import React, { createElement, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../../constants";
import { formatTime12h } from "../../utils";
import type { DurationInfo } from "../../types";

interface TimeSectionProps {
  startTime: string;
  endTime: string;
  durationInfo: DurationInfo;
  onSelectPreset?: (start: string, end: string) => void;
  onChangeStartTime: (val: string) => void;
  onChangeEndTime: (val: string) => void;
  onOpenNativePicker: (mode: "start" | "end") => void;
}

export const TimeSection = memo(function TimeSection({
  startTime,
  endTime,
  durationInfo,
  onChangeStartTime,
  onChangeEndTime,
  onOpenNativePicker,
}: TimeSectionProps) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionLabel}>TIME SLOT (12-HR)</Text>

      {/* Start & End Time Pickers */}
      <View style={styles.customTimeRow}>
        {/* Start Time Card */}
        <TouchableOpacity
          style={styles.timeCardHalf}
          activeOpacity={Platform.OS === "web" ? 1 : 0.7}
          onPress={() => {
            if (Platform.OS !== "web") {
              onOpenNativePicker("start");
            }
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Start time: ${formatTime12h(startTime)}`}
        >
          <Text style={styles.timeCardSubLabel}>START TIME</Text>
          <View style={styles.timeCardValRow}>
            <Feather
              name="clock"
              size={15}
              color={BENTO.indigo}
              style={styles.timeIcon}
            />
            <Text style={styles.timeCardValText}>
              {formatTime12h(startTime)}
            </Text>
          </View>

          {Platform.OS === "web" &&
            createElement("input", {
              type: "time",
              value: startTime,
              onChange: (e: any) => {
                if (e?.target?.value) {
                  onChangeStartTime(e.target.value);
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
            })}
        </TouchableOpacity>

        {/* End Time Card */}
        <TouchableOpacity
          style={styles.timeCardHalf}
          activeOpacity={Platform.OS === "web" ? 1 : 0.7}
          onPress={() => {
            if (Platform.OS !== "web") {
              onOpenNativePicker("end");
            }
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`End time: ${formatTime12h(endTime)}`}
        >
          <Text style={styles.timeCardSubLabel}>END TIME</Text>
          <View style={styles.timeCardValRow}>
            <Feather
              name="clock"
              size={15}
              color={BENTO.indigo}
              style={styles.timeIcon}
            />
            <Text style={styles.timeCardValText}>{formatTime12h(endTime)}</Text>
          </View>

          {Platform.OS === "web" &&
            createElement("input", {
              type: "time",
              value: endTime,
              onChange: (e: any) => {
                if (e?.target?.value) {
                  onChangeEndTime(e.target.value);
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
            })}
        </TouchableOpacity>
      </View>

      {/* Calculated Duration or Warning Pill */}
      <View
        style={[
          styles.durationPillContainer,
          !durationInfo.isValid && styles.durationPillError,
        ]}
      >
        <Feather
          name={durationInfo.isValid ? "check" : "alert-triangle"}
          size={14}
          color={durationInfo.isValid ? BENTO.emerald : BENTO.rose}
          style={styles.durationIcon}
        />
        <Text
          style={[
            styles.durationPillText,
            !durationInfo.isValid && { color: BENTO.rose },
          ]}
        >
          {durationInfo.isValid
            ? `Calculated Duration: ${durationInfo.durationText}`
            : durationInfo.durationText}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  customTimeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  timeCardHalf: {
    flex: 1,
    backgroundColor: BENTO.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    position: "relative",
  },
  timeCardSubLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    marginBottom: 6,
  },
  timeCardValRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIcon: {
    marginRight: 6,
  },
  timeCardValText: {
    fontSize: 15,
    fontWeight: "700",
    color: BENTO.navy,
  },
  durationPillContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  durationPillError: {
    backgroundColor: BENTO.roseBg,
    borderColor: BENTO.roseBorder,
  },
  durationIcon: {
    marginRight: 6,
  },
  durationPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.emerald,
  },
});
