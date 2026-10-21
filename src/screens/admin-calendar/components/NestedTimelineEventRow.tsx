import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AcademicEventItem } from "@/services/calendar-service";
import { cleanDateYmd } from "../utils/date-helpers";

interface NestedTimelineEventRowProps {
  event: AcademicEventItem;
  isLast?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const MONTH_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function getDateBlockInfo(startDateStr: string, endDateStr?: string | null) {
  const start = cleanDateYmd(startDateStr);
  const end = cleanDateYmd(endDateStr);

  const startParts = start.split("-");
  const mIdx = parseInt(startParts[1], 10) - 1;
  const month = MONTH_SHORT[mIdx] || "DATE";
  const startDay = parseInt(startParts[2], 10);

  if (!end || end === start) {
    return { month, dayText: String(startDay), isSpan: false };
  }

  const endParts = end.split("-");
  const endDay = parseInt(endParts[2], 10);
  return { month, dayText: `${startDay}–${endDay}`, isSpan: true };
}

function getVisualTheme(category: string, isHoliday: boolean, title: string) {
  const t = title.toLowerCase();

  // 1. High-priority functional categories
  // Check for Next Semester Commencement / Future Term Milestone
  if (
    t.includes("commencement") ||
    t.includes("next sem") ||
    t.includes("next semester")
  ) {
    return {
      dateBg: "#e0e7ff",
      dateColor: "#4338ca",
      pillBg: "#ede9fe",
      pillColor: "#6d28d9",
      pillLabel: "Next Term",
      subTag: t.includes("tentative") ? "Tentative" : null,
    };
  }

  if (category === "DEADLINE") {
    const isStrict = t.includes("drop") || t.includes("retake") || t.includes("registration");
    const isFee = t.includes("tuition") || t.includes("fee") || t.includes("payment");
    return {
      dateBg: "#fee2e2",
      dateColor: "#dc2626",
      pillBg: "#ffe4e6",
      pillColor: "#e11d48",
      pillLabel: isFee ? "Fee Deadline" : "Deadline",
      subTag: isStrict ? "STRICT" : null,
    };
  }

  if (category === "EXAM") {
    return {
      dateBg: "#fef3c7",
      dateColor: "#d97706",
      pillBg: "#fef9c3",
      pillColor: "#a16207",
      pillLabel: "Examination",
      subTag: t.includes("prep") ? "Prep Leave" : null,
    };
  }

  if (category === "ACADEMIC") {
    const isPrep = t.includes("prep") || t.includes("leave");
    const isModeration = t.includes("moderation") || t.includes("question");
    return {
      dateBg: isPrep ? "#fef3c7" : "#e0e7ff",
      dateColor: isPrep ? "#b45309" : "#4338ca",
      pillBg: isPrep ? "#fef9c3" : "#eef2ff",
      pillColor: isPrep ? "#92400e" : "#4f46e5",
      pillLabel: isPrep ? "Prep Leave" : isModeration ? "Moderation" : "Academic",
      subTag: null,
    };
  }

  if (category === "REGISTRATION") {
    return {
      dateBg: "#f3e8ff",
      dateColor: "#7e22ce",
      pillBg: "#f5f3ff",
      pillColor: "#6d28d9",
      pillLabel: "Registration",
      subTag: null,
    };
  }

  if (category === "MAKEUP_CLASS") {
    return {
      dateBg: "#fef3c7",
      dateColor: "#b45309",
      pillBg: "#f3e8ff",
      pillColor: "#7e22ce",
      pillLabel: "Makeup",
      subTag: null,
    };
  }

  if (category === "RESULT") {
    return {
      dateBg: "#ede9fe",
      dateColor: "#7c3aed",
      pillBg: "#f5f3ff",
      pillColor: "#6d28d9",
      pillLabel: "Result",
      subTag: null,
    };
  }

  // 2. Pure holiday category or marked holiday (when not covered by above specific categories)
  if (category === "HOLIDAY" || isHoliday) {
    return {
      dateBg: "#d1fae5",
      dateColor: "#059669",
      pillBg: "#dcfce7",
      pillColor: "#15803d",
      pillLabel: "Holiday",
      subTag: null,
    };
  }

  // 3. CLASS default
  return {
    dateBg: "#e0f2fe",
    dateColor: "#0284c7",
    pillBg: "#f0f9ff",
    pillColor: "#0369a1",
    pillLabel: "Class",
    subTag: t.includes("start") ? "Saturday Session" : null,
  };
}

export const NestedTimelineEventRow = React.memo(
  function NestedTimelineEventRow({
    event,
    isLast,
    onEdit,
    onDelete,
  }: NestedTimelineEventRowProps) {
    const dateInfo = getDateBlockInfo(event.startDate, event.endDate);
    const theme = getVisualTheme(event.category, event.isHoliday, event.title);

    // Dropdown state & positioning
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuCoords, setMenuCoords] = useState<{ top: number; right: number }>({
      top: 0,
      right: 16,
    });
    const moreBtnRef = useRef<View>(null);

    const handleOpenMenu = () => {
      if (moreBtnRef.current) {
        moreBtnRef.current.measureInWindow((x, y, width, height) => {
          const windowWidth = Dimensions.get("window").width;
          const windowHeight = Dimensions.get("window").height;
          const menuHeight = 95;

          if (typeof y === "number" && !isNaN(y) && y > 0) {
            let top = y + height + 4;
            let right = Math.max(16, windowWidth - (x + width));
            if (top + menuHeight > windowHeight - 20) {
              top = Math.max(20, y - menuHeight - 4);
            }
            setMenuCoords({ top, right });
          } else {
            setMenuCoords({ top: 120, right: 16 });
          }
          setIsMenuOpen(true);
        });
      } else {
        setMenuCoords({ top: 120, right: 16 });
        setIsMenuOpen(true);
      }
    };

    return (
      <View style={[styles.container, !isLast && styles.bottomBorder]}>
        {/* Left Date Circle / Capsule */}
        <View style={styles.leftCol}>
          <View
            style={[
              dateInfo.isSpan ? styles.dateCapsule : styles.dateCircle,
              { backgroundColor: theme.dateBg },
            ]}
          >
            <Text style={[styles.dateMonth, { color: theme.dateColor }]}>
              {dateInfo.month}
            </Text>
            <Text style={[styles.dateDay, { color: theme.dateColor }]}>
              {dateInfo.dayText}
            </Text>
          </View>
        </View>

        {/* Center Event Content (Full Title & Full Remarks) */}
        <View style={styles.centerCol}>
          {/* Category Pill & Optional Sub-tag */}
          <View style={styles.tagRow}>
            <View
              style={[styles.categoryPill, { backgroundColor: theme.pillBg }]}
            >
              <Text
                style={[styles.categoryPillText, { color: theme.pillColor }]}
              >
                {theme.pillLabel}
              </Text>
            </View>

            {theme.subTag && (
              <View
                style={[
                  styles.subTagPill,
                  theme.subTag === "STRICT" && styles.strictPill,
                ]}
              >
                <Text
                  style={[
                    styles.subTagText,
                    theme.subTag === "STRICT" && styles.strictText,
                  ]}
                >
                  {theme.subTag}
                </Text>
              </View>
            )}
          </View>

          {/* Full Title (No Ellipsis) */}
          <Text style={styles.title}>
            {event.title}
          </Text>

          {/* Full Remark / Description (No Ellipsis) */}
          {event.remarks ? (
            <Text style={styles.subtitle}>{event.remarks}</Text>
          ) : event.description ? (
            <Text style={styles.subtitle}>{event.description}</Text>
          ) : null}
        </View>

        {/* Right WhatsApp-Style 3-Dots Button */}
        <View style={styles.rightCol}>
          <TouchableOpacity
            ref={moreBtnRef}
            style={styles.moreBtn}
            onPress={handleOpenMenu}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Options for ${event.title}`}
          >
            <Feather name="more-vertical" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* WhatsApp-Style Floating Dropdown Popover */}
        <Modal
          visible={isMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
          >
            <View
              style={[
                styles.dropdownMenu,
                {
                  top: menuCoords.top,
                  right: menuCoords.right,
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {/* Edit Event */}
              <TouchableOpacity
                style={styles.dropdownItem}
                activeOpacity={0.7}
                onPress={() => {
                  setIsMenuOpen(false);
                  onEdit();
                }}
              >
                <View
                  style={[styles.dropdownIconBox, styles.dropdownIconBoxEdit]}
                >
                  <Feather name="edit-2" size={13} color="#0284c7" />
                </View>
                <Text style={styles.dropdownItemText}>Edit Event</Text>
              </TouchableOpacity>

              <View style={styles.dropdownDivider} />

              {/* Delete Event */}
              <TouchableOpacity
                style={styles.dropdownItem}
                activeOpacity={0.7}
                onPress={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
              >
                <View
                  style={[styles.dropdownIconBox, styles.dropdownIconBoxDelete]}
                >
                  <Feather name="trash-2" size={13} color="#e11d48" />
                </View>
                <Text
                  style={[
                    styles.dropdownItemText,
                    styles.dropdownItemTextDelete,
                  ]}
                >
                  Delete Event
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  leftCol: {
    marginRight: 12,
    paddingTop: 1,
  },
  dateCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  dateCapsule: {
    paddingHorizontal: 10,
    height: 48,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 54,
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dateDay: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  centerCol: {
    flex: 1,
    marginRight: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  subTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
  strictPill: {
    backgroundColor: "#dc2626",
  },
  subTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
  },
  strictText: {
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
  },
  rightCol: {
    paddingTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.15)",
  },
  dropdownMenu: {
    position: "absolute",
    minWidth: 155,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9,
  },
  dropdownIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  dropdownIconBoxEdit: {
    backgroundColor: "#e0f2fe",
  },
  dropdownIconBoxDelete: {
    backgroundColor: "#fff1f2",
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  dropdownItemTextDelete: {
    color: "#e11d48",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 3,
    marginHorizontal: 4,
  },
});
