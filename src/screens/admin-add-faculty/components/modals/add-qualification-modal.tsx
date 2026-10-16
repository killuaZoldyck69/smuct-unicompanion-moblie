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
import { Qualification } from "../../types";

interface AddQualificationModalProps {
  visible: boolean;
  onAdd: (qual: Omit<Qualification, "id">) => void;
  onClose: () => void;
}

const COMMON_DEGREES = ["PhD", "M.Sc", "B.Sc", "M.Phil", "MBA", "MA", "BA"];

export const AddQualificationModal = React.memo(
  function AddQualificationModal({
    visible,
    onAdd,
    onClose,
  }: AddQualificationModalProps) {
    const insets = useSafeAreaInsets();
    const [degree, setDegree] = useState("PhD");
    const [field, setField] = useState("");
    const [institution, setInstitution] = useState("");

    const handleSave = () => {
      if (!degree.trim() || !field.trim() || !institution.trim()) {
        return;
      }
      onAdd({
        degree: degree.trim(),
        field: field.trim(),
        institution: institution.trim(),
      });
      setField("");
      setInstitution("");
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
                <Text style={styles.title}>Add Academic Qualification</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close qualification modal"
                >
                  <Feather
                    name="x"
                    size={20}
                    color={FACULTY_COLORS.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              {/* Degree selector chips */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Degree Level</Text>
                <View style={styles.degreeChips}>
                  {COMMON_DEGREES.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.degreeChip,
                        degree === d && styles.degreeChipActive,
                      ]}
                      onPress={() => setDegree(d)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${d}`}
                    >
                      <Text
                        style={[
                          styles.degreeChipText,
                          degree === d && styles.degreeChipTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Degree / Program Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ph.D. in Computer Science & Eng."
                  placeholderTextColor={FACULTY_COLORS.textMuted}
                  value={field}
                  onChangeText={setField}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Institution / University</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Bangladesh Univ. of Eng. & Tech (BUET)"
                  placeholderTextColor={FACULTY_COLORS.textMuted}
                  value={institution}
                  onChangeText={setInstitution}
                />
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel adding qualification"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    (!field.trim() || !institution.trim()) &&
                      styles.saveBtnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!field.trim() || !institution.trim()}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Save qualification"
                >
                  <Text style={styles.saveBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  },
);

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
  degreeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  degreeChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  degreeChipActive: {
    backgroundColor: FACULTY_COLORS.profileBadgeBg,
    borderWidth: 1,
    borderColor: FACULTY_COLORS.profileIconColor,
  },
  degreeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: FACULTY_COLORS.textSecondary,
  },
  degreeChipTextActive: {
    color: FACULTY_COLORS.profileIconColor,
    fontWeight: "700",
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
    marginTop: 8,
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
