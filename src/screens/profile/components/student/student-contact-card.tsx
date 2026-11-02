import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Svg, { G, Path } from "react-native-svg";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  BLOOD_GROUP_TO_UI,
  fontFamily,
} from "../../constants";
import { WaveMotif } from "../illustrations/contact-motifs";

interface StudentContactCardProps {
  phoneNumber: string;
  bloodGroup: string;
  dbBloodGroup?: string | null;
  profilePhone?: string | null;
  isEditing: boolean;
  onOpenBloodModal: () => void;
  onChangePhone: (val: string) => void;
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
  const phoneDigits = phoneNumber.replace(/\D/g, "").slice(-10);
  const displayBloodGroup = dbBloodGroup
    ? BLOOD_GROUP_TO_UI[dbBloodGroup as keyof typeof BLOOD_GROUP_TO_UI] || dbBloodGroup
    : "N/A";

  const displayEditBloodGroup = bloodGroup
      ? BLOOD_GROUP_TO_UI[bloodGroup as keyof typeof BLOOD_GROUP_TO_UI] || bloodGroup
      : "Select";

    return (
    <View style={styles.container}>
      {/* Blood Group Card */}
      <View style={styles.halfCard}>
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Svg
            width={116}
            height={96}
            viewBox="0 0 100 80"
            aria-hidden={true}
          >
            <G
              fill="none"
              stroke={SECTION_THEMES.BLOOD.primaryText}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.09}
            >
              <Path d="M50 72C40 63 11 46 11 27 11 10 34 4 50 22 66 4 89 10 89 27c0 19-29 36-39 45Z" />
              <Path d="M8 46h23l9-10 9 20 9-30 9 20h25" />
            </G>
          </Svg>
        </View>
        <View style={styles.headerRow}>
          <View style={[styles.iconBadge, { backgroundColor: SECTION_THEMES.BLOOD.badgeBg }]}>
            <Ionicons name="water" size={14} color={SECTION_THEMES.BLOOD.primaryText} />
          </View>
          <Text style={[styles.cardTitle, { color: SECTION_THEMES.BLOOD.primaryText }]}>
            BLOOD GROUP
          </Text>
        </View>
        
        {isEditing ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={onOpenBloodModal}
            activeOpacity={0.7}
          >
            <Text style={[styles.editBtnText, { color: SECTION_THEMES.BLOOD.primaryText }]}>
              {displayEditBloodGroup}
            </Text>
            <Feather name="chevron-down" size={14} color={SECTION_THEMES.BLOOD.primaryText} />
          </TouchableOpacity>
        ) : (
          <Text style={[styles.cardValue, { color: SECTION_THEMES.BLOOD.primaryText }]}>
            {displayBloodGroup}
          </Text>
        )}
      </View>

      {/* Phone Card */}
      <View style={styles.halfCard}>
        <View style={styles.watermarkContainer} pointerEvents="none">
          <WaveMotif
            width={118}
            height={100}
            opacity={0.09}
            color={SECTION_THEMES.PHONE.primaryText}
          />
        </View>
        <View style={styles.headerRow}>
          <View style={[styles.iconBadge, { backgroundColor: SECTION_THEMES.PHONE.badgeBg }]}>
            <Feather name="phone" size={14} color={SECTION_THEMES.PHONE.primaryText} />
          </View>
          <Text style={[styles.cardTitle, { color: SECTION_THEMES.PHONE.primaryText }]}>
            PHONE NUMBER
          </Text>
        </View>
        
        {isEditing ? (
          <View style={styles.phoneInputRow}>
            <Text style={styles.countryCode}>+880</Text>
            <TextInput
              style={styles.editInput}
              value={phoneDigits}
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
              accessibilityLabel="Bangladesh phone number, 10 digits after +880"
            />
          </View>
        ) : (
          <Text style={[styles.cardValue, { color: PROFILE_COLORS.deepNavy }]}>
            {profilePhone || "Not set"}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.cardGap,
  },
  halfCard: {
    flex: 1,
    minHeight: 116,
    justifyContent: "space-between",
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.md,
    shadowColor: PROFILE_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    position: "relative",
    overflow: "hidden",
  },
  watermarkContainer: {
    position: "absolute",
    right: -8,
    bottom: -12,
    zIndex: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    zIndex: 1,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontFamily,
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    zIndex: 1,
  },
  cardValue: {
    fontFamily,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
    zIndex: 1,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: 0,
    zIndex: 1,
  },
  countryCode: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  editInput: {
    flex: 1,
    minWidth: 0,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    paddingVertical: 4,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    zIndex: 1,
  },
  editBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
  }
});
