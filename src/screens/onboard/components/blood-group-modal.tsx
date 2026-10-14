import React, { memo, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BLOOD_GROUPS, ONBOARD_COLORS } from "../constants";
import type { BloodGroupOption } from "../types";

interface BloodGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBloodGroup: (value: string) => void;
  selectedBloodGroup?: string;
}

export const BloodGroupModal = memo(function BloodGroupModal({
  visible,
  onClose,
  onSelectBloodGroup,
  selectedBloodGroup,
}: BloodGroupModalProps) {
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item }: { item: BloodGroupOption }) => {
      const isSelected = selectedBloodGroup === item.value;
      return (
        <TouchableOpacity
          style={[styles.item, isSelected && styles.itemSelected]}
          onPress={() => onSelectBloodGroup(item.value)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
            {item.label}
          </Text>
          {isSelected && (
            <Feather name="check" size={18} color={ONBOARD_COLORS.deepNavy} />
          )}
        </TouchableOpacity>
      );
    },
    [onSelectBloodGroup, selectedBloodGroup],
  );

  const keyExtractor = useCallback((item: BloodGroupOption) => item.value, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />
        <SafeAreaView edges={["bottom"]} style={styles.modalContent}>
          {/* Subtle Top Drag Indicator */}
          <View style={styles.dragIndicatorWrapper}>
            <View style={styles.dragIndicator} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Blood Group</Text>
            <TouchableOpacity
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close blood group selection"
            >
              <Feather name="x" size={24} color={ONBOARD_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={BLOOD_GROUPS}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
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
    height: "60%",
    maxHeight: "75%",
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
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: ONBOARD_COLORS.deepNavy,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: ONBOARD_COLORS.borderLight,
  },
  itemSelected: {
    backgroundColor: "rgba(19, 27, 46, 0.04)",
  },
  itemText: {
    fontSize: 18,
    fontWeight: "700",
    color: ONBOARD_COLORS.neutralText,
  },
  itemTextSelected: {
    color: ONBOARD_COLORS.deepNavy,
    fontWeight: "800",
  },
});
