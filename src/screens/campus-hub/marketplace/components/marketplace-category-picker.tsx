import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { MarketplaceCategory } from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import {
  MARKETPLACE_CATEGORIES,
  CategoryItem,
} from "../marketplace-constants";

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
        c.description.toLowerCase().includes(q)
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
      <TouchableOpacity
        style={styles.selectorBtn}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.75}
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
          <Text style={styles.selectedLabel}>{selectedItem.label}</Text>
        </View>
        <Feather
          name="chevron-down"
          size={18}
          color={CAMPUS_HUB_COLORS.subtleText}
        />
      </TouchableOpacity>

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setModalVisible(false);
          setSearch("");
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearch("");
              }}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close category picker"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
            </TouchableOpacity>
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
              clearButtonMode="while-editing"
            />
          </View>

          {/* Category List */}
          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {filteredCategories.map((cat) => {
              const isSelected = cat.key === value;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryRow,
                    isSelected && styles.categoryRowSelected,
                  ]}
                  onPress={() => handleSelect(cat)}
                  activeOpacity={0.7}
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
                          ? "#ffffff"
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
                    <Text style={styles.rowDesc} numberOfLines={1}>
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
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    fontSize: 14,
    fontFamily,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(19, 27, 46, 0.08)",
  },
  modalTitle: {
    fontSize: 17,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily,
    color: CAMPUS_HUB_COLORS.neutralText,
    padding: 0,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(19, 27, 46, 0.04)",
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
    fontSize: 11.5,
    fontFamily,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
});
