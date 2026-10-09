import React, { useState, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../../constants";

export type FilterStatus = "PENDING" | "ALL" | "APPROVED" | "REJECTED";

interface AdminFilterModalProps {
  visible: boolean;
  onClose: () => void;
  activeFilter: FilterStatus;
  onApplyFilter: (status: FilterStatus) => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface FilterOptionConfig {
  key: FilterStatus;
  label: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
}

const FILTER_OPTIONS: FilterOptionConfig[] = [
  {
    key: "PENDING",
    label: "Pending Requests",
    subtitle: "Waiting for admin review & approval",
    icon: "clock",
    color: BENTO.amber,
    bgColor: BENTO.amberBg,
  },
  {
    key: "ALL",
    label: "All Requests",
    subtitle: "View all reservation records",
    icon: "layers",
    color: BENTO.navy,
    bgColor: BENTO.slateSubtle,
  },
  {
    key: "APPROVED",
    label: "Approved Bookings",
    subtitle: "Active & live on public schedule",
    icon: "check-circle",
    color: BENTO.emerald,
    bgColor: BENTO.emeraldBg,
  },
  {
    key: "REJECTED",
    label: "Rejected Requests",
    subtitle: "Declined reservation requests",
    icon: "x-circle",
    color: BENTO.rose,
    bgColor: BENTO.roseBg,
  },
];

export const AdminFilterModal = memo(function AdminFilterModal({
  visible,
  onClose,
  activeFilter,
  onApplyFilter,
  counts,
}: AdminFilterModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [tempFilter, setTempFilter] = useState<FilterStatus>(activeFilter);

  useEffect(() => {
    if (visible) {
      setTempFilter(activeFilter);
    }
  }, [visible, activeFilter]);

  const handleApply = () => {
    onApplyFilter(tempFilter);
    onClose();
  };

  const handleReset = () => {
    setTempFilter("ALL");
    onApplyFilter("ALL");
    onClose();
  };

  const bottomPadding = Math.max(insets.bottom, 16) + (Platform.OS === "android" ? 4 : 0);
  const maxSheetHeight = Math.min(windowHeight - insets.top - 24, 560);

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              maxHeight: maxSheetHeight,
              paddingBottom: bottomPadding,
            },
          ]}
        >
          {/* Top Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.title}>Filter Requests</Text>
              <Text style={styles.subtitle}>
                Filter field bookings by review status
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close filter modal"
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color={BENTO.navy} />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <ScrollView
            style={styles.optionsList}
            contentContainerStyle={styles.optionsListContent}
            showsVerticalScrollIndicator={false}
          >
            {FILTER_OPTIONS.map((opt) => {
              const isSelected = tempFilter === opt.key;
              const count =
                opt.key === "PENDING"
                  ? counts.pending
                  : opt.key === "APPROVED"
                    ? counts.approved
                    : opt.key === "REJECTED"
                      ? counts.rejected
                      : counts.all;

              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setTempFilter(opt.key)}
                  style={[
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                  ]}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${opt.label}, ${count} requests`}
                >
                  {/* Left Icon */}
                  <View
                    style={[
                      styles.iconBox,
                      isSelected
                        ? { backgroundColor: opt.color }
                        : { backgroundColor: opt.bgColor },
                    ]}
                  >
                    <Feather
                      name={opt.icon}
                      size={17}
                      color={isSelected ? "#ffffff" : opt.color}
                    />
                  </View>

                  {/* Text Information */}
                  <View style={styles.optionTextCol}>
                    <View style={styles.labelRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <View
                        style={[
                          styles.countBadge,
                          isSelected
                            ? styles.countBadgeSelected
                            : { backgroundColor: opt.bgColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.countBadgeText,
                            isSelected
                              ? styles.countBadgeTextSelected
                              : { color: opt.color },
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                  </View>

                  {/* Radio Checkmark */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Feather name="check" size={13} color="#ffffff" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetBtn}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Reset all filters"
            >
              <Text style={styles.resetBtnText}>Reset to All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              style={styles.applyBtn}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Apply filter"
            >
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: BENTO.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Platform.select({
      web: {
        boxShadow: "0 -8px 30px rgba(15, 23, 42, 0.15)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: BENTO.slate,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    marginTop: 8,
  },
  optionsListContent: {
    paddingVertical: 6,
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: BENTO.border,
  },
  optionRowSelected: {
    backgroundColor: "rgba(30, 41, 59, 0.03)",
    borderColor: BENTO.navy,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionTextCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
  },
  optionLabelSelected: {
    color: BENTO.navy,
    fontWeight: "800",
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  countBadgeSelected: {
    backgroundColor: BENTO.navy,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  countBadgeTextSelected: {
    color: "#ffffff",
  },
  optionSubtitle: {
    fontSize: 11.5,
    color: BENTO.slate,
    marginTop: 2,
    fontWeight: "500",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioCircleSelected: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.06)",
  },
  resetBtn: {
    flex: 1,
    backgroundColor: BENTO.slateSubtle,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navySecondary,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: BENTO.navy,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
