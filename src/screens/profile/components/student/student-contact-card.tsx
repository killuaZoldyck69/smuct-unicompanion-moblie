import React from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  PROFILE_COLORS,
  SECTION_THEMES,
  SPACING,
  BLOOD_GROUP_TO_UI,
  fontFamily,
} from "../../constants";
import { DropMotif, WaveMotif } from "../illustrations/contact-motifs";

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
          <DropMotif width={60} height={60} opacity={0.08} color={SECTION_THEMES.BLOOD.primaryText} />
        </View>
        <View style={styles.headerRow}>
          <View style={[styles.iconBadge, { backgroundColor: SECTION_THEMES.BLOOD.badgeBg }]}>
            <Ionicons name="water" size={14} color={SECTION_THEMES.BLOOD.primaryText} />
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: SECTION_THEMES.BLOOD.primaryText }]}>
          BLOOD GROUP
        </Text>
        
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
          <WaveMotif width={60} height={60} opacity={0.08} color={SECTION_THEMES.PHONE.primaryText} />
        </View>
        <View style={styles.headerRow}>
          <View style={[styles.iconBadge, { backgroundColor: SECTION_THEMES.PHONE.badgeBg }]}>
            <Feather name="phone" size={14} color={SECTION_THEMES.PHONE.primaryText} />
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: SECTION_THEMES.PHONE.primaryText }]}>
          PHONE NUMBER
        </Text>
        
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={phoneNumber}
            onChangeText={onChangePhone}
            placeholder="016..."
            keyboardType="phone-pad"
            placeholderTextColor={PROFILE_COLORS.mutedText}
          />
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
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.lg,
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
    right: -10,
    bottom: -10,
    zIndex: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    zIndex: 1,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    zIndex: 1,
  },
  cardValue: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.4,
    zIndex: 1,
  },
  editInput: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.deepNavy,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 1,
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
