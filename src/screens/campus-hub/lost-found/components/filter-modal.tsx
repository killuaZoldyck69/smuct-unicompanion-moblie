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
import Toast from "react-native-toast-message";

import type {
  LostFoundType,
  LostFoundCategory,
} from "@/services/lost-found-service";
import type { User } from "@/types/auth";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

export type TypeFilter = "ALL" | LostFoundType;
export type StatusFilter = "ALL" | "ACTIVE" | "RESOLVED";

export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  typeFilter: TypeFilter;
  statusFilter: StatusFilter;
  categoryFilter: "ALL" | LostFoundCategory;
  myPostsOnly: boolean;
  onApply: (filters: {
    type: TypeFilter;
    status: StatusFilter;
    category: "ALL" | LostFoundCategory;
    myPosts: boolean;
  }) => void;
  onReset: () => void;
  currentUser: User | null;
}

const TYPE_OPTIONS: { key: TypeFilter; label: string; icon?: keyof typeof Feather.glyphMap }[] = [
  { key: "ALL", label: "All Items" },
  { key: "LOST", label: "Lost Items", icon: "search" },
  { key: "FOUND", label: "Found Items", icon: "gift" },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All Status" },
  { key: "ACTIVE", label: "Active Only" },
  { key: "RESOLVED", label: "Resolved" },
];

const CATEGORY_OPTIONS: { key: "ALL" | LostFoundCategory; label: string }[] = [
  { key: "ALL", label: "All Categories" },
  { key: "ID_CARD", label: "ID Card" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "KEYS", label: "Keys" },
  { key: "BOOKS", label: "Books" },
  { key: "CLOTHING", label: "Clothing" },
  { key: "OTHER", label: "Other" },
];

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

export function FilterModal({
  visible,
  onClose,
  typeFilter,
  statusFilter,
  categoryFilter,
  myPostsOnly,
  onApply,
  onReset,
  currentUser,
}: FilterModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [localType, setLocalType] = useState<TypeFilter>(typeFilter);
  const [localStatus, setLocalStatus] = useState<StatusFilter>(statusFilter);
  const [localCategory, setLocalCategory] = useState<"ALL" | LostFoundCategory>(categoryFilter);
  const [localMyPosts, setLocalMyPosts] = useState<boolean>(myPostsOnly);

  useEffect(() => {
    if (visible) {
      setLocalType(typeFilter);
      setLocalStatus(statusFilter);
      setLocalCategory(categoryFilter);
      setLocalMyPosts(myPostsOnly);
    }
  }, [visible, typeFilter, statusFilter, categoryFilter, myPostsOnly]);

  const activeCount =
    (localType !== "ALL" ? 1 : 0) +
    (localStatus !== "ALL" ? 1 : 0) +
    (localCategory !== "ALL" ? 1 : 0) +
    (localMyPosts ? 1 : 0);

  const handleReset = () => {
    setLocalType("ALL");
    setLocalStatus("ALL");
    setLocalCategory("ALL");
    setLocalMyPosts(false);
    onReset();
  };

  const handleApply = () => {
    onApply({
      type: localType,
      status: localStatus,
      category: localCategory,
      myPosts: localMyPosts,
    });
    onClose();
  };

  const toggleMyPosts = () => {
    if (!currentUser) {
      Toast.show({ type: "info", text1: "Sign in to filter your posts" });
      return;
    }
    setLocalMyPosts((prev) => !prev);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View
          style={[
            styles.sheetContainer,
            { maxHeight: Math.min(windowHeight * 0.88, 720) },
          ]}
        >
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Listings</Text>
              <Text style={styles.subtitle}>Refine lost and found posts</Text>
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
                accessibilityLabel="Close filter options"
              >
                <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.neutralText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Filters */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Section 1: Item Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Item Type</Text>
              <View style={styles.pillsRow}>
                {TYPE_OPTIONS.map((item) => {
                  const isSelected = localType === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                      ]}
                      onPress={() => setLocalType(item.key)}
                      activeOpacity={0.8}
                    >
                      {item.icon && (
                        <Feather
                          name={item.icon}
                          size={13}
                          color={isSelected ? "#ffffff" : CAMPUS_HUB_COLORS.subtleText}
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Listing Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listing Status</Text>
              <View style={styles.pillsRow}>
                {STATUS_OPTIONS.map((item) => {
                  const isSelected = localStatus === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                      ]}
                      onPress={() => setLocalStatus(item.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.wrapRow}>
                {CATEGORY_OPTIONS.map((item) => {
                  const isSelected = localCategory === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.categoryPillSelected,
                      ]}
                      onPress={() => setLocalCategory(item.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 4: My Posts Only */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.toggleCard,
                  localMyPosts && styles.toggleCardActive,
                ]}
                onPress={toggleMyPosts}
                activeOpacity={0.8}
              >
                <View style={styles.toggleCardLeft}>
                  <View
                    style={[
                      styles.toggleIconContainer,
                      localMyPosts && { backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={16}
                      color={localMyPosts ? ACCENT : CAMPUS_HUB_COLORS.subtleText}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleCardTitle}>My Posts Only</Text>
                    <Text style={styles.toggleCardDesc}>
                      Filter only items created by your account
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.checkboxCircle,
                    localMyPosts && styles.checkboxCircleActive,
                  ]}
                >
                  {localMyPosts && (
                    <Feather name="check" size={14} color="#ffffff" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Actions with Safe Area Bottom Padding */}
          <View
            style={[
              styles.footer,
              {
                paddingBottom:
                  Math.max(insets.bottom, 20) +
                  (Platform.OS === "android" ? 12 : 6),
              },
            ]}
          >
            <View style={styles.footerButtonsRow}>
              {activeCount > 0 && (
                <TouchableOpacity
                  style={styles.resetFooterBtn}
                  onPress={handleReset}
                  activeOpacity={0.7}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters"
                >
                  <Text style={styles.resetFooterBtnText}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.applyBtn,
                  activeCount > 0 && styles.applyBtnFlex,
                ]}
                onPress={handleApply}
                activeOpacity={0.85}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Apply filters"
              >
                <Text style={styles.applyBtnText}>
                  {activeCount > 0
                    ? `Apply Filters (${activeCount})`
                    : "Show Results"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handleBar: {
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
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  title: {
    fontSize: 18,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  subtitle: {
    fontSize: 12,
    fontFamily,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
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
    color: CAMPUS_HUB_COLORS.subtleText,
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
    paddingTop: 18,
    paddingBottom: 28,
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 10,
  },
  choicePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  choicePillSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  choicePillText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  choicePillTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryPill: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryPillSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  categoryPillText: {
    fontSize: 12,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  categoryPillTextSelected: {
    color: "#ffffff",
    fontWeight: "800",
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  toggleCardActive: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  toggleCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleCardTitle: {
    fontSize: 14,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  toggleCardDesc: {
    fontSize: 11,
    fontFamily,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCircleActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  footerButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resetFooterBtn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  resetFooterBtnText: {
    fontSize: 14,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  applyBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnFlex: {
    flex: 2,
  },
  applyBtnText: {
    fontSize: 15,
    fontFamily,
    fontWeight: "800",
    color: "#ffffff",
  },
});
