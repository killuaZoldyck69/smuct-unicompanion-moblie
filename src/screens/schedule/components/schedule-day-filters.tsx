import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  BENTO_COLORS,
  DAY_ABBREVIATIONS,
  DAYS_ORDER,
  fontFamily,
} from "../constants";

interface ScheduleDayFiltersProps {
  selectedDay: string;
  onSelectDay: (day: string) => void;
  daysWithClasses: Set<string>;
  todayWeekday: string;
}

export const ScheduleDayFilters = React.memo(function ScheduleDayFilters({
  selectedDay,
  onSelectDay,
  daysWithClasses,
  todayWeekday,
}: ScheduleDayFiltersProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          onPress={() => onSelectDay("ALL")}
          style={[styles.pill, selectedDay === "ALL" && styles.pillActive]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Show all days"
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.pillText,
              selectedDay === "ALL" && styles.pillTextActive,
            ]}
          >
            ALL
          </Text>
        </TouchableOpacity>

        {DAYS_ORDER.map((day) => {
          const abbrev = DAY_ABBREVIATIONS[day] || day.substring(0, 3);
          const isSelected = selectedDay === day;
          const hasClasses = daysWithClasses.has(day);
          const isToday = day === todayWeekday;

          return (
            <TouchableOpacity
              key={day}
              onPress={() => onSelectDay(day)}
              style={[
                styles.pill,
                isSelected && styles.pillActive,
                !hasClasses && !isSelected && styles.pillEmpty,
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${day}, ${hasClasses ? "classes scheduled" : "no classes"}`}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextActive,
                  !hasClasses && !isSelected && styles.pillTextMuted,
                ]}
              >
                {abbrev}
              </Text>
              {isToday && (
                <View
                  style={[
                    styles.dot,
                    isSelected && styles.dotActive,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  content: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  pillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  pillEmpty: {
    opacity: 0.6,
  },
  pillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  pillTextActive: {
    color: "#ffffff",
  },
  pillTextMuted: {
    color: BENTO_COLORS.subtleText,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#059669",
    marginLeft: 6,
  },
  dotActive: {
    backgroundColor: "#34d399",
  },
});
