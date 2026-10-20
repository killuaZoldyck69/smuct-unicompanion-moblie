import React, { useState, useEffect } from "react";
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
import { AcademicCalendarItem } from "@/services/calendar-service";
import { FacultyProgramSelector } from "./FacultyProgramSelector";
import { BENTO_COLORS } from "../constants";

interface EditAudienceModalProps {
  visible: boolean;
  calendar: AcademicCalendarItem;
  onClose: () => void;
  onSave: (payload: {
    title?: string;
    targetFaculties: string[];
    targetPrograms: string[];
    semesterDuration: string;
    targetBatch: string;
  }) => Promise<void>;
}

export const EditAudienceModal: React.FC<EditAudienceModalProps> = ({
  visible,
  calendar,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [semesterDuration, setSemesterDuration] = useState("6 Months");
  const [targetBatch, setTargetBatch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && calendar) {
      setTitle(calendar.title || "");
      const isAudienceGlobal =
        calendar.isGlobal ??
        (!calendar.targetPrograms?.length && !calendar.targetFaculties?.length);
      setIsGlobal(isAudienceGlobal);
      setSelectedFaculties(calendar.targetFaculties || []);
      setSelectedPrograms(calendar.targetPrograms || []);
      setSemesterDuration(calendar.semesterDuration || "6 Months");
      setTargetBatch(calendar.targetBatch || "");
    }
  }, [visible, calendar]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        title: title.trim() || calendar.title,
        targetFaculties: isGlobal ? [] : selectedFaculties,
        targetPrograms: isGlobal ? [] : selectedPrograms,
        semesterDuration,
        targetBatch: targetBatch.trim(),
      });
      onClose();
    } catch (err: any) {
      Alert.alert("Save Failed", err.message || "Failed to update target scope.");
    } finally {
      setIsSaving(false);
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
              <Text style={styles.sheetTitle}>Edit Scope & Term Structure</Text>
              <Text style={styles.sheetSubtitle}>
                {calendar.semester}
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
            {/* Calendar Title Edit Option */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Academic Calendar Title</Text>
              <Text style={styles.sectionSubtitle}>
                Official title displayed across faculty and student portals
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Academic Calendar - Summer 2026"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

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
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Target Scope</Text>
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
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  saveBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
