import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, BLOOD_GROUPS, fontFamily } from "../constants";

export interface BloodFilterState {
  urgency: string; // "ALL" | "High" | "Standard"
  status: string;  // "ALL" | "ACTIVE" | "FULFILLED"
  bloodGroup: string; // "ALL" | "A_POSITIVE" | ...
  myPostsOnly: boolean;
}

interface BloodFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: BloodFilterState;
  onApply: (newFilters: BloodFilterState) => void;
  onReset: () => void;
  counts?: {
    total?: number;
    active?: number;
    urgent?: number;
    fulfilled?: number;
    myPosts?: number;
  };
}

export function BloodFilterModal({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
  counts,
}: BloodFilterModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [urgency, setUrgency] = useState(filters.urgency);
  const [status, setStatus] = useState(filters.status);
  const [bloodGroup, setBloodGroup] = useState(filters.bloodGroup);
  const [myPostsOnly, setMyPostsOnly] = useState(filters.myPostsOnly);

  useEffect(() => {
    if (visible) {
      setUrgency(filters.urgency);
      setStatus(filters.status);
      setBloodGroup(filters.bloodGroup);
      setMyPostsOnly(filters.myPostsOnly);
    }
  }, [visible, filters]);

  const activeCount =
    (urgency !== "ALL" ? 1 : 0) +
    (status !== "ALL" ? 1 : 0) +
    (bloodGroup !== "ALL" ? 1 : 0) +
    (myPostsOnly ? 1 : 0);

  const handleReset = () => {
    setUrgency("ALL");
    setStatus("ALL");
    setBloodGroup("ALL");
    setMyPostsOnly(false);
    onReset();
  };

  const handleApply = () => {
    onApply({
      urgency,
      status,
      bloodGroup,
      myPostsOnly,
    });
    onClose();
  };

  const bottomPadding =
    Math.max(insets.bottom, 20) + (Platform.OS === "android" ? 12 : 6);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View
          style={[
            styles.sheet,
            { maxHeight: Math.min(windowHeight * 0.88, 640) },
          ]}
        >
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Requests</Text>
              <Text style={styles.subtitle}>Refine emergency blood bank</Text>
            </View>

            <View style={styles.headerActions}>
              {activeCount > 0 && (
                <TouchableOpacity
                  style={styles.resetHeaderBtn}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetHeaderBtnText}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Close filters"
              >
                <Feather name="x" size={18} color={BENTO_COLORS.neutralText} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Status Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Request Status</Text>
              <View style={styles.optionsGrid}>
                {[
                  { key: "ALL", label: "All Requests", count: counts?.total },
                  { key: "ACTIVE", label: "Active Need", count: counts?.active },
                  { key: "FULFILLED", label: "Fulfilled", count: counts?.fulfilled },
                ].map((item) => {
                  const isSelected = status === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.chipBtn,
                        isSelected && styles.chipBtnSelected,
                      ]}
                      onPress={() => setStatus(item.key)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          isSelected && styles.chipBtnTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.count !== undefined && (
                        <View
                          style={[
                            styles.chipCountPill,
                            isSelected && styles.chipCountPillSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipCountText,
                              isSelected && styles.chipCountTextSelected,
                            ]}
                          >
                            {item.count}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Urgency Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Urgency Level</Text>
              <View style={styles.optionsGrid}>
                {[
                  { key: "ALL", label: "Any Urgency" },
                  { key: "High", label: "Urgent Only", icon: "alert-circle" },
                  { key: "Standard", label: "Standard Need" },
                ].map((item) => {
                  const isSelected = urgency === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.chipBtn,
                        isSelected && styles.chipBtnSelected,
                      ]}
                      onPress={() => setUrgency(item.key)}
                      activeOpacity={0.75}
                    >
                      {item.icon && (
                        <Feather
                          name={item.icon as any}
                          size={13}
                          color={isSelected ? "#ffffff" : BENTO_COLORS.crimson}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.chipBtnText,
                          isSelected && styles.chipBtnTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Blood Group Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Blood Group</Text>
              <View style={styles.bloodGroupGrid}>
                <TouchableOpacity
                  style={[
                    styles.bloodGroupTile,
                    bloodGroup === "ALL" && styles.bloodGroupTileSelected,
                  ]}
                  onPress={() => setBloodGroup("ALL")}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.bloodGroupTileText,
                      bloodGroup === "ALL" && styles.bloodGroupTileTextSelected,
                    ]}
                  >
                    All Groups
                  </Text>
                </TouchableOpacity>

                {BLOOD_GROUPS.map((bg) => {
                  const isSelected = bloodGroup === bg.value;
                  return (
                    <TouchableOpacity
                      key={bg.value}
                      style={[
                        styles.bloodGroupTile,
                        isSelected && styles.bloodGroupTileSelected,
                      ]}
                      onPress={() => setBloodGroup(bg.value)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.bloodGroupTileText,
                          isSelected && styles.bloodGroupTileTextSelected,
                        ]}
                      >
                        {bg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* My Requests Filter Toggle */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.toggleCard,
                  myPostsOnly && styles.toggleCardSelected,
                ]}
                onPress={() => setMyPostsOnly((prev) => !prev)}
                activeOpacity={0.8}
              >
                <View style={styles.toggleCardLeft}>
                  <View style={[styles.iconCircle, myPostsOnly && styles.iconCircleActive]}>
                    <Feather
                      name="user"
                      size={16}
                      color={myPostsOnly ? "#ffffff" : BENTO_COLORS.deepNavy}
                    />
                  </View>
                  <View>
                    <Text style={styles.toggleCardTitle}>My Blood Requests</Text>
                    <Text style={styles.toggleCardSub}>
                      Show requests submitted by your account
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    myPostsOnly && styles.checkboxSelected,
                  ]}
                >
                  {myPostsOnly && <Feather name="check" size={13} color="#ffffff" />}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Apply selected filters"
            >
              <Text style={styles.applyBtnText}>
                {activeCount > 0
                  ? `Apply Filters (${activeCount} active)`
                  : "Show All Requests"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: 18,
    fontFamily,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  subtitle: {
    fontSize: 12,
    fontFamily,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resetHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  resetHeaderBtnText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipBtnSelected: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  chipBtnText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  chipBtnTextSelected: {
    color: "#ffffff",
  },
  chipCountPill: {
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  chipCountPillSelected: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  chipCountText: {
    fontSize: 11,
    fontFamily,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
  },
  chipCountTextSelected: {
    color: "#ffffff",
  },
  bloodGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloodGroupTile: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 62,
    alignItems: "center",
  },
  bloodGroupTileSelected: {
    backgroundColor: BENTO_COLORS.crimson,
    borderColor: BENTO_COLORS.crimson,
  },
  bloodGroupTileText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  bloodGroupTileTextSelected: {
    color: "#ffffff",
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
  },
  toggleCardSelected: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  toggleCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleActive: {
    backgroundColor: BENTO_COLORS.crimson,
  },
  toggleCardTitle: {
    fontSize: 14,
    fontFamily,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  toggleCardSub: {
    fontSize: 11,
    fontFamily,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: BENTO_COLORS.crimson,
    borderColor: BENTO_COLORS.crimson,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    backgroundColor: BENTO_COLORS.white,
  },
  applyBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    fontSize: 15,
    fontFamily,
    fontWeight: "800",
    color: "#ffffff",
  },
});
