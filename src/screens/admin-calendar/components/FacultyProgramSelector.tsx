import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SMUCT_FACULTIES, BENTO_COLORS } from "../constants";

interface FacultyProgramSelectorProps {
  isGlobal: boolean;
  onChangeIsGlobal: (val: boolean) => void;
  selectedPrograms: string[];
  onChangeSelectedPrograms: (programs: string[]) => void;
  selectedFaculties: string[];
  onChangeSelectedFaculties: (faculties: string[]) => void;
  semesterDuration: string;
  onChangeSemesterDuration: (duration: string) => void;
  targetBatch: string;
  onChangeTargetBatch: (batch: string) => void;
}

export const FacultyProgramSelector: React.FC<FacultyProgramSelectorProps> = ({
  isGlobal,
  onChangeIsGlobal,
  selectedPrograms,
  onChangeSelectedPrograms,
  selectedFaculties,
  onChangeSelectedFaculties,
  semesterDuration,
  onChangeSemesterDuration,
  targetBatch,
  onChangeTargetBatch,
}) => {
  const toggleProgram = (prog: string, facultyName: string) => {
    let nextPrograms: string[];
    if (selectedPrograms.includes(prog)) {
      nextPrograms = selectedPrograms.filter((p) => p !== prog);
    } else {
      nextPrograms = [...selectedPrograms, prog];
    }
    onChangeSelectedPrograms(nextPrograms);

    // Update faculty selection
    const faculty = SMUCT_FACULTIES.find((f) => f.name === facultyName);
    if (faculty) {
      const hasAny = faculty.programs.some((p) => nextPrograms.includes(p));
      if (hasAny && !selectedFaculties.includes(facultyName)) {
        onChangeSelectedFaculties([...selectedFaculties, facultyName]);
      } else if (!hasAny && selectedFaculties.includes(facultyName)) {
        onChangeSelectedFaculties(
          selectedFaculties.filter((f) => f !== facultyName),
        );
      }
    }
  };

  const toggleSelectAllFaculty = (facultyName: string) => {
    const faculty = SMUCT_FACULTIES.find((f) => f.name === facultyName);
    if (!faculty) return;

    const allSelected = faculty.programs.every((p) =>
      selectedPrograms.includes(p),
    );

    let nextPrograms: string[];
    let nextFaculties: string[];

    if (allSelected) {
      // Deselect all programs for this faculty
      const facultyProgSet = new Set<string>(faculty.programs);
      nextPrograms = selectedPrograms.filter((p) => !facultyProgSet.has(p));
      nextFaculties = selectedFaculties.filter((f) => f !== facultyName);
    } else {
      // Select all programs for this faculty
      const toAdd = faculty.programs.filter(
        (p) => !selectedPrograms.includes(p),
      );
      nextPrograms = [...selectedPrograms, ...toAdd];
      nextFaculties = selectedFaculties.includes(facultyName)
        ? selectedFaculties
        : [...selectedFaculties, facultyName];
    }

    onChangeSelectedPrograms(nextPrograms);
    onChangeSelectedFaculties(nextFaculties);
  };

  return (
    <View style={styles.container}>
      {/* Semester Duration Segment */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Semester Duration</Text>
        <Text style={styles.sectionSubtitle}>
          Select academic cycle term structure
        </Text>
        <View style={styles.segmentRow}>
          {["6 Months", "4 Months"].map((dur) => {
            const isSel = (semesterDuration || "6 Months") === dur;
            return (
              <TouchableOpacity
                key={dur}
                style={[styles.segmentBtn, isSel && styles.segmentBtnActive]}
                onPress={() => onChangeSemesterDuration(dur)}
                activeOpacity={0.8}
              >
                <Feather
                  name="clock"
                  size={14}
                  color={isSel ? "#ffffff" : "#475569"}
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    isSel && styles.segmentBtnTextActive,
                  ]}
                >
                  {dur} Semester
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Target Batch Note */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Target Batch (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          Specify applicable student intake or cohort
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. All Batches or 47th Batch & Onwards"
          placeholderTextColor="#94a3b8"
          value={targetBatch}
          onChangeText={onChangeTargetBatch}
        />
      </View>

      {/* Global / Target Master Switch */}
      <View style={styles.switchCard}>
        <View style={styles.switchInfo}>
          <View style={styles.switchTitleRow}>
            <Feather name="globe" size={16} color={BENTO_COLORS.deepNavy} />
            <Text style={styles.switchTitle}>All Faculties & Programs</Text>
          </View>
          <Text style={styles.switchSubtitle}>
            {isGlobal
              ? "This calendar applies university-wide to all students."
              : "Target specific faculties & undergraduate/graduate programs."}
          </Text>
        </View>
        <Switch
          value={isGlobal}
          onValueChange={onChangeIsGlobal}
          trackColor={{ false: "#cbd5e1", true: BENTO_COLORS.deepNavy }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Granular Faculties & Programs Selector */}
      {!isGlobal && (
        <View style={styles.targetSection}>
          <View style={styles.targetHeaderRow}>
            <Text style={styles.targetHeading}>Select Targeted Programs</Text>
            <Text style={styles.targetCountBadge}>
              {selectedPrograms.length} Selected
            </Text>
          </View>

          {SMUCT_FACULTIES.map((faculty) => {
            const allSelected = faculty.programs.every((p) =>
              selectedPrograms.includes(p),
            );
            const someSelected = faculty.programs.some((p) =>
              selectedPrograms.includes(p),
            );

            return (
              <View key={faculty.id} style={styles.facultyBlock}>
                {/* Faculty Header */}
                <View style={styles.facultyHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.facultyName}>{faculty.name}</Text>
                    <Text style={styles.facultySub}>
                      {faculty.programs.length} programs
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.selectAllPill,
                      allSelected && styles.selectAllPillActive,
                    ]}
                    onPress={() => toggleSelectAllFaculty(faculty.name)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={allSelected ? "check" : someSelected ? "minus" : "plus"}
                      size={12}
                      color={allSelected ? "#047857" : "#0f172a"}
                    />
                    <Text
                      style={[
                        styles.selectAllPillText,
                        allSelected && styles.selectAllPillTextActive,
                      ]}
                    >
                      {allSelected ? "Selected All" : "Select All"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Program Pills Grid */}
                <View style={styles.programsGrid}>
                  {faculty.programs.map((program) => {
                    const isSelected = selectedPrograms.includes(program);
                    return (
                      <TouchableOpacity
                        key={program}
                        style={[
                          styles.programPill,
                          isSelected && styles.programPillSelected,
                        ]}
                        onPress={() => toggleProgram(program, faculty.name)}
                        activeOpacity={0.75}
                      >
                        <Feather
                          name={isSelected ? "check-circle" : "circle"}
                          size={13}
                          color={isSelected ? "#0284c7" : "#94a3b8"}
                        />
                        <Text
                          style={[
                            styles.programPillText,
                            isSelected && styles.programPillTextSelected,
                          ]}
                        >
                          {program}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  segmentBtnActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  segmentBtnTextActive: {
    color: "#ffffff",
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
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  switchSubtitle: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
  },
  targetSection: {
    marginTop: 2,
  },
  targetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  targetHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  targetCountBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  facultyBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 10,
  },
  facultyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  facultyName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  facultySub: {
    fontSize: 11,
    color: "#64748b",
  },
  selectAllPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  selectAllPillActive: {
    backgroundColor: "#d1fae5",
  },
  selectAllPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  selectAllPillTextActive: {
    color: "#047857",
  },
  programsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  programPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxWidth: "100%",
  },
  programPillSelected: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  programPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    flexShrink: 1,
  },
  programPillTextSelected: {
    color: "#0369a1",
    fontWeight: "700",
  },
});
