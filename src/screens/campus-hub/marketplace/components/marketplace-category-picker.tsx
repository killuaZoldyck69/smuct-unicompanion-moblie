import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import type { MarketplaceCategory } from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import { MARKETPLACE_CATEGORIES, CategoryItem } from "../marketplace-constants";

interface MarketplaceCategoryPickerProps {
  value: MarketplaceCategory;
  onChange: (category: MarketplaceCategory) => void;
  label?: string;
  required?: boolean;
}

export function MarketplaceCategoryPicker({
  value,
  onChange,
  label = "CATEGORY",
  required = true,
}: MarketplaceCategoryPickerProps) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedItem = useMemo(() => {
    return (
      MARKETPLACE_CATEGORIES.find((c) => c.key === value) ||
      MARKETPLACE_CATEGORIES[0]
    );
  }, [value]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return MARKETPLACE_CATEGORIES;
    const q = search.toLowerCase();
    return MARKETPLACE_CATEGORIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSelect = (category: CategoryItem) => {
    onChange(category.key);
    setModalVisible(false);
    setSearch("");
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>
        {label} {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>

      {/* Selector Button */}
      <Pressable
        style={({ pressed }) => [
          styles.selectorBtn,
          pressed && { opacity: 0.85 },
        ]}
        android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Category: ${selectedItem.label}. Tap to change.`}
      >
        <View style={styles.selectorLeft}>
          <View style={styles.iconCircle}>
            <Feather
              name={selectedItem.icon}
              size={15}
              color={CAMPUS_HUB_COLORS.marketplaceAccentText}
            />
          </View>
          <Text style={styles.selectedLabel} numberOfLines={1}>
            {selectedItem.label}
          </Text>
        </View>
        <Feather
          name="chevron-down"
          size={18}
          color={CAMPUS_HUB_COLORS.subtleText}
        />
      </Pressable>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setSearch("");
        }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={CAMPUS_HUB_COLORS.white}
          translucent={true}
        />
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <View style={styles.modalInner}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  setSearch("");
                }}
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && { opacity: 0.72 },
                ]}
                android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close category picker"
                hitSlop={8}
              >
                <Feather
                  name="x"
                  size={18}
                  color={CAMPUS_HUB_COLORS.deepNavy}
                />
              </Pressable>
            </View>

            {/* Quick Search */}
            <View style={styles.searchWrapper}>
              <Feather
                name="search"
                size={15}
                color={CAMPUS_HUB_COLORS.subtleText}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search campus categories..."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                clearButtonMode="while-editing"
                accessibilityLabel="Search campus categories"
              />
            </View>

            {/* Category List */}
            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: Math.max(insets.bottom + 20, 28) },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredCategories.map((cat) => {
                const isSelected = cat.key === value;
                return (
                  <Pressable
                    key={cat.key}
                    style={({ pressed }) => [
                      styles.categoryRow,
                      isSelected && styles.categoryRowSelected,
                      pressed && { opacity: 0.8 },
                    ]}
                    android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                    onPress={() => handleSelect(cat)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${cat.label}, ${cat.description}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View
                      style={[
                        styles.rowIconCircle,
                        isSelected && styles.rowIconCircleSelected,
                      ]}
                    >
                      <Feather
                        name={cat.icon}
                        size={16}
                        color={
                          isSelected
                            ? CAMPUS_HUB_COLORS.white
                            : CAMPUS_HUB_COLORS.marketplaceAccentText
                        }
                      />
                    </View>

                    <View style={styles.rowTextCol}>
                      <Text
                        style={[
                          styles.rowTitle,
                          isSelected && styles.rowTitleSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                      <Text style={styles.rowDesc} numberOfLines={2}>
                        {cat.description}
                      </Text>
                    </View>

                    {isSelected && (
                      <Feather
                        name="check"
                        size={18}
                        color={CAMPUS_HUB_COLORS.marketplaceAccentText}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 11.5,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  requiredStar: {
    color: CAMPUS_HUB_COLORS.dangerText,
    fontWeight: "800",
  },
  selectorBtn: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: "hidden",
  },
  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  selectedLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
    includeFontPadding: false,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  modalInner: {
    flex: 1,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  searchWrapper: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily,
    color: CAMPUS_HUB_COLORS.neutralText,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  categoryRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
    overflow: "hidden",
  },
  categoryRowSelected: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    borderBottomColor: "transparent",
  },
  rowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rowIconCircleSelected: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  rowTextCol: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  rowTitleSelected: {
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
  },
  rowDesc: {
    fontSize: 12,
    fontFamily,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
    lineHeight: 16,
  },
});
