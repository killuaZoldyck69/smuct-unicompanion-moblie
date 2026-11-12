import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { BLOOD_GROUPS, PROFILE_COLORS, fontFamily } from "../../constants";
import { ProfileModalFrame } from "./profile-modal-frame";

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
    <ProfileModalFrame
      visible={visible}
      onClose={onClose}
      maxHeightRatio={0.78}
      cardStyle={styles.modalCard}
      backdropAccessibilityLabel="Close blood group selection"
    >
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Select Blood Group</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close blood group selection"
        >
          <Feather name="x" size={20} color={PROFILE_COLORS.deepNavy} />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={BLOOD_GROUPS}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
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
    </ProfileModalFrame>
  );
});

const styles = StyleSheet.create({
  modalCard: {
    maxWidth: 420,
    borderRadius: 20,
    padding: 18,
    ...PROFILE_COLORS.shadow,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flexGrow: 0,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  groupRowSelected: {
    backgroundColor: colors.slate100,
  },
  groupText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "500",
    color: PROFILE_COLORS.neutralText,
  },
  groupTextSelected: {
    fontWeight: "700",
    color: PROFILE_COLORS.deepNavy,
  },
});
