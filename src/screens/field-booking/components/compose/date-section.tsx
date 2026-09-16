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
import { toISODateString } from "../../utils";

interface DateSectionProps {
  selectedDate: Date;
  selectedDateStr: string;
  onDateChange: (date: Date) => void;
  onOpenNativePicker: () => void;
  applyDateOffset: (days: number) => void;
  applyUpcomingWeekend: (targetDay: 0 | 6) => void;
}

export const DateSection = memo(function DateSection({
  selectedDate,
  selectedDateStr,
  onDateChange,
  onOpenNativePicker,
  applyDateOffset,
  applyUpcomingWeekend,
}: DateSectionProps) {
  const formattedDisplay = selectedDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionLabel}>MATCH / EVENT DATE</Text>

      <TouchableOpacity
        style={styles.dateSelectorCard}
        activeOpacity={Platform.OS === "web" ? 1 : 0.7}
        onPress={() => {
          if (Platform.OS !== "web") {
            onOpenNativePicker();
          }
        }}
      >
        <View style={styles.selectorCardIcon}>
          <Feather name="calendar" size={18} color={BENTO.navy} />
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.selectorCardValue}>{formattedDisplay}</Text>
          <Text style={styles.selectorCardHelper}>
            Tap to choose another date
          </Text>
        </View>

        <Feather name="edit-2" size={15} color={BENTO.slate} />

        {Platform.OS === "web" &&
          createElement("input", {
            type: "date",
            value: selectedDateStr,
            min: toISODateString(new Date()),
            onChange: (e: any) => {
              if (e?.target?.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                onDateChange(new Date(y, m - 1, d));
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

      <View style={styles.dateShortcutsRow}>
        <TouchableOpacity
          style={styles.dateShortcutPill}
          onPress={() => applyDateOffset(0)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateShortcutText}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateShortcutPill}
          onPress={() => applyDateOffset(1)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateShortcutText}>Tomorrow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateShortcutPill}
          onPress={() => applyUpcomingWeekend(6)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateShortcutText}>This Saturday</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateShortcutPill}
          onPress={() => applyUpcomingWeekend(0)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateShortcutText}>This Sunday</Text>
        </TouchableOpacity>
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
  dateSelectorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    position: "relative",
  },
  selectorCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  valueContainer: {
    flex: 1,
  },
  selectorCardValue: {
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
  },
  selectorCardHelper: {
    fontSize: 11,
    color: BENTO.slateLight,
    marginTop: 2,
  },
  dateShortcutsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  dateShortcutPill: {
    flex: 1,
    backgroundColor: BENTO.slateSubtle,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  dateShortcutText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.slate,
  },
});
