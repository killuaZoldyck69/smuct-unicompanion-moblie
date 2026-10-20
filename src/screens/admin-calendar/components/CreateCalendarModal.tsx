import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateAcademicCalendarInput } from "@/services/calendar-service";
import { FacultyProgramSelector } from "./FacultyProgramSelector";
import { BENTO_COLORS, SMUCT_SEMESTERS, SmuctSemester } from "../constants";

interface CreateCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (payload: CreateAcademicCalendarInput) => Promise<string | undefined>;
}

export const CreateCalendarModal: React.FC<CreateCalendarModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const insets = useSafeAreaInsets();
  const currentYear = new Date().getFullYear();
  const [title, setTitle] = useState("Summer 2026");
  const [semester, setSemester] = useState<SmuctSemester>("Summer");
  const [academicYear, setAcademicYear] = useState<string>(currentYear.toString());
  const [hasCustomTitle, setHasCustomTitle] = useState(false);
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [semesterDuration, setSemesterDuration] = useState("6 Months");
  const [targetBatch, setTargetBatch] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectSemester = (s: SmuctSemester) => {
    setSemester(s);
    if (!hasCustomTitle) {
      setTitle(`${s} ${academicYear || currentYear}`);
    }
  };

  const handleYearChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setAcademicYear(clean);
    if (!hasCustomTitle) {
      setTitle(`${semester} ${clean}`);
    }
  };

  const handleCreate = async () => {
    const finalYear = parseInt(academicYear, 10);
    if (!finalYear || isNaN(finalYear) || finalYear < 2000 || finalYear > 2100) {
      Alert.alert(
        "Invalid Academic Year",
        "Please enter a valid 4-digit academic year (e.g. 2026).",
      );
      return;
    }

    const finalTitle = title.trim() || `${semester} ${finalYear}`;

    try {
      setIsCreating(true);
      await onCreate({
        title: finalTitle,
        semester,
        academicYear: finalYear,
        targetFaculties: isGlobal ? [] : selectedFaculties,
        targetPrograms: isGlobal ? [] : selectedPrograms,
        semesterDuration,
        targetBatch: targetBatch.trim() || undefined,
        status: "DRAFT",
      });
      onClose();
      // Reset form
      setTitle(`Summer ${currentYear}`);
      setSemester("Summer");
      setAcademicYear(currentYear.toString());
      setHasCustomTitle(false);
      setIsGlobal(true);
      setSelectedFaculties([]);
      setSelectedPrograms([]);
      setTargetBatch("");
    } catch (err: any) {
      Alert.alert("Creation Failed", err.message || "Could not create calendar.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.modalOverlay,
          { paddingTop: Math.max(insets.top, 24) },
        ]}
      >
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>New Academic Calendar</Text>
              <Text style={styles.sheetSubtitle}>
                Create a fresh semester draft schedule
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Semester Selector (4 options) */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Semester Term <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <Text style={styles.fieldHint}>
                Select one of the 4 university term schedules
              </Text>
              <View style={styles.semesterRow}>
                {SMUCT_SEMESTERS.map((s) => {
                  const isSelected = semester === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.semesterPill,
                        isSelected && styles.semesterPillActive,
                      ]}
                      onPress={() => handleSelectSemester(s)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.semesterPillText,
                          isSelected && styles.semesterPillTextActive,
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Academic Year Input */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Academic Year <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 2026"
                placeholderTextColor="#94a3b8"
                value={academicYear}
                onChangeText={handleYearChange}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            {/* Calendar Title */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Calendar Title <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={`e.g. ${semester} ${academicYear || currentYear}`}
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  setHasCustomTitle(t.trim().length > 0);
                }}
              />
            </View>

            {/* Granular Scope Selector */}
            <FacultyProgramSelector
              isGlobal={isGlobal}
              onChangeIsGlobal={setIsGlobal}
              selectedPrograms={selectedPrograms}
              onChangeSelectedPrograms={setSelectedPrograms}
              selectedFaculties={selectedFaculties}
              onChangeSelectedFaculties={setSelectedFaculties}
              semesterDuration={semesterDuration}
              onChangeSemesterDuration={setSemesterDuration}
              targetBatch={targetBatch}
              onChangeTargetBatch={setTargetBatch}
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom + 14, 22) },
            ]}
          >
            <TouchableOpacity
              style={[styles.createBtn, isCreating && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              {isCreating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.createBtnText}>Create Draft Calendar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  sheetSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: "#dc2626",
    fontWeight: "800",
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#0f172a",
  },
  fieldHint: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  semesterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  semesterPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  semesterPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  semesterPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  semesterPillTextActive: {
    color: "#ffffff",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  createBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
