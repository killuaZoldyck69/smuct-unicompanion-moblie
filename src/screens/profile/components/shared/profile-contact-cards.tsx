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
import { colors } from "@/theme/colors";
import {
  BLOOD_GROUP_TO_UI,
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  fontFamily,
} from "../../constants";
import { formatPhoneNumber } from "../../utils";
import { resolveContactPhoneDigits } from "../../profile-form-logic";
import { WaveMotif } from "../illustrations/contact-motifs";

interface ProfileContactCardsProps {
  phoneNumber: string;
  bloodGroup: string;
  dbBloodGroup?: string | null;
  profilePhone?: string | null;
  isEditing?: boolean;
  emptyBloodLabel?: string;
  emptyPhoneLabel?: string;
  onOpenBloodModal?: () => void;
  onChangePhone?: (digits: string) => void;
}

export const ProfileContactCards = React.memo(function ProfileContactCards({
  phoneNumber,
  bloodGroup,
  dbBloodGroup,
  profilePhone,
  isEditing = false,
  emptyBloodLabel = "Not set",
  emptyPhoneLabel = "Not set",
  onOpenBloodModal,
  onChangePhone,
}: ProfileContactCardsProps) {
  const phoneDigits = resolveContactPhoneDigits({
    isEditing,
    draftPhone: phoneNumber,
    persistedPhone: profilePhone,
  });

  const hasBloodGroup = Boolean(dbBloodGroup);
  const displayBloodGroup = dbBloodGroup
    ? BLOOD_GROUP_TO_UI[dbBloodGroup as keyof typeof BLOOD_GROUP_TO_UI] ||
      dbBloodGroup
    : emptyBloodLabel;

  const displayEditBloodGroup = bloodGroup
    ? BLOOD_GROUP_TO_UI[bloodGroup as keyof typeof BLOOD_GROUP_TO_UI] ||
      bloodGroup
    : "Select";

  const formattedPhone = profilePhone ? formatPhoneNumber(profilePhone) : "";
  const hasPhone = Boolean(formattedPhone && formattedPhone !== "Not provided");

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
          <View style={[styles.iconBadge, styles.bloodIconBadge]}>
            <Ionicons
              name="water"
              size={14}
              color={SECTION_THEMES.BLOOD.primaryText}
            />
          </View>
          <Text
            style={[styles.cardTitle, { color: SECTION_THEMES.BLOOD.primaryText }]}
            numberOfLines={1}
          >
            BLOOD GROUP
          </Text>
        </View>

        {isEditing && onOpenBloodModal ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={onOpenBloodModal}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Select blood group"
          >
            <Text
              style={[
                styles.editBtnText,
                { color: SECTION_THEMES.BLOOD.primaryText },
              ]}
            >
              {displayEditBloodGroup}
            </Text>
            <Feather
              name="chevron-down"
              size={14}
              color={SECTION_THEMES.BLOOD.primaryText}
            />
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.bloodValue,
              !hasBloodGroup && styles.emptyValueText,
            ]}
            numberOfLines={1}
          >
            {displayBloodGroup}
          </Text>
        )}
      </View>

      {/* Phone Number Card */}
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
          <View style={[styles.iconBadge, styles.phoneIconBadge]}>
            <Feather
              name="phone"
              size={14}
              color={SECTION_THEMES.PHONE.primaryText}
            />
          </View>
          <Text
            style={[styles.cardTitle, { color: SECTION_THEMES.PHONE.primaryText }]}
            numberOfLines={1}
          >
            PHONE NUMBER
          </Text>
        </View>

        {isEditing && onChangePhone ? (
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
          <Text
            style={[styles.phoneValue, !hasPhone && styles.emptyValueText]}
            selectable={hasPhone}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.76}
          >
            {hasPhone ? formattedPhone : emptyPhoneLabel}
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
    minWidth: 0,
    minHeight: 116,
    justifyContent: "space-between",
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
    ...PROFILE_COLORS.shadow,
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
    gap: 8,
    zIndex: 1,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bloodIconBadge: {
    backgroundColor: SECTION_THEMES.BLOOD.badgeBg,
  },
  phoneIconBadge: {
    backgroundColor: SECTION_THEMES.PHONE.badgeBg,
  },
  cardTitle: {
    fontFamily,
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.7,
    zIndex: 1,
  },
  bloodValue: {
    fontFamily,
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: SECTION_THEMES.BLOOD.primaryText,
    zIndex: 1,
  },
  phoneValue: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: PROFILE_COLORS.deepNavy,
    zIndex: 1,
  },
  emptyValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.subtleText,
    letterSpacing: 0,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: 0,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    zIndex: 1,
  },
  countryCode: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: colors.semantic.amber.darkText,
  },
  editInput: {
    flex: 1,
    minWidth: 0,
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    paddingVertical: 2,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    zIndex: 1,
  },
  editBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
  },
});
