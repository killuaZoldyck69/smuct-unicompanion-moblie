import React from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME, DAYS_OF_WEEK } from "../constants";
import { styles } from "../styles";

interface DayPickerModalProps {
  visible: boolean;
  selectedDay?: string;
  bottomInset: number;
  onSelectDay: (day: string) => void;
  onClose: () => void;
}

export const DayPickerModal = React.memo(function DayPickerModal({
  visible,
  selectedDay,
  bottomInset,
  onSelectDay,
  onClose,
}: DayPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        <TouchableOpacity
          style={styles.modalOverlayBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.modalDropdownSheet,
            { paddingBottom: Math.max(bottomInset + 20, 30) },
          ]}
        >
          <View style={styles.modalSheetHandle} />
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalSheetTitle}>Select Day of Week</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.sheetCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close day selector"
            >
              <Feather name="x" size={16} color={BENTO_THEME.slateMuted} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={DAYS_OF_WEEK}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = selectedDay === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.modalListItem,
                    isSelected && styles.modalListItemActive,
                  ]}
                  onPress={() => onSelectDay(item)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item}`}
                >
                  <Text
                    style={[
                      styles.modalListItemText,
                      isSelected && styles.modalListItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Feather
                      name="check"
                      size={18}
                      color={BENTO_THEME.blueIcon}
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
