import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        <View style={styles.modalSheet}>
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
        </View>
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
  modalSheet: {
    backgroundColor: PROFILE_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "60%",
    ...PROFILE_COLORS.shadow,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
