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
import { BENTO } from "../constants";
import {
  CalendarStripDay,
  getScheduleWeekDates,
  toISODateString,
} from "../utils";

interface ScheduleDateStripProps {
  scheduledDatesSet: Set<string>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  selectedDayBookingsCount?: number;
}

const CARD_WIDTH = 58;
const CARD_GAP = 9;
const CARD_SPACING = CARD_WIDTH + CARD_GAP;

const getWeekStart = (): Date => {
  const d = new Date();
  return new Date(d.setDate(d.getDate() - d.getDay()));
};

export const ScheduleDateStrip = React.memo(function ScheduleDateStrip({
  scheduledDatesSet,
  selectedDate,
  onSelectDate,
  selectedDayBookingsCount,
}: ScheduleDateStripProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [baseDate, setBaseDate] = useState<Date>(getWeekStart);

  const days: CalendarStripDay[] = useMemo(
    () => getScheduleWeekDates(baseDate, 14),
    [baseDate],
  );

  useEffect(() => {
    if (!selectedDate) return;
    const idx = days.findIndex((d) => d.dateString === selectedDate);
    if (idx < 0) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: Math.max(0, idx * CARD_SPACING - 20),
        animated: true,
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedDate, days]);

  const monthYearHeading = useMemo(() => {
    const selectedItem = days.find((d) => d.dateString === selectedDate);
    const d = selectedItem?.date ?? days[3]?.date ?? baseDate;
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [days, selectedDate, baseDate]);

  const handlePrevWeek = useCallback(() => {
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
    if (selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const curr = new Date(y, m - 1, d);
      curr.setDate(curr.getDate() - 7);
      onSelectDate(toISODateString(curr));
    }
  }, [selectedDate, onSelectDate]);

  const handleNextWeek = useCallback(() => {
    setBaseDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
    if (selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const curr = new Date(y, m - 1, d);
      curr.setDate(curr.getDate() + 7);
      onSelectDate(toISODateString(curr));
    }
  }, [selectedDate, onSelectDate]);

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
      {/* Month Header & Navigation */}
      <View style={styles.headerRow}>
        <View style={styles.monthBox}>
          <Feather
            name="calendar"
            size={14.5}
            color={BENTO.navy}
            style={styles.calIcon}
          />
          <Text style={styles.monthText}>{monthYearHeading}</Text>

          {typeof selectedDayBookingsCount === "number" && (
            <View
              style={[
                styles.bookedBadge,
                selectedDayBookingsCount > 0
                  ? styles.bookedBadgeActive
                  : styles.bookedBadgeOpen,
              ]}
            >
              <Text
                style={[
                  styles.bookedBadgeText,
                  selectedDayBookingsCount > 0
                    ? styles.bookedBadgeTextActive
                    : styles.bookedBadgeTextOpen,
                ]}
              >
                {selectedDayBookingsCount > 0
                  ? `${selectedDayBookingsCount} Booked`
                  : "Open"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.navControls}>
          {!isViewingCurrentWeek && (
            <TouchableOpacity
              onPress={handleJumpToToday}
              style={styles.todayBtn}
              activeOpacity={0.75}
              accessible={true}
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
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={17} color={BENTO.navy} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextWeek}
            style={styles.arrowBtn}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Next week"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-right" size={17} color={BENTO.navy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Date Strip Scroll */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripContent}
        decelerationRate="fast"
      >
        {days.map((item) => {
          const isSelected = selectedDate === item.dateString;
          const hasBookings = scheduledDatesSet.has(item.dateString);

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
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${item.isToday ? "Today, " : ""}${item.dayName}, ${item.dayNumber}${hasBookings ? ", has reservations" : ""}${isSelected ? ", selected" : ""}`}
            >
              {item.isToday ? (
                <View
                  style={[
                    styles.todayPill,
                    isSelected && styles.todayPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.todayPillText,
                      isSelected && styles.todayPillTextSelected,
                    ]}
                  >
                    TODAY
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.dayNameSelected,
                  ]}
                >
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

              {/* Indicator Dot Slot */}
              <View style={styles.dotSlot}>
                {hasBookings ? (
                  <View
                    style={[
                      styles.dot,
                      isSelected && styles.dotSelected,
                    ]}
                  />
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
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: BENTO.canvas,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  monthBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  calIcon: {
    marginRight: 6,
  },
  monthText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  bookedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
  bookedBadgeActive: {
    backgroundColor: BENTO.emeraldBg,
    borderColor: BENTO.emeraldBorder,
  },
  bookedBadgeOpen: {
    backgroundColor: BENTO.indigoBg,
    borderColor: BENTO.indigoBorder,
  },
  bookedBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  bookedBadgeTextActive: {
    color: BENTO.emerald,
  },
  bookedBadgeTextOpen: {
    color: BENTO.indigo,
  },
  navControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayBtn: {
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.indigoBorder,
  },
  todayBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO.indigo,
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stripContent: {
    paddingHorizontal: 20,
    gap: CARD_GAP,
    paddingBottom: 6,
  },
  dayCard: {
    width: CARD_WIDTH,
    height: 78,
    backgroundColor: BENTO.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 4px rgba(15, 23, 42, 0.04)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
      },
    }),
  },
  dayCardToday: {
    borderColor: BENTO.navy,
  },
  dayCardSelected: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.18)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      },
    }),
  },
  dayCardTodaySelected: {
    backgroundColor: BENTO.navy,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.slate,
    letterSpacing: 0.2,
  },
  dayNameSelected: {
    color: "#94a3b8",
  },
  todayPill: {
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  todayPillSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  todayPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: BENTO.indigo,
    letterSpacing: 0.3,
  },
  todayPillTextSelected: {
    color: "#ffffff",
  },
  dayNumber: {
    fontSize: 19,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.5,
  },
  dayNumberToday: {
    color: BENTO.navy,
  },
  dayNumberSelected: {
    color: "#ffffff",
  },
  dotSlot: {
    height: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: BENTO.emerald,
  },
  dotSelected: {
    backgroundColor: "#34d399",
  },
  dotSpacer: {
    width: 5.5,
    height: 5.5,
  },
  scrollEndSpacer: {
    width: 6,
  },
});
