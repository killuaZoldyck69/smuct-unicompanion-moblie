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
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  CsvValidationResult,
  getCalendarTemplateCsvAPI,
  validateCalendarCsvAPI,
} from "@/services/calendar-service";
import { FacultyProgramSelector } from "./FacultyProgramSelector";
import { BENTO_COLORS, SMUCT_SEMESTERS, SmuctSemester } from "../constants";
import { formatFormattedDateRange } from "../utils/date-helpers";

export interface CalendarMetaInput {
  title?: string;
  semester?: SmuctSemester;
  academicYear?: number;
  semesterDuration?: string;
  targetFaculties?: string[];
  targetPrograms?: string[];
  targetBatch?: string;
}

interface CsvImportModalProps {
  visible: boolean;
  calendarId?: string | null;
  calendarSemester?: string;
  onClose: () => void;
  onImportSuccess: (
    csvContent: string,
    meta?: CalendarMetaInput,
  ) => Promise<void>;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  visible,
  calendarId,
  calendarSemester,
  onClose,
  onImportSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const currentYear = new Date().getFullYear();

  // Term & Metadata State (Used when creating a NEW calendar from CSV)
  const [semester, setSemester] = useState<SmuctSemester>("Summer");
  const [academicYear, setAcademicYear] = useState<string>(
    currentYear.toString(),
  );
  const [semesterDuration, setSemesterDuration] = useState<string>("6 Months");
  const [title, setTitle] = useState(`Summer Semester ${currentYear}`);
  const [hasCustomTitle, setHasCustomTitle] = useState(false);
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [targetBatch, setTargetBatch] = useState("");

  const updateAutoTitle = (s: SmuctSemester, y: string, dur: string) => {
    if (!hasCustomTitle) {
      const suffix = dur === "4 Months" ? " (4-Month)" : "";
      setTitle(`${s} Semester ${y || currentYear}${suffix}`);
    }
  };

  const handleSelectSemester = (s: SmuctSemester) => {
    setSemester(s);
    updateAutoTitle(s, academicYear, semesterDuration);
  };

  const handleYearChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    setAcademicYear(clean);
    updateAutoTitle(semester, clean, semesterDuration);
  };

  const handleDurationChange = (dur: string) => {
    setSemesterDuration(dur);
    updateAutoTitle(semester, academicYear, dur);
  };

  const [pickedFile, setPickedFile] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [validationResult, setValidationResult] =
    useState<CsvValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  // Template Download Handler
  const handleDownloadTemplate = async () => {
    try {
      const template = await getCalendarTemplateCsvAPI();

      if (Platform.OS === "web") {
        const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "smuct_academic_calendar_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert("Success", "CSV Template downloaded.");
      } else {
        const baseDir =
          FileSystem.documentDirectory || FileSystem.cacheDirectory || "";
        const fileUri = `${baseDir}smuct_academic_calendar_template.csv`;
        await FileSystem.writeAsStringAsync(fileUri, template, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Download Calendar CSV Template",
          });
        } else {
          Alert.alert("Template Saved", "Template saved to local app storage.");
        }
      }
    } catch (err: any) {
      Alert.alert(
        "Download Failed",
        err.message || "Could not download template.",
      );
    }
  };

  // Pick CSV File
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/csv",
          "text/plain",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      let content = "";

      if (Platform.OS === "web" && asset.file) {
        content = await asset.file.text();
      } else {
        // Universal robust file reader: avoids Android ExponentFileSystem unreadable cache path issues
        try {
          const res = await fetch(asset.uri);
          content = await res.text();
        } catch {
          try {
            content = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: FileSystem.EncodingType.UTF8,
            });
          } catch {
            const res = await fetch(asset.uri);
            const blob = await res.blob();
            content = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve((reader.result as string) || "");
              reader.onerror = reject;
              reader.readAsText(blob);
            });
          }
        }
      }

      if (!content || !content.trim()) {
        Alert.alert("Empty File", "The selected CSV file has no content.");
        return;
      }

      setPickedFile({ name: asset.name, content });

      // Run dry-run validation
      setIsValidating(true);
      try {
        const validRes = await validateCalendarCsvAPI(
          content,
          calendarId || undefined,
        );
        setValidationResult(validRes);
      } catch (err: any) {
        Alert.alert(
          "Validation Error",
          err.message || "Failed to validate CSV.",
        );
      } finally {
        setIsValidating(false);
      }
    } catch (err: any) {
      Alert.alert("File Selection Failed", err.message);
    }
  };

  // Commit Import
  const handleCommit = async () => {
    if (!pickedFile?.content || !validationResult?.isValid) return;

    if (!calendarId) {
      const finalYear = parseInt(academicYear, 10);
      if (
        !finalYear ||
        isNaN(finalYear) ||
        finalYear < 2000 ||
        finalYear > 2100
      ) {
        Alert.alert(
          "Invalid Academic Year",
          "Please enter a valid 4-digit academic year (e.g. 2026).",
        );
        return;
      }

      const suffix = semesterDuration === "4 Months" ? " (4-Month)" : "";
      const finalTitle =
        title.trim() || `${semester} Semester ${finalYear}${suffix}`;

      try {
        setIsCommitting(true);
        await onImportSuccess(pickedFile.content, {
          title: finalTitle,
          semester,
          academicYear: finalYear,
          semesterDuration,
          targetFaculties: isGlobal ? [] : selectedFaculties,
          targetPrograms: isGlobal ? [] : selectedPrograms,
          targetBatch: targetBatch.trim() || undefined,
        });
        onClose();
        setPickedFile(null);
        setValidationResult(null);
      } catch (err: any) {
        Alert.alert(
          "Creation Failed",
          err.message || "Failed to create calendar from CSV.",
        );
      } finally {
        setIsCommitting(false);
      }
    } else {
      try {
        setIsCommitting(true);
        await onImportSuccess(pickedFile.content);
        onClose();
        setPickedFile(null);
        setValidationResult(null);
      } catch (err: any) {
        Alert.alert(
          "Import Failed",
          err.message || "Failed to import schedule.",
        );
      } finally {
        setIsCommitting(false);
      }
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
        style={[styles.modalOverlay, { paddingTop: Math.max(insets.top, 24) }]}
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
              <Text style={styles.sheetTitle}>
                {calendarId
                  ? "Import Academic Calendar"
                  : "Create Calendar from CSV"}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {calendarId
                  ? `Bulk upload schedule for ${calendarSemester || "calendar"}`
                  : "Configure term details and bulk populate schedule"}
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
            {/* SECTION 1: CALENDAR CONFIGURATION (Only shown when creating new calendar) */}
            {!calendarId && (
              <View style={styles.setupCard}>
                <View style={styles.sectionHeadingRow}>
                  <View style={styles.sectionStepBadge}>
                    <Text style={styles.sectionStepNumber}>1</Text>
                  </View>
                  <View>
                    <Text style={styles.sectionHeadingTitle}>
                      Calendar Term & Scope
                    </Text>
                    <Text style={styles.sectionHeadingSubtitle}>
                      Configure semester details
                    </Text>
                  </View>
                </View>

                {/* Semester Selector */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Semester Term <Text style={styles.requiredAsterisk}>*</Text>
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

                {/* Academic Year & Semester Duration Row */}
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
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
                  <View style={{ flex: 1.35 }}>
                    <Text style={styles.fieldLabel}>
                      Semester Duration <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <View style={styles.durationRow}>
                      {["6 Months", "4 Months"].map((dur) => {
                        const isSelected = semesterDuration === dur;
                        return (
                          <TouchableOpacity
                            key={dur}
                            style={[
                              styles.durationPill,
                              isSelected && styles.durationPillActive,
                            ]}
                            onPress={() => handleDurationChange(dur)}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.durationPillText,
                                isSelected && styles.durationPillTextActive,
                              ]}
                            >
                              {dur}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Calendar Title */}
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    Calendar Title{" "}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`e.g. ${semester} Semester ${academicYear}`}
                    placeholderTextColor="#94a3b8"
                    value={title}
                    onChangeText={(val) => {
                      setTitle(val);
                      setHasCustomTitle(val.trim().length > 0);
                    }}
                  />
                </View>

                {/* Granular Scope Selector (Target Programs & Faculties) */}
                <FacultyProgramSelector
                  isGlobal={isGlobal}
                  onChangeIsGlobal={setIsGlobal}
                  selectedPrograms={selectedPrograms}
                  onChangeSelectedPrograms={setSelectedPrograms}
                  selectedFaculties={selectedFaculties}
                  onChangeSelectedFaculties={setSelectedFaculties}
                  semesterDuration={semesterDuration}
                  onChangeSemesterDuration={handleDurationChange}
                  targetBatch={targetBatch}
                  onChangeTargetBatch={setTargetBatch}
                  hideDuration={true}
                />
              </View>
            )}

            {/* SECTION 2: CSV UPLOAD SECTION */}
            {!calendarId && (
              <View
                style={[
                  styles.sectionHeadingRow,
                  { marginTop: 18, marginBottom: 12 },
                ]}
              >
                <View style={styles.sectionStepBadge}>
                  <Text style={styles.sectionStepNumber}>2</Text>
                </View>
                <View>
                  <Text style={styles.sectionHeadingTitle}>
                    Upload Schedule CSV
                  </Text>
                  <Text style={styles.sectionHeadingSubtitle}>
                    Import calendar dates, midterms, and finals
                  </Text>
                </View>
              </View>
            )}

            {/* Download Template Banner */}
            <TouchableOpacity
              style={styles.templateCard}
              onPress={handleDownloadTemplate}
              activeOpacity={0.8}
            >
              <View style={styles.templateIconBox}>
                <Feather name="download" size={18} color="#0284c7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.templateTitle}>Download Standard CSV</Text>
                <Text style={styles.templateSubtitle}>
                  Canonical headers: title, category, startDate, endDate,
                  weekNumber...
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color="#94a3b8" />
            </TouchableOpacity>

            {/* Upload Zone */}
            <TouchableOpacity
              style={[
                styles.uploadZone,
                pickedFile && styles.uploadZoneSelected,
              ]}
              onPress={handlePickFile}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconCircle}>
                <Feather
                  name={pickedFile ? "check" : "upload-cloud"}
                  size={26}
                  color={pickedFile ? "#047857" : BENTO_COLORS.deepNavy}
                />
              </View>
              <Text style={styles.uploadZoneTitle}>
                {pickedFile ? pickedFile.name : "Choose or Upload CSV File"}
              </Text>
              <Text style={styles.uploadZoneDesc}>
                Accepts spreadsheet dates (YYYY-MM-DD or M/D/YYYY)
              </Text>
            </TouchableOpacity>

            {/* Validating indicator */}
            {isValidating && (
              <View style={styles.validatingBox}>
                <ActivityIndicator size="small" color={BENTO_COLORS.deepNavy} />
                <Text style={styles.validatingText}>
                  Validating calendar timeline and date ranges...
                </Text>
              </View>
            )}

            {/* Validation Results Report */}
            {validationResult && (
              <View style={styles.reportCard}>
                <Text style={styles.reportTitle}>Validation Summary</Text>

                <View style={styles.statGrid}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, { color: "#047857" }]}>
                      {validationResult.validRowsCount}
                    </Text>
                    <Text style={styles.statLabel}>Valid Events</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text
                      style={[
                        styles.statNum,
                        validationResult.errors.length > 0 && {
                          color: "#dc2626",
                        },
                      ]}
                    >
                      {validationResult.errors.length}
                    </Text>
                    <Text style={styles.statLabel}>Errors</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>
                      {validationResult.warnings.length}
                    </Text>
                    <Text style={styles.statLabel}>Warnings</Text>
                  </View>
                </View>

                {/* Errors list */}
                {validationResult.errors.length > 0 ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxTitle}>
                      Required Corrections ({validationResult.errors.length}):
                    </Text>
                    {validationResult.errors.slice(0, 5).map((err, i) => (
                      <View key={i} style={styles.errorRow}>
                        <Feather
                          name="alert-circle"
                          size={13}
                          color="#dc2626"
                        />
                        <Text style={styles.errorText}>
                          Row {err.rowNumber}: {err.message}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.successRow}>
                    <Feather name="check-circle" size={16} color="#047857" />
                    <Text style={styles.successText}>
                      Ready to import {validationResult.validRowsCount} events!
                    </Text>
                  </View>
                )}

                {/* Preview Events */}
                <Text style={styles.previewHeading}>
                  Event Schedule Preview:
                </Text>
                {validationResult.parsedEvents.slice(0, 4).map((ev, idx) => (
                  <View key={idx} style={styles.previewRow}>
                    <View style={styles.previewDateBadge}>
                      <Text style={styles.previewDateText}>
                        {formatFormattedDateRange(ev.startDate, ev.endDate)}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <Text style={styles.previewTitle} numberOfLines={1}>
                        {ev.title}
                      </Text>
                    </View>
                    <View style={styles.previewCategory}>
                      <Text style={styles.previewCategoryText}>
                        {ev.category}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer Action */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom + 14, 22) },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.importBtn,
                (!pickedFile || !validationResult?.isValid || isCommitting) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleCommit}
              disabled={
                !pickedFile || !validationResult?.isValid || isCommitting
              }
              activeOpacity={0.8}
            >
              {isCommitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.importBtnText}>
                  {calendarId
                    ? "Import & Replace Calendar Events"
                    : "Create Calendar from CSV"}
                </Text>
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
  setupCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 6,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionStepNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  sectionHeadingTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionHeadingSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: "#dc2626",
    fontWeight: "800",
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 13,
    color: "#0f172a",
  },
  semesterRow: {
    flexDirection: "row",
    gap: 6,
  },
  semesterPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 8,
    backgroundColor: "#ffffff",
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
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  semesterPillTextActive: {
    color: "#ffffff",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  durationRow: {
    flexDirection: "row",
    gap: 6,
  },
  durationPill: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  durationPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  durationPillText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#475569",
  },
  durationPillTextActive: {
    color: "#ffffff",
  },

  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  templateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 2,
  },
  templateSubtitle: {
    fontSize: 11,
    color: "#0284c7",
  },
  uploadZone: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  uploadZoneSelected: {
    borderColor: "#059669",
    backgroundColor: "#f0fdf4",
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    ...BENTO_COLORS.shadow,
  },
  uploadZoneTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  uploadZoneDesc: {
    fontSize: 11,
    color: "#64748b",
  },
  validatingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginBottom: 12,
  },
  validatingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  reportCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 8,
    alignItems: "center",
  },
  statNum: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorBoxTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 6,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 11,
    color: "#dc2626",
    flex: 1,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  successText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#047857",
  },
  previewHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  previewDateBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  previewDateText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
  },
  previewCategory: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  previewCategoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0369a1",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  importBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  importBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
