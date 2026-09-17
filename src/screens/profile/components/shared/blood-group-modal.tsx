import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BLOOD_GROUPS, PROFILE_COLORS, fontFamily } from "../../constants";

interface BloodGroupModalProps {
  visible: boolean;
  selectedGroup: string;
  onSelect: (group: string) => void;
  onClose: () => void;
}

export const BloodGroupModal = React.memo(function BloodGroupModal({
  visible,
  selectedGroup,
  onSelect,
  onClose,
}: BloodGroupModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />
        <SafeAreaView edges={["bottom"]} style={styles.modalSheet}>
          <View style={styles.dragPillContainer}>
            <View style={styles.dragPill} />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select Blood Group</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close blood group selection"
            >
              <Feather name="x" size={20} color={PROFILE_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={BLOOD_GROUPS}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
            renderItem={({ item }) => {
              const isSelected = selectedGroup === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.groupRow,
                    isSelected && styles.groupRowSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Blood group ${item}${isSelected ? ", selected" : ""}`}
                >
                  <Text
                    style={[
                      styles.groupText,
                      isSelected && styles.groupTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Feather
                      name="check"
                      size={18}
                      color={PROFILE_COLORS.deepNavy}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalSheet: {
    backgroundColor: PROFILE_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    maxHeight: "75%",
    ...PROFILE_COLORS.shadow,
  },
  dragPillContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  sheetTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingTop: 4,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 6,
  },
  groupRowSelected: {
    backgroundColor: "#f1f5f9",
  },
  groupText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "600",
    color: PROFILE_COLORS.neutralText,
  },
  groupTextSelected: {
    fontWeight: "800",
    color: PROFILE_COLORS.deepNavy,
  },
});
