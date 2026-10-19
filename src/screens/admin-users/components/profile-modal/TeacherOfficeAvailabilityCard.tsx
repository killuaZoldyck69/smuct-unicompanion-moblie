import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { TeacherProfile } from "../../types";

interface TeacherOfficeAvailabilityCardProps {
  profile?: TeacherProfile | null;
}

export const TeacherOfficeAvailabilityCard = React.memo(
  ({ profile }: TeacherOfficeAvailabilityCardProps) => {
    const officeRoomDisplay = profile?.officeRoom || "Faculty Room 408";
    const dayOffDisplay = profile?.dayOff || "Thursday";

    // Parse consultation slots or provide mockup defaults
    const consultationList: Array<{ days: string; time: string }> = React.useMemo(() => {
      if (Array.isArray(profile?.consultationSlots) && profile.consultationSlots.length > 0) {
        return profile.consultationSlots.map((s: any) => ({
          days: s.days || s.day || "Mon, Wed",
          time: s.time || "10:00 AM – 12:30 PM",
        }));
      }

      if (profile?.consultationHours) {
        const parts = profile.consultationHours.split(/[;\n]/);
        if (parts.length > 0 && parts[0].includes(":")) {
          return parts
            .map((p) => {
              const [d, ...t] = p.split(":");
              return {
                days: d?.trim() || "Consultation",
                time: t.join(":").trim() || "By Appointment",
              };
            })
            .filter((item) => item.days && item.time);
        }
        return [
          { days: "Weekly Hours", time: profile.consultationHours },
        ];
      }

      // Default representation
      return [
        { days: "Mon, Wed", time: "10:00 AM – 12:30 PM" },
        { days: "Sunday", time: "02:00 PM – 04:00 PM" },
      ];
    }, [profile?.consultationSlots, profile?.consultationHours]);

    return (
      <View style={styles.cardContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Feather name="clock" size={14} color="#16A34A" />
            </View>
            <Text style={styles.headerTitle}>OFFICE & AVAILABILITY</Text>
          </View>
        </View>

        {/* 2-Column Grid: Office Room & Day Off */}
        <View style={styles.twoColRow}>
          {/* Office Room Box */}
          <View style={styles.subCardBox}>
            <Text style={styles.subCardLabel}>OFFICE ROOM</Text>
            <Text style={styles.officeRoomValue} numberOfLines={1}>
              {officeRoomDisplay}
            </Text>
          </View>

          {/* Day Off Box */}
          <View style={styles.subCardBox}>
            <Text style={styles.subCardLabel}>DAY OFF</Text>
            <Text style={styles.dayOffValue} numberOfLines={1}>
              {dayOffDisplay}
            </Text>
          </View>
        </View>

        {/* Weekly Consultation Hours Section */}
        <View style={styles.consultationCardBox}>
          <Text style={styles.consultationTitle}>WEEKLY CONSULTATION HOURS</Text>
          {consultationList.map((slot, index) => (
            <View
              key={index}
              style={[
                styles.consultationRow,
                index === consultationList.length - 1 && styles.lastConsultationRow,
              ]}
            >
              <Text style={styles.consultationDays}>{slot.days}</Text>
              <View style={styles.timePill}>
                <Text style={styles.timePillText}>{slot.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.2,
    borderColor: "#BBF7D0",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.8,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  subCardBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  subCardLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  officeRoomValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 4,
  },
  dayOffValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#EF4444",
    marginVertical: 4,
  },
  consultationCardBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  consultationTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  consultationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  lastConsultationRow: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  consultationDays: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  timePill: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timePillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#15803D",
  },
});
