import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicEventItem } from "@/services/calendar-service";
import { BENTO_COLORS, fontFamily } from "../constants";
import { CalendarDayItem, getWeekDates, toISODateString, isEventOnDate } from "../utils";

interface CalendarDateStripProps {
  events: AcademicEventItem[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

interface DotRule {
  color: string;
  match: (e: AcademicEventItem) => boolean;
}

const DOT_RULES: DotRule[] = [
  { color: "#059669", match: (e) => e.isHoliday || e.category === "HOLIDAY" },
  { color: "#d97706", match: (e) => e.category === "EXAM" },
  { color: "#e11d48", match: (e) => e.category === "DEADLINE" || e.category === "REGISTRATION" },
  { color: "#ec4899", match: (e) => e.category === "MAKEUP_CLASS" },
  { color: "#9333ea", match: (e) => e.category === "RESULT" },
  { color: "#0284c7", match: (e) => e.category === "CLASS" },
  { color: "#6366f1", match: (e) => e.category === "ACADEMIC" },
];

const FALLBACK_DOT = "#0284c7";
const CARD_WIDTH = 58;
const CARD_GAP = 9;
const CARD_SPACING = CARD_WIDTH + CARD_GAP;

const getWeekStart = (): Date => {
  const d = new Date();
  return new Date(d.setDate(d.getDate() - d.getDay()));
};

export const CalendarDateStrip: React.FC<CalendarDateStripProps> = React.memo(
  ({ events, selectedDate, onSelectDate }) => {
    const scrollRef = useRef<ScrollView>(null);
    const [baseDate, setBaseDate] = useState<Date>(getWeekStart);

    const days: CalendarDayItem[] = useMemo(() => getWeekDates(baseDate, 14), [baseDate]);

    const dotsByDate = useMemo(() => {
      const map = new Map<string, string[]>();
      days.forEach((day) => {
        const dayEvents = events.filter((ev) => isEventOnDate(ev, day.dateString));
        if (!dayEvents.length) {
          map.set(day.dateString, []);
          return;
        }
        const colors = new Set<string>();
        for (const rule of DOT_RULES) {
          if (dayEvents.some(rule.match)) {
            colors.add(rule.color);
            if (colors.size >= 3) break;
          }
        }
        if (!colors.size) colors.add(FALLBACK_DOT);
        map.set(day.dateString, Array.from(colors));
      });
      return map;
    }, [days, events]);

    useEffect(() => {
      if (!selectedDate) return;
      const idx = days.findIndex((d) => d.dateString === selectedDate);
      if (idx < 0) return;
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ x: Math.max(0, idx * CARD_SPACING - 20), animated: true });
      }, 150);
      return () => clearTimeout(timer);
    }, [selectedDate, days]);

    const monthYearHeading = useMemo(() => {
      const d = days[3]?.date ?? baseDate;
      return d.toLocaleString("en-US", { month: "long", year: "numeric" });
    }, [days, baseDate]);

    const handlePrevWeek = useCallback(() => {
      setBaseDate((prev) => {
        const next = new Date(prev);
        next.setDate(next.getDate() - 7);
        return next;
      });
    }, []);

    const handleNextWeek = useCallback(() => {
      setBaseDate((prev) => {
        const next = new Date(prev);
        next.setDate(next.getDate() + 7);
        return next;
      });
    }, []);

    const handleJumpToToday = useCallback(() => {
      setBaseDate(getWeekStart());
      onSelectDate(toISODateString(new Date()));
    }, [onSelectDate]);

    const isViewingCurrentWeek = useMemo(() => {
      const todayStr = toISODateString(new Date());
      return days.some((d) => d.dateString === todayStr);
    }, [days]);

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.monthBox}>
            <Feather name="calendar" size={15} color={BENTO_COLORS.deepNavy} style={styles.calIcon} />
            <Text style={styles.monthText}>{monthYearHeading}</Text>
          </View>

          <View style={styles.navControls}>
            {!isViewingCurrentWeek && (
              <TouchableOpacity
                onPress={handleJumpToToday}
                style={styles.todayBtn}
                activeOpacity={0.75}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Jump to today"
              >
                <Text style={styles.todayBtnText}>Today</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handlePrevWeek}
              style={styles.arrowBtn}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Previous week"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="chevron-left" size={17} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNextWeek}
              style={styles.arrowBtn}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Next week"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="chevron-right" size={17} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stripContent}
          decelerationRate="fast"
        >
          {days.map((item) => {
            const isSelected = selectedDate === item.dateString;
            const dayDots = dotsByDate.get(item.dateString) ?? [];

            return (
              <TouchableOpacity
                key={item.dateString}
                style={[
                  styles.dayCard,
                  item.isToday && styles.dayCardToday,
                  isSelected && styles.dayCardSelected,
                  item.isToday && isSelected && styles.dayCardTodaySelected,
                ]}
                onPress={() => onSelectDate(item.dateString)}
                activeOpacity={0.75}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${item.isToday ? "Today, " : ""}${item.dayName}, ${item.dayNumber}${dayDots.length > 0 ? `, ${dayDots.length} events` : ""}${isSelected ? ", selected" : ""}`}
              >
                {item.isToday ? (
                  <View style={[styles.todayPill, isSelected && styles.todayPillSelected]}>
                    <Text style={[styles.todayPillText, isSelected && styles.todayPillTextSelected]}>
                      TODAY
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                    {item.dayName}
                  </Text>
                )}

                <Text
                  style={[
                    styles.dayNumber,
                    item.isToday && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {item.dayNumber}
                </Text>

                <View style={styles.dotSlot}>
                  {dayDots.length > 0 ? (
                    <View style={styles.dotsRow}>
                      {dayDots.map((color, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            { backgroundColor: color },
                            dayDots.length > 1 && styles.dotMulti,
                            isSelected && styles.dotOnSelected,
                          ]}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.dotSpacer} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={styles.scrollEndSpacer} />
        </ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  monthBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  calIcon: {
    marginRight: 6,
  },
  monthText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.2,
  },
  navControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginRight: 4,
  },
  todayBtnText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" } as any,
      default: { elevation: 1 },
    }),
  },
  stripContent: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: CARD_GAP,
    paddingVertical: 4,
  },
  scrollEndSpacer: {
    width: 12,
  },
  dayCard: {
    width: CARD_WIDTH,
    height: 80,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 6,
    ...Platform.select({
      web: { boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)", cursor: "pointer" } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  dayCardToday: {
    backgroundColor: "#f0f9ff",
    borderWidth: 2,
    borderColor: "#0284c7",
    ...Platform.select({
      web: { boxShadow: "0 2px 8px rgba(2, 132, 199, 0.15)" } as any,
      default: {
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  dayCardSelected: {
    backgroundColor: "#dbeafe",
    borderWidth: 2,
    borderColor: "#2563eb",
    ...Platform.select({
      web: { boxShadow: "0 4px 14px rgba(37, 99, 235, 0.22)" } as any,
      default: {
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  dayCardTodaySelected: {
    backgroundColor: "#dbeafe",
    borderWidth: 2,
    borderColor: "#0284c7",
    ...Platform.select({
      web: { boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)" } as any,
      default: {
        shadowColor: "#0284c7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  todayPill: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: "#bae6fd",
  },
  todayPillSelected: {
    backgroundColor: "#0284c7",
    borderColor: "#0284c7",
  },
  todayPillText: {
    fontFamily,
    fontSize: 8.5,
    fontWeight: "900",
    color: "#0284c7",
    letterSpacing: 0.4,
  },
  todayPillTextSelected: {
    color: "#ffffff",
  },
  dayName: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.3,
  },
  dayNameSelected: {
    color: "#1e40af",
    fontWeight: "800",
  },
  dayNumber: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -0.4,
  },
  dayNumberToday: {
    color: "#0369a1",
    fontWeight: "900",
  },
  dayNumberSelected: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 21,
  },
  dotSlot: {
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  dot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 2.75,
  },
  dotMulti: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
  dotOnSelected: {
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  dotSpacer: {
    height: 8,
  },
});
