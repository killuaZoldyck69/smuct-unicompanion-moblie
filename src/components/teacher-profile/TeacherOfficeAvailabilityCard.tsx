import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

export interface TeacherOfficeProfile {
  officeRoom?: string | null;
  dayOff?: string | null;
  consultationSlots?: any | null;
}

export interface TeacherOfficeAvailabilityCardProps {
  profile?: TeacherOfficeProfile | null;
  phoneNumber?: string | null;
}

export const TeacherOfficeAvailabilityCard = React.memo(
  ({ profile, phoneNumber }: TeacherOfficeAvailabilityCardProps) => {
    const officeRoomDisplay = profile?.officeRoom || "Faculty Room 408";
    const dayOffDisplay = profile?.dayOff || "Thursday";

    // Parse consultation slots or provide mockup defaults
    const consultationList: Array<{ days: string; time: string }> = React.useMemo(() => {
      if (Array.isArray(profile?.consultationSlots) && profile.consultationSlots.length > 0) {
        return profile.consultationSlots.map((s: any) => ({
          days: s.days || s.day || "Mon, Wed",
          time: s.time || (s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : "10:00 AM – 12:30 PM"),
        }));
      }

      // Default representation
      return [
        { days: "Mon, Wed", time: "10:00 AM – 12:30 PM" },
        { days: "Sunday", time: "02:00 PM – 04:00 PM" },
      ];
    }, [profile?.consultationSlots]);

    const handleCall = useCallback(() => {
      if (!phoneNumber) return;
      const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
      Linking.openURL(`tel:${cleanNumber}`).catch(() => {
        Toast.show({
          type: "error",
          text1: "Cannot place call",
          text2: "Unable to dial phone number on this device.",
        });
      });
    }, [phoneNumber]);

    const handleCopy = useCallback(async () => {
      if (!phoneNumber) return;
      await Clipboard.setStringAsync(phoneNumber);
      Toast.show({
        type: "success",
        text1: "Phone number copied",
        text2: phoneNumber,
      });
    }, [phoneNumber]);

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

        {/* Phone Number Box */}
        <View style={styles.phoneCardBox}>
          <View style={styles.phoneLeft}>
            <View style={styles.phoneIconBox}>
              <Feather name="phone" size={15} color="#16A34A" />
            </View>
            <View style={styles.phoneTextContainer}>
              <Text style={styles.phoneLabel}>PHONE NUMBER</Text>
              <Text
                style={[
                  styles.phoneValue,
                  !phoneNumber && styles.phoneValuePlaceholder,
                ]}
                numberOfLines={1}
                selectable={true}
              >
                {phoneNumber || "Not provided"}
              </Text>
            </View>
          </View>

          {Boolean(phoneNumber) && (
            <View style={styles.phoneActionsRow}>
              <TouchableOpacity
                style={styles.phoneActionBtnCopy}
                onPress={handleCopy}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Copy phone number"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="copy" size={13} color="#15803D" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.phoneActionBtnCall}
                onPress={handleCall}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Call phone number"
              >
                <Feather name="phone-call" size={12} color="#FFFFFF" />
                <Text style={styles.phoneActionBtnCallText}>Call</Text>
              </TouchableOpacity>
            </View>
          )}
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
  phoneCardBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 13,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  phoneLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  phoneIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  phoneTextContainer: {
    flex: 1,
  },
  phoneLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  phoneValue: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  phoneValuePlaceholder: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
  },
  phoneActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phoneActionBtnCopy: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  phoneActionBtnCall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  phoneActionBtnCallText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
