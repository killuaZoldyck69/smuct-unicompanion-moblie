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

interface EditBatchModalProps {
  visible: boolean;
  currentBatch: string;
  onSave: (batch: string) => void;
  onClose: () => void;
}

export const EditBatchModal = React.memo(function EditBatchModal({
  visible,
  currentBatch,
  onSave,
  onClose,
}: EditBatchModalProps) {
  const insets = useSafeAreaInsets();
  const [batch, setBatch] = useState(currentBatch || "");

  const handleSave = () => {
    onSave(batch.trim());
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
              <Text style={styles.title}>Assigned Advisory Batch</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close batch modal"
              >
                <Feather
                  name="x"
                  size={20}
                  color={FACULTY_COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Batch Identifier</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Batch 58 (CSE) or 58"
                placeholderTextColor={FACULTY_COLORS.textMuted}
                value={batch}
                onChangeText={setBatch}
                autoFocus={true}
                onSubmitEditing={handleSave}
              />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel batch edit"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Save batch identifier"
              >
                <Text style={styles.saveBtnText}>Save</Text>
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
    marginBottom: 16,
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
    backgroundColor: FACULTY_COLORS.submitBtn,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
