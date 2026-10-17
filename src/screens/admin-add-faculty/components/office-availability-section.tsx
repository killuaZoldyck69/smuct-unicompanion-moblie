import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FACULTY_COLORS } from "../constants";
import { AddFacultyFormData, SelectorType } from "../types";

interface OfficeAvailabilitySectionProps {
  formData: AddFacultyFormData;
  updateField: <K extends keyof AddFacultyFormData>(
    field: K,
    value: AddFacultyFormData[K],
  ) => void;
  setActiveSelector: (type: SelectorType) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  onOpenSlotModal: () => void;
  onRemoveSlot: (id: string) => void;
  onOpenBatchModal?: () => void;
  onFocusBatch?: () => void;
  onBlurBatch?: () => void;
}

export const OfficeAvailabilitySection = React.memo(
  function OfficeAvailabilitySection({
    formData,
    updateField,
    setActiveSelector,
    isExpanded,
    setIsExpanded,
    onOpenSlotModal,
    onRemoveSlot,
    onFocusBatch,
    onBlurBatch,
  }: OfficeAvailabilitySectionProps) {
    return (
      <View style={styles.card}>
        {/* Section Header */}
        <TouchableOpacity
          style={styles.headerRow}
          onPress={() => setIsExpanded((prev) => !prev)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Office & availability section"
        >
          <View style={styles.titleGroup}>
            <View style={styles.iconBox}>
              <Feather
                name="calendar"
                size={18}
                color={FACULTY_COLORS.officeIconColor}
              />
            </View>
            <Text style={styles.sectionTitle}>Office & Availability</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>OPTIONAL</Text>
            </View>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={FACULTY_COLORS.officeIconColor}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.contentContainer}>
            {/* Row 1: Office Room & Day Off */}
            <View style={styles.twoColumnRow}>
              {/* Office Room (Number only) */}
              <View style={styles.halfBox}>
                <Text style={styles.miniLabel}>OFFICE ROOM</Text>
                <TextInput
                  style={styles.boxInput}
                  placeholder="e.g. 408"
                  placeholderTextColor={FACULTY_COLORS.textMuted}
                  value={formData.officeRoom}
                  onChangeText={(text) =>
                    updateField("officeRoom", text.replace(/\D/g, ""))
                  }
                  keyboardType="numeric"
                  maxLength={10}
                  accessible={true}
                  accessibilityLabel="Office room number"
                />
              </View>

              {/* Official Day Off (String selector) */}
              <TouchableOpacity
                style={styles.halfBox}
                onPress={() => setActiveSelector("dayOff")}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Select official day off"
              >
                <Text style={styles.miniLabel}>DAY OFF</Text>
                <Text
                  style={[
                    styles.boxValueText,
                    !formData.dayOff && styles.placeholderText,
                  ]}
                  numberOfLines={1}
                >
                  {formData.dayOff || "Select day off"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Weekly Consultation Hours */}
            <View style={styles.consultationCard}>
              <View style={styles.consultationHeaderRow}>
                <Text style={styles.miniLabel}>WEEKLY CONSULTATION HOURS</Text>
                <TouchableOpacity
                  onPress={onOpenSlotModal}
                  style={styles.addSlotBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add consultation slot"
                >
                  <Feather
                    name="plus"
                    size={14}
                    color={FACULTY_COLORS.officeIconColor}
                  />
                  <Text style={styles.addSlotBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              {formData.consultationSlots.length === 0 ? (
                <Text style={styles.emptySlotText}>
                  No consultation hours added yet
                </Text>
              ) : (
                <View style={styles.slotsList}>
                  {formData.consultationSlots.map((slot) => (
                    <View key={slot.id} style={styles.slotChip}>
                      <View style={styles.slotDot} />
                      <Text style={styles.slotChipText}>
                        {slot.day}: {slot.startTime} – {slot.endTime}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onRemoveSlot(slot.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove slot for ${slot.day}`}
                      >
                        <Feather
                          name="x"
                          size={14}
                          color={FACULTY_COLORS.officeIconColor}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Assigned Advisory Batch (Number only direct input field) */}
            <View style={styles.batchBox}>
              <View style={styles.batchHeaderRow}>
                <Text style={styles.miniLabel}>ASSIGNED ADVISORY BATCH</Text>
              </View>
              <View style={styles.batchInputWrapper}>
                <Feather
                  name="users"
                  size={16}
                  color={FACULTY_COLORS.officeIconColor}
                  style={styles.batchIcon}
                />
                <TextInput
                  style={styles.batchInput}
                  placeholder="e.g. 58"
                  placeholderTextColor={FACULTY_COLORS.textMuted}
                  value={formData.advisoryBatch}
                  onChangeText={(text) =>
                    updateField("advisoryBatch", text.replace(/\D/g, ""))
                  }
                  keyboardType="numeric"
                  maxLength={10}
                  onFocus={onFocusBatch}
                  onBlur={onBlurBatch}
                  accessible={true}
                  accessibilityLabel="Assigned advisory batch"
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: FACULTY_COLORS.officeCardBg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.officeCardBorder,
    padding: 20,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: FACULTY_COLORS.officeIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FACULTY_COLORS.textPrimary,
  },
  headerRight: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  badge: {
    backgroundColor: FACULTY_COLORS.officeBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: FACULTY_COLORS.officeBadgeText,
    letterSpacing: 0.4,
  },
  contentContainer: {
    marginTop: 18,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfBox: {
    flex: 1,
    backgroundColor: FACULTY_COLORS.officeBoxBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.officeBoxBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: FACULTY_COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  boxInput: {
    fontSize: 14,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  boxValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
    marginTop: 2,
  },
  placeholderText: {
    color: FACULTY_COLORS.textMuted,
    fontWeight: "400",
  },
  consultationCard: {
    backgroundColor: FACULTY_COLORS.officeBoxBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.officeBoxBorder,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  consultationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addSlotBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: FACULTY_COLORS.slotChipBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  addSlotBtnText: {
    fontSize: 8,
    fontWeight: "700",
    color: FACULTY_COLORS.officeIconColor,
  },
  emptySlotText: {
    fontSize: 13,
    color: FACULTY_COLORS.textMuted,
    fontStyle: "italic",
    marginVertical: 4,
  },
  slotsList: {
    gap: 8,
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.slotChipBg,
    borderWidth: 1,
    borderColor: FACULTY_COLORS.slotChipBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  slotDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: FACULTY_COLORS.slotDot,
  },
  slotChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: FACULTY_COLORS.slotChipText,
  },
  batchBox: {
    backgroundColor: FACULTY_COLORS.officeBoxBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.officeBoxBorder,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  batchHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  batchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: FACULTY_COLORS.inputBorder,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
  },
  batchIcon: {
    marginRight: 8,
  },
  batchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
    paddingVertical: 0,
  },
});
