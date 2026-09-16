import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  BLOOD_GROUP_TO_UI,
  fontFamily,
} from "../../constants";
import { formatPhoneNumber } from "../../utils";

interface StudentContactCardProps {
  phoneNumber: string;
  bloodGroup: string;
  dbBloodGroup?: string | null;
  profilePhone?: string | null;
  isEditing: boolean;
  onOpenBloodModal: () => void;
  onChangePhone: (phone: string) => void;
}

export const StudentContactCard = React.memo(function StudentContactCard({
  phoneNumber,
  bloodGroup,
  dbBloodGroup,
  profilePhone,
  isEditing,
  onOpenBloodModal,
  onChangePhone,
}: StudentContactCardProps) {
  const theme = SECTION_THEMES.CONTACT;

  const displayBloodGroup = dbBloodGroup
    ? BLOOD_GROUP_TO_UI[dbBloodGroup] || "N/A"
    : "N/A";

  return (
    <View style={styles.safetyRow}>
      {/* Blood Group Tile */}
      <View style={[styles.card, styles.safetyTile]}>
        <View style={styles.safetyCenter}>
          <View style={styles.safetyIconCircle}>
            <Feather name="droplet" size={18} color={theme.iconColor} />
          </View>
          <Text style={styles.safetyLabel}>BLOOD GROUP</Text>
          {isEditing ? (
            <TouchableOpacity
              onPress={onOpenBloodModal}
              style={styles.editPillBtn}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Select blood group"
            >
              <Text style={styles.editPillText}>{bloodGroup || "Select"}</Text>
              <Feather
                name="chevron-down"
                size={13}
                color={theme.primaryText}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ) : (
            <Text style={styles.bloodGroupValue}>{displayBloodGroup}</Text>
          )}
        </View>
      </View>

      {/* Emergency Phone Tile */}
      <View style={[styles.card, styles.safetyTile]}>
        <View style={styles.safetyCenter}>
          <View style={styles.safetyIconCircle}>
            <Feather name="phone" size={18} color={theme.iconColor} />
          </View>
          <Text style={styles.safetyLabel}>PHONE NUMBER</Text>
          {isEditing ? (
            <View style={styles.phoneInputWrapper}>
              <TextInput
                style={styles.safetyInput}
                value={phoneNumber}
                onChangeText={onChangePhone}
                keyboardType="phone-pad"
                placeholder="01XXX-XXXXXX"
                placeholderTextColor={PROFILE_COLORS.mutedText}
                accessible={true}
                accessibilityLabel="Phone number input"
              />
            </View>
          ) : (
            <Text style={styles.phoneValue}>
              {formatPhoneNumber(profilePhone)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  safetyRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.cardGap,
  },
  card: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    borderWidth: 1,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  safetyTile: {
    flex: 1,
    borderColor: SECTION_THEMES.CONTACT.badgeBorder,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  safetyIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: SECTION_THEMES.CONTACT.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  safetyLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  bloodGroupValue: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: SECTION_THEMES.CONTACT.iconColor,
    letterSpacing: -0.3,
  },
  editPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: PROFILE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: SECTION_THEMES.CONTACT.badgeBorder,
  },
  editPillText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: SECTION_THEMES.CONTACT.primaryText,
  },
  phoneInputWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 118,
    marginTop: 2,
  },
  phoneValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    textAlign: "center",
  },
  safetyInput: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
    textAlign: "center",
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },
});
