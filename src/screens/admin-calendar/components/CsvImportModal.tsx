import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
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
import { BENTO_COLORS } from "../constants";
import { formatFormattedDateRange } from "../utils/date-helpers";

interface CsvImportModalProps {
  visible: boolean;
  calendarId?: string | null;
  calendarSemester?: string;
  onClose: () => void;
  onImportSuccess: (csvContent: string) => Promise<void>;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  visible,
  calendarId,
  calendarSemester,
  onClose,
  onImportSuccess,
}) => {
  const insets = useSafeAreaInsets();
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
      Alert.alert("Download Failed", err.message || "Could not download template.");
    }
  };

  // Pick CSV File
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/csv"],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      let content = "";

      if (Platform.OS === "web") {
        if (asset.file) {
          content = await asset.file.text();
        } else if (asset.uri) {
          const res = await fetch(asset.uri);
          content = await res.text();
        }
      } else {
        content = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
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
        Alert.alert("Validation Error", err.message || "Failed to validate CSV.");
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

    try {
      setIsCommitting(true);
      await onImportSuccess(pickedFile.content);
      onClose();
      setPickedFile(null);
      setValidationResult(null);
    } catch (err: any) {
      Alert.alert("Import Failed", err.message || "Failed to import schedule.");
    } finally {
      setIsCommitting(false);
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
              <Text style={styles.sheetTitle}>Import Academic Calendar</Text>
              <Text style={styles.sheetSubtitle}>
                Bulk upload schedule from RFC 4180 / Excel CSV
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
                  Canonical headers: title, category, startDate, endDate, weekNumber...
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
                        validationResult.errors.length > 0 && { color: "#dc2626" },
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
                        <Feather name="alert-circle" size={13} color="#dc2626" />
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
                (!validationResult?.isValid || isCommitting) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleCommit}
              disabled={!validationResult?.isValid || isCommitting}
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
