import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { BENTO, fontFamily } from "../constants";
import { CreateAlumniInput } from "../types";

interface AlumniCsvModalProps {
  visible: boolean;
  isImporting: boolean;
  onImport: (records: CreateAlumniInput[]) => void;
  onClose: () => void;
}

interface ParsedRow {
  rowNumber: number;
  data: CreateAlumniInput;
  status: "VALID" | "ERROR" | "DUPLICATE";
  errors: string[];
}

const SAMPLE_CSV = `name,department,batch,graduationYear,currentCompany,currentPosition,skills,email,linkedInUrl
Tanvir Hasan,Computer Science & Engineering,16th Batch,2021,Brain Station 23,Senior Software Engineer,"TypeScript; React Native; Node.js",tanvir@example.com,https://linkedin.com/in/tanvirhasan
Farhana Akter,Fashion Design & Technology,18th Batch,2023,Yellow,Lead Apparel Designer,"Fabric Sourcing; Styling",farhana@example.com,https://linkedin.com/in/farhana
Mahmudul Islam,Business Administration,17th Batch,2022,Grameenphone,Brand Strategist,"Marketing; Analytics",mahmud@example.com,`;

// Simple robust CSV line splitter taking quotes into account
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(cur.trim().replace(/^"|"$/g, ""));
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim().replace(/^"|"$/g, ""));
  return result;
}

export const AlumniCsvModal: React.FC<AlumniCsvModalProps> = ({
  visible,
  isImporting,
  onImport,
  onClose,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvRawText, setCsvRawText] = useState("");
  const [activeTab, setActiveTab] = useState<"FILE" | "PASTE">("FILE");
  const [filterPreview, setFilterPreview] = useState<"ALL" | "VALID" | "ERROR">("ALL");

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        return;
      }

      const file = res.assets[0];
      setFileName(file.name);

      let textContent = "";
      if (Platform.OS === "web") {
        if (file.file) {
          textContent = await file.file.text();
        } else if (file.uri) {
          const resp = await fetch(file.uri);
          textContent = await resp.text();
        }
      } else {
        const resp = await fetch(file.uri);
        textContent = await resp.text();
      }

      setCsvRawText(textContent);
      Toast.show({
        type: "success",
        text1: "CSV File Loaded",
        text2: `${file.name} ready for preview and validation`,
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "File Read Error",
        text2: err?.message || "Could not read CSV file",
      });
    }
  };

  const handleCopyTemplate = async () => {
    await Clipboard.setStringAsync(SAMPLE_CSV);
    Toast.show({
      type: "success",
      text1: "Template Copied",
      text2: "Sample CSV template copied to clipboard",
    });
  };

  const handleUseSample = () => {
    setFileName("sample_alumni.csv");
    setCsvRawText(SAMPLE_CSV);
    Toast.show({
      type: "info",
      text1: "Sample CSV Loaded",
      text2: "Sample data loaded into preview",
    });
  };

  // Parser and Validator
  const parsedRows: ParsedRow[] = useMemo(() => {
    if (!csvRawText.trim()) return [];

    const lines = csvRawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) return [];

    const headerLine = lines[0];
    const headers = parseCsvLine(headerLine).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, ""),
    );

    const nameIdx = headers.findIndex((h) => h === "name" || h === "fullname");
    const deptIdx = headers.findIndex((h) => h === "department" || h === "dept");
    const batchIdx = headers.findIndex((h) => h === "batch" || h === "graduationbatch");
    const yearIdx = headers.findIndex(
      (h) => h === "graduationyear" || h === "year" || h === "passingyear",
    );
    const companyIdx = headers.findIndex((h) => h === "currentcompany" || h === "company");
    const posIdx = headers.findIndex(
      (h) => h === "currentposition" || h === "position" || h === "designation" || h === "role",
    );
    const degreeIdx = headers.findIndex((h) => h === "degree");
    const skillsIdx = headers.findIndex((h) => h === "skills");
    const emailIdx = headers.findIndex((h) => h === "email");
    const linkedinIdx = headers.findIndex((h) => h === "linkedinurl" || h === "linkedin");
    const websiteIdx = headers.findIndex((h) => h === "personalwebsiteurl" || h === "website");
    const imageIdx = headers.findIndex((h) => h === "image" || h === "imageurl");

    const rows: ParsedRow[] = [];
    const seenEmails = new Set<string>();
    const seenCombos = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const cells = parseCsvLine(line);
      const rowErrors: string[] = [];

      const rawName = nameIdx >= 0 ? cells[nameIdx] || "" : cells[0] || "";
      const rawDept = deptIdx >= 0 ? cells[deptIdx] || "" : cells[1] || "";
      const rawBatch = batchIdx >= 0 ? cells[batchIdx] || "" : cells[2] || "";
      const rawYear = yearIdx >= 0 ? cells[yearIdx] || "" : cells[3] || "";
      const rawCompany = companyIdx >= 0 ? cells[companyIdx] || "" : "";
      const rawPos = posIdx >= 0 ? cells[posIdx] || "" : "";
      const rawDegree = degreeIdx >= 0 ? cells[degreeIdx] || "" : "";
      const rawSkills = skillsIdx >= 0 ? cells[skillsIdx] || "" : "";
      const rawEmail = emailIdx >= 0 ? cells[emailIdx] || "" : "";
      const rawLinkedIn = linkedinIdx >= 0 ? cells[linkedinIdx] || "" : "";
      const rawWebsite = websiteIdx >= 0 ? cells[websiteIdx] || "" : "";
      const rawImage = imageIdx >= 0 ? cells[imageIdx] || "" : "";

      // Required checks
      if (!rawName.trim()) {
        rowErrors.push("Missing name");
      }
      if (!rawDept.trim()) {
        rowErrors.push("Missing department");
      }
      if (!rawBatch.trim()) {
        rowErrors.push("Missing batch");
      }

      const gradYearNum = Number(rawYear.trim());
      if (!rawYear.trim() || isNaN(gradYearNum)) {
        rowErrors.push("Invalid graduation year");
      } else if (gradYearNum < 1990 || gradYearNum > 2035) {
        rowErrors.push(`Year out of range (${gradYearNum})`);
      }

      // Optional format validation
      if (rawEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail.trim())) {
        rowErrors.push("Invalid email format");
      }

      // Duplicate check
      let isDuplicate = false;
      if (rawEmail.trim()) {
        const normEmail = rawEmail.trim().toLowerCase();
        if (seenEmails.has(normEmail)) {
          isDuplicate = true;
          rowErrors.push(`Duplicate email in CSV: ${rawEmail}`);
        } else {
          seenEmails.add(normEmail);
        }
      }

      const combo = `${rawName.trim().toLowerCase()}#${rawDept.trim().toLowerCase()}#${rawBatch.trim().toLowerCase()}`;
      if (seenCombos.has(combo)) {
        isDuplicate = true;
        rowErrors.push("Duplicate person in CSV");
      } else {
        seenCombos.add(combo);
      }

      const parsedSkills = rawSkills
        ? rawSkills
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const record: CreateAlumniInput = {
        name: rawName.trim(),
        department: rawDept.trim(),
        batch: rawBatch.trim(),
        graduationBatch: rawBatch.trim(),
        graduationYear: isNaN(gradYearNum) ? undefined : gradYearNum,
        passingYear: isNaN(gradYearNum) ? undefined : gradYearNum,
        currentCompany: rawCompany.trim() || undefined,
        currentPosition: rawPos.trim() || undefined,
        currentRole: rawPos.trim() || undefined,
        designation: rawPos.trim() || undefined,
        degree: rawDegree.trim() || undefined,
        skills: parsedSkills,
        email: rawEmail.trim() || undefined,
        linkedInUrl: rawLinkedIn.trim() || undefined,
        linkedinUrl: rawLinkedIn.trim() || undefined,
        personalWebsiteUrl: rawWebsite.trim() || undefined,
        image: rawImage.trim() || undefined,
        imageUrl: rawImage.trim() || undefined,
      };

      const status: "VALID" | "ERROR" | "DUPLICATE" = isDuplicate
        ? "DUPLICATE"
        : rowErrors.length > 0
        ? "ERROR"
        : "VALID";

      rows.push({
        rowNumber: i + 1, // Row number in original spreadsheet
        data: record,
        status,
        errors: rowErrors,
      });
    }

    return rows;
  }, [csvRawText]);

  const validRows = useMemo(
    () => parsedRows.filter((r) => r.status === "VALID"),
    [parsedRows],
  );

  const errorRows = useMemo(
    () => parsedRows.filter((r) => r.status === "ERROR" || r.status === "DUPLICATE"),
    [parsedRows],
  );

  const filteredDisplayRows = useMemo(() => {
    if (filterPreview === "VALID") return validRows;
    if (filterPreview === "ERROR") return errorRows;
    return parsedRows;
  }, [parsedRows, validRows, errorRows, filterPreview]);

  const handleConfirmImport = () => {
    if (validRows.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Valid Records",
        text2: "Fix errors in your CSV before confirming import",
      });
      return;
    }

    onImport(validRows.map((r) => r.data));
  };

  const handleClear = () => {
    setFileName(null);
    setCsvRawText("");
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.sheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Import Alumni CSV</Text>
              <Text style={styles.headerSubtitle}>
                Bulk register graduates with format validation and duplicate detection
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close CSV modal"
            >
              <Feather name="x" size={20} color={BENTO.navy} />
            </TouchableOpacity>
          </View>

          {/* Source Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "FILE" && styles.tabBtnActive]}
              onPress={() => setActiveTab("FILE")}
            >
              <Feather
                name="file-text"
                size={14}
                color={activeTab === "FILE" ? "#ffffff" : BENTO.slate}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === "FILE" && styles.tabBtnTextActive,
                ]}
              >
                Upload File
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "PASTE" && styles.tabBtnActive]}
              onPress={() => setActiveTab("PASTE")}
            >
              <Feather
                name="clipboard"
                size={14}
                color={activeTab === "PASTE" ? "#ffffff" : BENTO.slate}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === "PASTE" && styles.tabBtnTextActive,
                ]}
              >
                Paste CSV Text
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content Area */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === "FILE" ? (
              <View style={styles.uploadBoxContainer}>
                {fileName ? (
                  <View style={styles.loadedFileCard}>
                    <View style={styles.fileIconBox}>
                      <Feather name="check" size={20} color="#059669" />
                    </View>
                    <View style={styles.fileDetails}>
                      <Text style={styles.loadedFileName} numberOfLines={1}>
                        {fileName}
                      </Text>
                      <Text style={styles.loadedFileMeta}>
                        {parsedRows.length} data rows found
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleClear}
                      style={styles.removeFileBtn}
                    >
                      <Feather name="trash-2" size={16} color={BENTO.rose} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.dropZone}
                    onPress={handlePickDocument}
                    activeOpacity={0.8}
                  >
                    <View style={styles.uploadIconCircle}>
                      <Feather name="upload-cloud" size={28} color={BENTO.navy} />
                    </View>
                    <Text style={styles.dropZoneTitle}>Select Alumni CSV File</Text>
                    <Text style={styles.dropZoneSubtitle}>
                      Tap here to choose a .csv file from your device
                    </Text>
                    <View style={styles.chooseFileBtn}>
                      <Text style={styles.chooseFileBtnText}>Browse Files</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Sample helper strip */}
                <View style={styles.sampleStrip}>
                  <TouchableOpacity
                    style={styles.sampleBtn}
                    onPress={handleUseSample}
                  >
                    <Feather name="play" size={13} color={BENTO.navy} style={{ marginRight: 5 }} />
                    <Text style={styles.sampleBtnText}>Load Sample Data</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sampleBtn}
                    onPress={handleCopyTemplate}
                  >
                    <Feather name="copy" size={13} color={BENTO.slate} style={{ marginRight: 5 }} />
                    <Text style={styles.sampleBtnText}>Copy Template</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.pasteContainer}>
                <Text style={styles.pasteLabel}>PASTE RAW CSV DATA</Text>
                <TextInput
                  style={styles.pasteInput}
                  multiline={true}
                  numberOfLines={6}
                  value={csvRawText}
                  onChangeText={(t) => {
                    setFileName("pasted_data.csv");
                    setCsvRawText(t);
                  }}
                  placeholder="Paste CSV text here with headers: name,department,batch,graduationYear..."
                  placeholderTextColor={BENTO.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Validation & Preview Section (Shown when data is present) */}
            {parsedRows.length > 0 && (
              <View style={styles.previewSection}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{parsedRows.length}</Text>
                    <Text style={styles.statLabel}>TOTAL ROWS</Text>
                  </View>
                  <View style={[styles.statBox, styles.statBoxValid]}>
                    <Text style={[styles.statNumber, { color: "#059669" }]}>
                      {validRows.length}
                    </Text>
                    <Text style={styles.statLabel}>READY</Text>
                  </View>
                  <View style={[styles.statBox, errorRows.length > 0 && styles.statBoxError]}>
                    <Text
                      style={[
                        styles.statNumber,
                        { color: errorRows.length > 0 ? BENTO.rose : BENTO.slateLight },
                      ]}
                    >
                      {errorRows.length}
                    </Text>
                    <Text style={styles.statLabel}>ISSUES</Text>
                  </View>
                </View>

                {/* Filter Pills */}
                <View style={styles.previewFilterRow}>
                  <TouchableOpacity
                    style={[
                      styles.previewFilterPill,
                      filterPreview === "ALL" && styles.previewFilterPillActive,
                    ]}
                    onPress={() => setFilterPreview("ALL")}
                  >
                    <Text
                      style={[
                        styles.previewFilterText,
                        filterPreview === "ALL" && styles.previewFilterTextActive,
                      ]}
                    >
                      All ({parsedRows.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.previewFilterPill,
                      filterPreview === "VALID" && styles.previewFilterPillActive,
                    ]}
                    onPress={() => setFilterPreview("VALID")}
                  >
                    <Text
                      style={[
                        styles.previewFilterText,
                        filterPreview === "VALID" && styles.previewFilterTextActive,
                      ]}
                    >
                      Valid ({validRows.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.previewFilterPill,
                      filterPreview === "ERROR" && styles.previewFilterPillActive,
                    ]}
                    onPress={() => setFilterPreview("ERROR")}
                  >
                    <Text
                      style={[
                        styles.previewFilterText,
                        filterPreview === "ERROR" && styles.previewFilterTextActive,
                      ]}
                    >
                      Errors ({errorRows.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Rows List */}
                <View style={styles.rowsContainer}>
                  {filteredDisplayRows.map((row) => {
                    const isValid = row.status === "VALID";
                    const isDup = row.status === "DUPLICATE";
                    return (
                      <View
                        key={`row-${row.rowNumber}`}
                        style={[
                          styles.rowCard,
                          isValid
                            ? styles.rowCardValid
                            : isDup
                            ? styles.rowCardDup
                            : styles.rowCardError,
                        ]}
                      >
                        <View style={styles.rowCardHeader}>
                          <View style={styles.rowNumberPill}>
                            <Text style={styles.rowNumberText}>
                              Row {row.rowNumber}
                            </Text>
                          </View>
                          <Text style={styles.rowNameText} numberOfLines={1}>
                            {row.data.name || "(Unnamed)"}
                          </Text>

                          <View
                            style={[
                              styles.rowStatusBadge,
                              isValid
                                ? styles.statusBadgeValid
                                : isDup
                                ? styles.statusBadgeDup
                                : styles.statusBadgeError,
                            ]}
                          >
                            <Feather
                              name={isValid ? "check" : isDup ? "copy" : "alert-circle"}
                              size={11}
                              color={isValid ? "#059669" : isDup ? "#d97706" : BENTO.rose}
                              style={{ marginRight: 3 }}
                            />
                            <Text
                              style={[
                                styles.rowStatusText,
                                {
                                  color: isValid
                                    ? "#059669"
                                    : isDup
                                    ? "#d97706"
                                    : BENTO.rose,
                                },
                              ]}
                            >
                              {row.status}
                            </Text>
                          </View>
                        </View>

                        {/* Metadata snippet */}
                        <Text style={styles.rowMetaSnippet} numberOfLines={1}>
                          {[
                            row.data.department,
                            row.data.batch,
                            row.data.graduationYear ? `Class of ${row.data.graduationYear}` : null,
                            row.data.currentCompany,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>

                        {/* Errors display */}
                        {row.errors.length > 0 && (
                          <View style={styles.rowErrorsBox}>
                            {row.errors.map((err, eIdx) => (
                              <View key={eIdx} style={styles.errorBullet}>
                                <Feather
                                  name="x"
                                  size={11}
                                  color={isDup ? "#d97706" : BENTO.rose}
                                  style={{ marginTop: 2, marginRight: 4 }}
                                />
                                <Text
                                  style={[
                                    styles.errorBulletText,
                                    { color: isDup ? "#b45309" : BENTO.rose },
                                  ]}
                                >
                                  {err}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Sticky Confirm Actions */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isImporting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (validRows.length === 0 || isImporting) && styles.disabledBtn,
              ]}
              onPress={handleConfirmImport}
              disabled={validRows.length === 0 || isImporting}
              activeOpacity={0.85}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="upload"
                    size={15}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.confirmBtnText}>
                    Confirm & Import ({validRows.length})
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: BENTO.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(15, 23, 42, 0.15)",
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 2,
    maxWidth: 280,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
  },
  tabBtnActive: {
    backgroundColor: BENTO.navy,
  },
  tabBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  tabBtnTextActive: {
    color: "#ffffff",
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  uploadBoxContainer: {
    width: "100%",
  },
  dropZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: BENTO.slateLight,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO.surfaceSecondary,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    ...Platform.select({
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  dropZoneTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 4,
  },
  dropZoneSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginBottom: 12,
    textAlign: "center",
  },
  chooseFileBtn: {
    backgroundColor: BENTO.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chooseFileBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  loadedFileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  fileDetails: {
    flex: 1,
  },
  loadedFileName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
  },
  loadedFileMeta: {
    fontFamily,
    fontSize: 12,
    color: "#059669",
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 8,
  },
  sampleStrip: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    justifyContent: "flex-end",
  },
  sampleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: BENTO.slateSubtle,
  },
  sampleBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  pasteContainer: {
    width: "100%",
  },
  pasteLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.navySecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pasteInput: {
    height: 140,
    backgroundColor: BENTO.surfaceSecondary,
    borderWidth: 1,
    borderColor: BENTO.border,
    borderRadius: 12,
    padding: 12,
    fontFamily,
    fontSize: 12,
    color: BENTO.navy,
    textAlignVertical: "top",
  },
  previewSection: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: BENTO.border,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: BENTO.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  statBoxValid: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statBoxError: {
    backgroundColor: "#fff5f5",
    borderColor: "#fecaca",
  },
  statNumber: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
  },
  statLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  previewFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  previewFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: BENTO.slateSubtle,
  },
  previewFilterPillActive: {
    backgroundColor: BENTO.navy,
  },
  previewFilterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  previewFilterTextActive: {
    color: "#ffffff",
  },
  rowsContainer: {
    gap: 8,
  },
  rowCard: {
    backgroundColor: BENTO.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  rowCardValid: {
    borderColor: "#bbf7d0",
    backgroundColor: "#fcfffd",
  },
  rowCardDup: {
    borderColor: "#fde68a",
    backgroundColor: "#fffdfa",
  },
  rowCardError: {
    borderColor: "#fecaca",
    backgroundColor: "#fffafa",
  },
  rowCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  rowNumberPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rowNumberText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
  },
  rowNameText: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },
  rowStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeValid: {
    backgroundColor: "#dcfce7",
  },
  statusBadgeDup: {
    backgroundColor: "#fef3c7",
  },
  statusBadgeError: {
    backgroundColor: "#fee2e2",
  },
  rowStatusText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
  },
  rowMetaSnippet: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO.slate,
    lineHeight: 16,
  },
  rowErrorsBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    gap: 3,
  },
  errorBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  errorBulletText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BENTO.border,
    backgroundColor: BENTO.card,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
  },
  confirmBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    backgroundColor: BENTO.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
