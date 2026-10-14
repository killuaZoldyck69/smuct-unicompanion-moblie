import React, { memo, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { universityPrograms } from "@/data/programs";
import type { AcademicProgram } from "../types";
import { ONBOARD_COLORS } from "../constants";

interface ProgramSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProgram: (program: AcademicProgram) => void;
}

export const ProgramSelectModal = memo(function ProgramSelectModal({
  visible,
  onClose,
  onSelectProgram,
}: ProgramSelectModalProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return universityPrograms;
    return universityPrograms.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.faculty.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: AcademicProgram }) => (
      <TouchableOpacity
        style={styles.programItem}
        onPress={() => {
          onSelectProgram(item);
          setSearchQuery("");
        }}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.faculty}, ${item.department}`}
      >
        <Text style={styles.programName}>{item.name}</Text>
        <Text style={styles.programFaculty}>
          {item.faculty} • {item.department}
        </Text>
      </TouchableOpacity>
    ),
    [onSelectProgram],
  );

  const keyExtractor = useCallback((item: AcademicProgram) => item.id, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            setSearchQuery("");
            onClose();
          }}
          accessible={false}
        />

        {/* Sheet Content with Bottom Safe Area Edge */}
        <SafeAreaView edges={["bottom"]} style={styles.modalContent}>
          {/* Subtle Top Drag Indicator */}
          <View style={styles.dragIndicatorWrapper}>
            <View style={styles.dragIndicator} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Program</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                onClose();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close program selection"
            >
              <Feather name="x" size={24} color={ONBOARD_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <Feather
              name="search"
              size={18}
              color={ONBOARD_COLORS.placeholderText}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by program, dept or faculty..."
              placeholderTextColor={ONBOARD_COLORS.placeholderText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={filteredPrograms}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No programs matched "{searchQuery}"
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: ONBOARD_COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "82%",
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  dragIndicatorWrapper: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: ONBOARD_COLORS.deepNavy,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ONBOARD_COLORS.white,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: ONBOARD_COLORS.borderLight,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: ONBOARD_COLORS.neutralText,
    height: "100%",
  },
  programItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: ONBOARD_COLORS.borderLight,
  },
  programName: {
    fontSize: 16,
    fontWeight: "700",
    color: ONBOARD_COLORS.neutralText,
    marginBottom: 4,
  },
  programFaculty: {
    fontSize: 12,
    fontWeight: "600",
    color: ONBOARD_COLORS.placeholderText,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: ONBOARD_COLORS.placeholderText,
    fontWeight: "500",
  },
});
