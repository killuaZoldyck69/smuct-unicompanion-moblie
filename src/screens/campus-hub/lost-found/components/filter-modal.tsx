import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { colors } from "@/theme/colors";
import type {
  LostFoundType,
  LostFoundCategory,
} from "@/services/lost-found-service";
import { LOST_FOUND_CATEGORY_OPTIONS } from "@/features/campus-hub/lost-found-logic";
import type { User } from "@/features/auth/types";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";

export type TypeFilter = "ALL" | LostFoundType;
export type StatusFilter = "ALL" | "ACTIVE" | "RESOLVED" | "CLOSED";

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

const TYPE_OPTIONS: {
  key: TypeFilter;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
}[] = [
  { key: "ALL", label: "All Items" },
  { key: "LOST", label: "Lost Items", icon: "search" },
  { key: "FOUND", label: "Found Items", icon: "gift" },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All Status" },
  { key: "ACTIVE", label: "Active Only" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "CLOSED", label: "Closed" },
];

const CATEGORY_OPTIONS: { key: "ALL" | LostFoundCategory; label: string }[] = [
  { key: "ALL", label: "All Categories" },
  ...LOST_FOUND_CATEGORY_OPTIONS,
];

const ACCENT_FILL = CAMPUS_HUB_COLORS.lostFoundAccentFill;
const ACCENT_TEXT = CAMPUS_HUB_COLORS.lostFoundAccentText;

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
  const [localCategory, setLocalCategory] = useState<"ALL" | LostFoundCategory>(
    categoryFilter,
  );
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
        <Pressable
          style={StyleSheet.absoluteFill}
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
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.title} numberOfLines={1}>
                Filter Listings
              </Text>
              <Text style={styles.subtitle}>Refine lost and found posts</Text>
            </View>
            <View style={styles.headerActions}>
              {activeCount > 0 && (
                <Pressable
                  style={({ pressed }) => [
                    styles.resetHeaderBtn,
                    pressed && { opacity: 0.78 },
                  ]}
                  onPress={handleReset}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Reset selected filters"
                >
                  <Text style={styles.resetHeaderBtnText}>Reset</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && { opacity: 0.78 },
                ]}
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                android_ripple={{
                  color: CAMPUS_HUB_COLORS.androidRipple,
                  borderless: true,
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Close filter options"
              >
                <Feather
                  name="x"
                  size={20}
                  color={CAMPUS_HUB_COLORS.neutralText}
                />
              </Pressable>
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
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => setLocalType(item.key)}
                      android_ripple={{
                        color: isSelected
                          ? CAMPUS_HUB_COLORS.androidRippleLight
                          : CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Item type: ${item.label}`}
                    >
                      {item.icon && (
                        <Feather
                          name={item.icon}
                          size={13}
                          color={
                            isSelected
                              ? CAMPUS_HUB_COLORS.white
                              : CAMPUS_HUB_COLORS.subtleText
                          }
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                        maxFontSizeMultiplier={1.25}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
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
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => setLocalStatus(item.key)}
                      android_ripple={{
                        color: isSelected
                          ? CAMPUS_HUB_COLORS.androidRippleLight
                          : CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Listing status: ${item.label}`}
                    >
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                        maxFontSizeMultiplier={1.25}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
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
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.categoryPill,
                        isSelected && styles.categoryPillSelected,
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => setLocalCategory(item.key)}
                      android_ripple={{
                        color: isSelected
                          ? CAMPUS_HUB_COLORS.androidRippleLight
                          : CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Category: ${item.label}`}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextSelected,
                        ]}
                        maxFontSizeMultiplier={1.25}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Section 4: My Posts Only */}
            <View style={styles.section}>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleCard,
                  localMyPosts && styles.toggleCardActive,
                  pressed && { opacity: 0.88 },
                ]}
                onPress={toggleMyPosts}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible
                accessibilityRole="switch"
                accessibilityState={{ checked: localMyPosts }}
                accessibilityLabel="My Posts Only. Filter only items created by your account"
              >
                <View style={styles.toggleCardLeft}>
                  <View
                    style={[
                      styles.toggleIconContainer,
                      localMyPosts && {
                        backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
                      },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={16}
                      color={
                        localMyPosts ? ACCENT_TEXT : CAMPUS_HUB_COLORS.subtleText
                      }
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
                    <Feather
                      name="check"
                      size={14}
                      color={CAMPUS_HUB_COLORS.white}
                    />
                  )}
                </View>
              </Pressable>
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
                <Pressable
                  style={({ pressed }) => [
                    styles.resetFooterBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleReset}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters"
                >
                  <Text style={styles.resetFooterBtnText}>Reset</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.applyBtn,
                  activeCount > 0 && styles.applyBtnFlex,
                  pressed && { opacity: 0.88 },
                ]}
                onPress={handleApply}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Apply filters"
              >
                <Text style={styles.applyBtnText} maxFontSizeMultiplier={1.25}>
                  {activeCount > 0
                    ? `Apply Filters (${activeCount})`
                    : "Show Results"}
                </Text>
              </Pressable>
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
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.slate300,
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
    fontFamily: titleFontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
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
    gap: 10,
  },
  resetHeaderBtn: {
    minHeight: 38,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.slate100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  resetHeaderBtnText: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.mutedInk,
    includeFontPadding: false,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.slate100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
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
    flexWrap: "wrap",
    gap: 10,
  },
  choicePill: {
    minWidth: "47%",
    flexGrow: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: "hidden",
  },
  choicePillSelected: {
    backgroundColor: ACCENT_FILL,
    borderColor: ACCENT_FILL,
  },
  choicePillText: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  choicePillTextSelected: {
    color: CAMPUS_HUB_COLORS.white,
    fontWeight: "700",
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryPill: {
    minHeight: 40,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    justifyContent: "center",
    overflow: "hidden",
  },
  categoryPillSelected: {
    backgroundColor: ACCENT_FILL,
    borderColor: ACCENT_FILL,
  },
  categoryPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  categoryPillTextSelected: {
    color: CAMPUS_HUB_COLORS.white,
    fontWeight: "800",
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: "hidden",
  },
  toggleCardActive: {
    backgroundColor: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.border,
  },
  toggleCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  toggleIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slate200,
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
    fontSize: 11.5,
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
    borderColor: colors.slate300,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCircleActive: {
    backgroundColor: ACCENT_FILL,
    borderColor: ACCENT_FILL,
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
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: colors.slate100,
    borderWidth: 1,
    borderColor: colors.slate200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  resetFooterBtnText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  applyBtn: {
    flex: 1,
    minHeight: 48,
    backgroundColor: ACCENT_FILL,
    paddingVertical: 13,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  applyBtnFlex: {
    flex: 2,
  },
  applyBtnText: {
    fontSize: 15,
    lineHeight: 19,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
});
