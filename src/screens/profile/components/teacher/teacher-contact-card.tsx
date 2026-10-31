import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import {
  PROFILE_COLORS,
  SPACING,
  BLOOD_GROUP_TO_UI,
  fontFamily,
} from "../../constants";
import { formatPhoneNumber } from "../../utils";

interface TeacherContactCardProps {
  phoneNumber: string;
  bloodGroup: string;
  dbBloodGroup?: string | null;
  profilePhone?: string | null;
  isEditing: boolean;
  onOpenBloodModal: () => void;
  onChangePhone: (val: string) => void;
}

export const TeacherContactCard = React.memo(function TeacherContactCard({
  phoneNumber,
  bloodGroup,
  dbBloodGroup,
  profilePhone,
  isEditing,
  onOpenBloodModal,
  onChangePhone,
}: TeacherContactCardProps) {
  const displayBloodGroup = dbBloodGroup
    ? BLOOD_GROUP_TO_UI[dbBloodGroup as keyof typeof BLOOD_GROUP_TO_UI] ||
      dbBloodGroup
    : "Not provided";
  const displayEditBloodGroup = bloodGroup
    ? BLOOD_GROUP_TO_UI[bloodGroup as keyof typeof BLOOD_GROUP_TO_UI] ||
      bloodGroup
    : "Select";
  const isBloodGroupRegistered = Boolean(dbBloodGroup || bloodGroup);
  const displayedPhone = profilePhone || phoneNumber;
  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const editablePhoneDigits = phoneDigits.startsWith("880")
    ? phoneDigits.slice(3, 13)
    : phoneDigits.slice(-10);

  const handleCall = async () => {
    const number = displayedPhone?.trim();
    if (!number) return;
    try {
      await Linking.openURL(`tel:${number.replace(/[^\d+]/g, "")}`);
    } catch {
      Toast.show({
        type: "error",
        text1: "Unable to start a call",
        text2: "Please check that calling is available on this device.",
      });
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>CONTACT & PERSONAL INFO</Text>

      <View style={styles.infoRow}>
        <View style={[styles.iconBadge, styles.phoneIconBadge]}>
          <Feather name="phone" size={16} color="#ea580c" />
        </View>
        <View style={styles.infoContent}>
          <Text style={[styles.infoLabel, styles.phoneLabel]}>PHONE NUMBER</Text>
          {isEditing ? (
            <View style={styles.phoneInputRow}>
              <Text style={styles.countryCode}>+880</Text>
              <TextInput
                style={styles.editInput}
                value={editablePhoneDigits}
                onChangeText={(value) => {
                  let digits = value.replace(/\D/g, "");
                  if (digits.startsWith("880")) digits = digits.slice(3);
                  else if (digits.startsWith("0") && digits.length === 11) {
                    digits = digits.slice(1);
                  }
                  onChangePhone(digits.slice(0, 10));
                }}
                placeholder="1643574457"
                keyboardType="number-pad"
                maxLength={10}
                placeholderTextColor={PROFILE_COLORS.mutedText}
                accessibilityLabel="Bangladesh phone number, 10 digits"
              />
            </View>
          ) : (
            <Text style={styles.infoValue}>
              {formatPhoneNumber(profilePhone) || "Not set"}
            </Text>
          )}
        </View>
        {!isEditing && !!profilePhone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Call ${formatPhoneNumber(profilePhone)}`}
          >
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        <View style={styles.phoneWatermark} pointerEvents="none">
          <Svg width={90} height={48} viewBox="0 0 90 48">
            <Path
              d="M1 27h17l8-10 9 20 10-28 9 25 8-11h27"
              fill="none"
              stroke="#f97316"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.12}
            />
          </Svg>
        </View>
      </View>

      <View style={[styles.infoRow, styles.bloodRow]}>
        <View style={[styles.iconBadge, styles.bloodIconBadge]}>
          <Ionicons name="water-outline" size={16} color="#e11d48" />
        </View>
        <View style={styles.infoContent}>
          <Text style={[styles.infoLabel, styles.bloodLabel]}>BLOOD GROUP</Text>
          <Text style={styles.donorStatus}>
            {isBloodGroupRegistered ? "Registered Donor" : "Not registered"}
          </Text>
        </View>
        {isEditing ? (
          <TouchableOpacity
            style={[styles.bloodSelect, styles.bloodGroupPill]}
            onPress={onOpenBloodModal}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Select blood group"
          >
            <Text style={styles.bloodGroupText}>{displayEditBloodGroup}</Text>
            <Feather name="chevron-down" size={12} color="#e11d48" />
          </TouchableOpacity>
        ) : (
          <View style={[styles.bloodGroupPill, styles.bloodGroupReadOnly]}>
            <Text style={styles.bloodGroupText}>{displayBloodGroup}</Text>
          </View>
        )}
        <View style={styles.bloodWatermark} pointerEvents="none">
          <Svg width={90} height={48} viewBox="0 0 90 48">
            <Path
              d="M1 27h14l7-9 8 18 9-27 9 24 7-10h8l6 8 7-14 6 10h7"
              fill="none"
              stroke="#e11d48"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.12}
            />
          </Svg>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.lg,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.7,
    marginBottom: SPACING.md,
  },
  infoRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#ffedd5",
    overflow: "hidden",
    position: "relative",
  },
  bloodRow: {
    marginTop: 10,
    backgroundColor: "#fff1f2",
    borderColor: "#ffe4e6",
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  phoneIconBadge: {
    backgroundColor: "#ffedd5",
  },
  bloodIconBadge: {
    backgroundColor: "#ffe4e6",
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
    zIndex: 1,
  },
  infoLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: "#8193ad",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  phoneLabel: {
    color: "#c2410c",
  },
  bloodLabel: {
    color: "#e11d48",
  },
  infoValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  donorStatus: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#334155",
  },
  editInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    paddingVertical: 2,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  countryCode: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#9a3412",
  },
  callButton: {
    minWidth: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    zIndex: 1,
  },
  callButtonText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  bloodSelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bloodGroupPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: "#ffe4e6",
    borderWidth: 1,
    borderColor: "#fecdd3",
    zIndex: 1,
  },
  bloodGroupReadOnly: {
    marginTop: 1,
  },
  bloodGroupText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#be123c",
  },
  phoneWatermark: {
    position: "absolute",
    right: 12,
    top: 8,
    zIndex: 0,
  },
  bloodWatermark: {
    position: "absolute",
    right: 12,
    top: 6,
    zIndex: 0,
  },
});
