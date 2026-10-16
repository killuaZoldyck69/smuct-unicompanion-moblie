import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { FACULTY_COLORS } from "../../constants";

interface AddExpertiseModalProps {
  visible: boolean;
  onAdd: (field: string) => void;
  onClose: () => void;
}

const POPULAR_FIELDS = [
  "Cybersecurity",
  "Cloud Computing",
  "Mobile App Development",
  "Computer Vision",
  "Database Systems",
  "Software Engineering",
  "Blockchain",
  "Bioinformatics",
];

export const AddExpertiseModal = React.memo(function AddExpertiseModal({
  visible,
  onAdd,
  onClose,
}: AddExpertiseModalProps) {
  const insets = useSafeAreaInsets();
  const [field, setField] = useState("");

  const handleSave = (customField?: string) => {
    const val = customField || field;
    if (!val.trim()) return;
    onAdd(val.trim());
    setField("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 16, 24),
          },
        ]}
      >
        {/* Backdrop touch to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
          pointerEvents="box-none"
        >
          <View style={styles.dialog}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Expertise / Research</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close expertise modal"
              >
                <Feather
                  name="x"
                  size={20}
                  color={FACULTY_COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Field or Topic Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Artificial Intelligence"
                placeholderTextColor={FACULTY_COLORS.textMuted}
                value={field}
                onChangeText={setField}
                autoFocus={true}
                onSubmitEditing={() => handleSave()}
              />
            </View>

            {/* Popular Suggestions */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionTitle}>Suggestions:</Text>
              <View style={styles.suggestionChips}>
                {POPULAR_FIELDS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.chip}
                    onPress={() => handleSave(item)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${item}`}
                  >
                    <Text style={styles.chipText}>+ {item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel adding expertise"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !field.trim() && styles.saveBtnDisabled,
                ]}
                onPress={() => handleSave()}
                disabled={!field.trim()}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Save expertise field"
              >
                <Text style={styles.saveBtnText}>Add Field</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  keyboardContainer: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: FACULTY_COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: FACULTY_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.inputBorder,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 14,
    color: FACULTY_COLORS.textPrimary,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: FACULTY_COLORS.textSecondary,
    marginBottom: 8,
  },
  suggestionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: FACULTY_COLORS.profileIconColor,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: FACULTY_COLORS.textSecondary,
  },
  saveBtn: {
    backgroundColor: FACULTY_COLORS.profileIconColor,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
