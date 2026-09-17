import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicEventItem } from "@/services/calendar-service";
import { BENTO_COLORS, CATEGORY_CONFIG, fontFamily } from "../constants";
import { getMonthAndDay, calculateDurationDays } from "../utils";

interface TimelineEventCardProps {
  event: AcademicEventItem;
  isLast?: boolean;
  highlight?: boolean;
}

const CARD_ACCENT_STYLES: Partial<Record<string, object>> = {
  EXAM: { borderRightWidth: 3.5, borderRightColor: "#facc15" },
  REGISTRATION: { borderLeftWidth: 3.5, borderLeftColor: "#60a5fa" },
  HOLIDAY: { borderLeftWidth: 3.5, borderLeftColor: "#34d399" },
  DEADLINE: { borderRightWidth: 3.5, borderRightColor: "#fb7185" },
  MAKEUP_CLASS: { borderRightWidth: 3.5, borderRightColor: "#f43f5e" },
};

const DEFAULT_CARD_ACCENT = { borderLeftWidth: 3.5, borderLeftColor: "#93c5fd" };

const formatShortMonthDay = (dateStr?: string | null): string => {
  if (!dateStr) return "TBA";
  const { month, day } = getMonthAndDay(dateStr);
  const m = month.length > 0 ? month.charAt(0) + month.slice(1).toLowerCase() : "";
  return `${m} ${parseInt(day, 10)}`;
};

const getEventMonthYear = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  const m = dateStr.match(/^(\d{4})-(\d{2})/);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
  }
  return new Date(dateStr)
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
};

export const TimelineEventCard: React.FC<TimelineEventCardProps> = React.memo(
  ({ event, isLast, highlight }) => {
    const catConfig = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.ACADEMIC;
    const totalDays = calculateDurationDays(event.startDate, event.endDate);
    const isMultiDay =
      Boolean(event.endDate) &&
      event.startDate.substring(0, 10) !== event.endDate?.substring(0, 10);

    const cardAccentStyle =
      CARD_ACCENT_STYLES[event.category] ?? DEFAULT_CARD_ACCENT;

    return (
      <View style={styles.row}>
        <View style={styles.track}>
          <View style={[styles.line, isLast && styles.lineLast]} />
          <View style={[styles.nodeHalo, { backgroundColor: catConfig.bg }]}>
            <View style={[styles.nodeDot, { backgroundColor: catConfig.pillText }]} />
          </View>
        </View>

        <View style={styles.content}>
          {event.category === "MAKEUP_CLASS" ? (
            <View style={styles.makeupPill}>
              <Feather name="clock" size={11} color="#ffffff" style={styles.pillIcon} />
              <Text style={styles.makeupPillText}>MAKEUP CLASS</Text>
            </View>
          ) : event.isHoliday ? (
            <View style={styles.holidayPill}>
              <Feather name="sun" size={11} color="#047857" style={styles.pillIcon} />
              <Text style={styles.holidayPillText}>UNIVERSITY HOLIDAY</Text>
            </View>
          ) : null}

          <View
            style={[styles.card, cardAccentStyle, highlight && styles.cardHighlight]}
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`${event.title}, ${catConfig.label}, ${totalDays} ${totalDays === 1 ? "day" : "days"}.`}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.monthYear}>{getEventMonthYear(event.startDate)}</Text>
                <View style={styles.durationBadge}>
                  <Feather name="clock" size={10} color="#475569" style={styles.pillIcon} />
                  <Text style={styles.durationText}>
                    {totalDays} {totalDays === 1 ? "Day" : "Days"}
                  </Text>
                </View>
              </View>
              <View style={[styles.iconCircle, { backgroundColor: catConfig.pillBg }]}>
                <Feather name={catConfig.icon} size={14} color={catConfig.pillText} />
              </View>
            </View>

            <Text style={styles.title}>{event.title}</Text>
            {event.description ? (
              <Text style={styles.desc} numberOfLines={2}>
                {event.description}
              </Text>
            ) : null}

            {isMultiDay ? (
              <View style={styles.rangeFooter}>
                <View style={styles.rangeCol}>
                  <Text style={styles.rangeLabel}>Starts</Text>
                  <Text style={styles.rangeDate}>{formatShortMonthDay(event.startDate)}</Text>
                </View>
                <View style={styles.rangeCenter}>
                  <View style={styles.rangeLine} />
                  <View style={styles.rangeBadge}>
                    <Text style={styles.rangeBadgeText}>{totalDays} Days Total</Text>
                  </View>
                  <View style={styles.rangeLine} />
                </View>
                <View style={styles.rangeCol}>
                  <Text style={styles.rangeLabel}>Ends</Text>
                  <Text style={styles.rangeDate}>{formatShortMonthDay(event.endDate)}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.singleFooter}>
                <View style={[styles.singleDot, { backgroundColor: catConfig.pillText }]} />
                <Text style={styles.singleText}>
                  {formatShortMonthDay(event.startDate)} — {catConfig.label}
                </Text>
                <View style={styles.singleBadge}>
                  <Text style={styles.singleBadgeText}>1 Day</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  track: {
    width: 44,
    alignItems: "center",
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: -16,
    width: 2,
    backgroundColor: "#e2e8f0",
  },
  lineLast: {
    bottom: "50%",
  },
  nodeHalo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    zIndex: 2,
  },
  nodeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 4,
  },
  pillIcon: {
    marginRight: 5,
  },
  makeupPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f43f5e",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    marginBottom: 8,
    ...Platform.select({
      web: { boxShadow: "0 2px 8px rgba(244, 63, 94, 0.28)" } as any,
      default: { elevation: 2 },
    }),
  },
  makeupPillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  holidayPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  holidayPillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...Platform.select({
      web: { boxShadow: "0 3px 12px rgba(0, 0, 0, 0.04)" } as any,
      default: {
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
    }),
  },
  cardHighlight: {
    borderColor: "#93c5fd",
    backgroundColor: "#f8fafc",
    ...Platform.select({
      web: { boxShadow: "0 4px 16px rgba(59, 130, 246, 0.16)" } as any,
      default: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthYear: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  durationText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.2,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  desc: {
    fontFamily,
    fontSize: 12.5,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 12,
  },
  rangeFooter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  rangeCol: {
    alignItems: "flex-start",
  },
  rangeLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 2,
  },
  rangeDate: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  rangeCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  rangeLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#cbd5e1",
  },
  rangeBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bae6fd",
    marginHorizontal: 6,
  },
  rangeBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.3,
  },
  singleFooter: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 4,
  },
  singleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  singleText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
  },
  singleBadge: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  singleBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#475569",
  },
});
