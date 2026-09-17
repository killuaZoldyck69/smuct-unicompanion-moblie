import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import { getCurrentWeekDays } from "../utils";

interface ScheduleDayFiltersProps {
  selectedDay: string;
  onSelectDay: (day: string) => void;
  daysWithClasses: Set<string>;
  todayWeekday: string;
  classesCountByDay?: Map<string, number>;
}

const CARD_WIDTH = 56;
const CARD_GAP = 8;
const CARD_STEP = CARD_WIDTH + CARD_GAP;

export const ScheduleDayFilters = React.memo(function ScheduleDayFilters({
  selectedDay,
  onSelectDay,
  daysWithClasses,
  todayWeekday,
  classesCountByDay = new Map(),
}: ScheduleDayFiltersProps) {
  const scrollRef = useRef<ScrollView>(null);

  const weekDays = useMemo(() => {
    return getCurrentWeekDays(classesCountByDay);
  }, [classesCountByDay]);

  useEffect(() => {
    if (selectedDay === "ALL") {
      scrollRef.current?.scrollTo({ x: 0, animated: true });
      return;
    }
    const idx = weekDays.findIndex((d) => d.dayName === selectedDay);
    if (idx >= 0) {
      // +1 to account for the "ALL" button at index 0
      const targetX = Math.max(0, (idx + 1) * CARD_STEP - 60);
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ x: targetX, animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedDay, weekDays]);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* "ALL" Pill / Card */}
        <TouchableOpacity
          onPress={() => onSelectDay("ALL")}
          style={[
            styles.dateCard,
            selectedDay === "ALL" && styles.dateCardActive,
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Show entire week schedule"
          activeOpacity={0.8}
        >
          <Feather
            name="grid"
            size={14}
            color={selectedDay === "ALL" ? "#ffffff" : BENTO_COLORS.subtleText}
            style={styles.allIcon}
          />
          <Text
            style={[
              styles.allText,
              selectedDay === "ALL" && styles.textWhite,
            ]}
          >
            ALL
          </Text>
          <View style={styles.dotPlaceholder} />
        </TouchableOpacity>

        {/* Day of the Week Cards */}
        {weekDays.map((item) => {
          const isSelected = selectedDay === item.dayName;
          const hasClasses = daysWithClasses.has(item.dayName);
          const isToday = item.dayName === todayWeekday;

          return (
            <TouchableOpacity
              key={item.dayName}
              onPress={() => onSelectDay(item.dayName)}
              style={[
                styles.dateCard,
                isToday && styles.dateCardToday,
                isSelected && styles.dateCardActive,
                !hasClasses && !isSelected && styles.dateCardEmpty,
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${item.dayName}, ${item.dateFormatted}. ${
                hasClasses ? `${item.classCount} classes` : "no classes"
              }${isToday ? ", today" : ""}${isSelected ? ", selected" : ""}`}
              activeOpacity={0.8}
            >
              {isToday ? (
                <View
                  style={[
                    styles.todayBadge,
                    isSelected && styles.todayBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.todayBadgeText,
                      isSelected && styles.todayBadgeTextActive,
                    ]}
                  >
                    TODAY
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.dayAbbrev,
                    isSelected && styles.textWhiteMuted,
                    !hasClasses && !isSelected && styles.textMuted,
                  ]}
                >
                  {item.abbrev}
                </Text>
              )}

              <Text
                style={[
                  styles.dateNumber,
                  isSelected && styles.textWhite,
                  !hasClasses && !isSelected && styles.textMuted,
                ]}
              >
                {item.dateNumber}
              </Text>

              {/* Class Indicator Dot */}
              {hasClasses ? (
                <View
                  style={[
                    styles.classDot,
                    isSelected && styles.classDotActive,
                  ]}
                />
              ) : (
                <View style={styles.dotPlaceholder} />
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
    marginBottom: 16,
    marginHorizontal: -20,
  },
  content: {
    paddingHorizontal: 20,
    gap: CARD_GAP,
    alignItems: "center",
  },
  dateCard: {
    width: CARD_WIDTH,
    height: 72,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dateCardToday: {
    borderColor: "#059669",
    borderWidth: 1.5,
  },
  dateCardActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
    ...Platform.select({
      ios: {
        shadowColor: BENTO_COLORS.deepNavy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  dateCardEmpty: {
    opacity: 0.65,
  },
  allIcon: {
    marginTop: 2,
  },
  allText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    letterSpacing: 0.5,
  },
  dayAbbrev: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  todayBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  todayBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  todayBadgeText: {
    fontFamily,
    fontSize: 8.5,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.3,
  },
  todayBadgeTextActive: {
    color: "#34d399",
  },
  dateNumber: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 20,
  },
  classDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#0284c7",
  },
  classDotActive: {
    backgroundColor: "#38bdf8",
  },
  dotPlaceholder: {
    width: 5,
    height: 5,
  },
  textWhite: {
    color: "#ffffff",
  },
  textWhiteMuted: {
    color: "#94a3b8",
  },
  textMuted: {
    color: "#94a3b8",
  },
});
