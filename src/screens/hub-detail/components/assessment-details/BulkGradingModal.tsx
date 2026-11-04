import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";
import {
  AssessmentData,
  AssessmentSubmission,
  AssessmentAttachment,
  AssessmentLink,
} from "./types";
import { openSafeUrl } from "./utils";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export interface BulkGradeEntry {
  studentId: string;
  marks: number;
  feedback?: string;
}

interface BulkGradingModalProps {
  isVisible: boolean;
  onClose: () => void;
  assessment: AssessmentData;
  submissions: AssessmentSubmission[];
  hubMembers?: any[];
  isOffline?: boolean;
  isPending: boolean;
  onSaveBulk: (grades: BulkGradeEntry[]) => Promise<void> | void;
}

type FilterTab = "ALL" | "UNGRADED" | "GRADED" | "SUBMITTED" | "MISSING";

interface StudentRowItem {
  studentId: string;
  name: string;
  avatar?: string;
  studentIdDisplay?: string | null;
  submission?: AssessmentSubmission;
  hasSubmitted: boolean;
  isLate?: boolean;
  submittedAt?: string;
  attachments?: AssessmentAttachment[];
  links?: AssessmentLink[];
  content?: string;
  initialMarks: number | null;
  initialFeedback: string;
}

export const BulkGradingModal: React.FC<BulkGradingModalProps> = ({
  isVisible,
  onClose,
  assessment,
  submissions,
  hubMembers = [],
  isOffline = false,
  isPending,
  onSaveBulk,
}) => {
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [gradesState, setGradesState] = useState<
    Record<string, { marks: string; feedback: string }>
  >({});
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false);

  // 1. Build Comprehensive Student Records
  const allStudents = useMemo<StudentRowItem[]>(() => {
    const enrolled = (hubMembers || []).filter(
      (m: any) => m.role === "STUDENT" || m.role === "CR"
    );

    const studentMap = new Map<string, StudentRowItem>();

    // Process enrolled members
    for (const member of enrolled) {
      const studentUser = member.user || {};
      const studentId = member.userId || studentUser.id || member.id;
      const name = studentUser.name || member.name || "Student";
      const avatar = studentUser.image || studentUser.avatar || member.image;
      const studentIdDisplay =
        studentUser.studentProfile?.studentId ||
        studentUser.studentId ||
        member.studentId;

      // Find matching submission
      const sub = submissions.find(
        (s) =>
          (s.studentId && (s.studentId === studentId || s.studentId === member.userId)) ||
          (s.student?.id && (s.student?.id === studentId || s.student?.id === member.userId))
      );

      const hasSubmitted = Boolean(sub && (sub.submittedUrl || sub.attachments?.length || sub.content));
      const initialMarks = sub?.marks !== undefined && sub?.marks !== null ? sub.marks : null;
      const initialFeedback = sub?.feedback || "";

      studentMap.set(studentId, {
        studentId,
        name,
        avatar,
        studentIdDisplay,
        submission: sub,
        hasSubmitted: isOffline ? true : hasSubmitted,
        isLate: sub?.isLate,
        submittedAt: sub?.createdAt,
        attachments: sub?.attachments || [],
        links: (sub as any)?.links || [],
        content: sub?.content,
        initialMarks,
        initialFeedback,
      });
    }

    // Include any submission from students who might not be in enrolled list
    for (const sub of submissions) {
      const sId = sub.studentId || sub.student?.id;
      if (sId && !studentMap.has(sId)) {
        const name = sub.student?.name || "Student";
        const avatar = sub.student?.image || sub.student?.avatar;
        const studentIdDisplay =
          sub.student?.studentProfile?.studentId || sub.student?.studentId;
        const hasSubmitted = Boolean(sub.submittedUrl || sub.attachments?.length || sub.content);
        const initialMarks = sub.marks !== undefined && sub.marks !== null ? sub.marks : null;
        const initialFeedback = sub.feedback || "";

        studentMap.set(sId, {
          studentId: sId,
          name,
          avatar,
          studentIdDisplay,
          submission: sub,
          hasSubmitted: isOffline ? true : hasSubmitted,
          isLate: sub.isLate,
          submittedAt: sub.createdAt,
          attachments: sub.attachments || [],
          links: (sub as any)?.links || [],
          content: sub.content,
          initialMarks,
          initialFeedback,
        });
      }
    }

    // Sort alphabetically by student ID or name
    return Array.from(studentMap.values()).sort((a, b) => {
      if (a.studentIdDisplay && b.studentIdDisplay) {
        return a.studentIdDisplay.localeCompare(b.studentIdDisplay, undefined, { numeric: true });
      }
      return a.name.localeCompare(b.name);
    });
  }, [hubMembers, submissions, isOffline]);

  // 2. Initialize Grades Map when Modal opens or submissions change
  useEffect(() => {
    if (isVisible) {
      const initial: Record<string, { marks: string; feedback: string }> = {};
      for (const st of allStudents) {
        initial[st.studentId] = {
          marks: st.initialMarks !== null ? String(st.initialMarks) : "",
          feedback: st.initialFeedback || "",
        };
      }
      setGradesState(initial);
      setSearchQuery("");
      setActiveTab("ALL");
      setExpandedStudentId(null);
      setShowQuickActionMenu(false);
    }
  }, [isVisible, allStudents]);

  // 3. Mark Input Change Handlers
  const handleMarksChange = useCallback((studentId: string, val: string) => {
    const sanitized = val.replace(/[^0-9.]/g, "");
    setGradesState((prev) => ({
      ...prev,
      [studentId]: {
        marks: sanitized,
        feedback: prev[studentId]?.feedback || "",
      },
    }));
  }, []);

  const handleFeedbackChange = useCallback((studentId: string, val: string) => {
    setGradesState((prev) => ({
      ...prev,
      [studentId]: {
        marks: prev[studentId]?.marks || "",
        feedback: val,
      },
    }));
  }, []);

  // Quick Preset Feedback insertion
  const handleApplyPresetFeedback = useCallback((studentId: string, text: string) => {
    setGradesState((prev) => ({
      ...prev,
      [studentId]: {
        marks: prev[studentId]?.marks || "",
        feedback: text,
      },
    }));
  }, []);

  // 4. Batch Operations
  const handleFillUngraded = useCallback(
    (fillMarks: number) => {
      const marksStr = String(fillMarks);
      setGradesState((prev) => {
        const next = { ...prev };
        for (const st of allStudents) {
          const current = next[st.studentId]?.marks?.trim();
          if (!current && current !== "0") {
            next[st.studentId] = {
              marks: marksStr,
              feedback: next[st.studentId]?.feedback || "",
            };
          }
        }
        return next;
      });
      setShowQuickActionMenu(false);
      Toast.show({
        type: "success",
        text1: "Marks Filled",
        text2: `Filled all ungraded students with ${fillMarks} marks.`,
      });
    },
    [allStudents]
  );

  const handleFillMissingWithZero = useCallback(() => {
    setGradesState((prev) => {
      const next = { ...prev };
      for (const st of allStudents) {
        if (!st.hasSubmitted) {
          next[st.studentId] = {
            marks: "0",
            feedback: next[st.studentId]?.feedback || "Not submitted",
          };
        }
      }
      return next;
    });
    setShowQuickActionMenu(false);
    Toast.show({
      type: "success",
      text1: "Zero Marks Assigned",
      text2: "Assigned 0 marks and 'Not submitted' note to missing students.",
    });
  }, [allStudents]);

  const handleResetChanges = useCallback(() => {
    Alert.alert(
      "Reset Unsaved Changes",
      "Are you sure you want to discard your edits and revert back to current grades?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            const initial: Record<string, { marks: string; feedback: string }> = {};
            for (const st of allStudents) {
              initial[st.studentId] = {
                marks: st.initialMarks !== null ? String(st.initialMarks) : "",
                feedback: st.initialFeedback || "",
              };
            }
            setGradesState(initial);
            setShowQuickActionMenu(false);
            Toast.show({ type: "info", text1: "Reverted", text2: "All edits reset." });
          },
        },
      ]
    );
  }, [allStudents]);

  // 5. Modified & Validation Computations
  const modifiedEntries = useMemo(() => {
    const list: BulkGradeEntry[] = [];
    for (const st of allStudents) {
      const current = gradesState[st.studentId];
      if (!current) continue;

      const currentMarksTrim = current.marks.trim();
      const currentFeedbackTrim = current.feedback.trim();

      const origMarksStr = st.initialMarks !== null ? String(st.initialMarks) : "";
      const origFeedbackStr = st.initialFeedback.trim();

      const isChanged =
        currentMarksTrim !== origMarksStr || currentFeedbackTrim !== origFeedbackStr;

      if (isChanged && currentMarksTrim.length > 0) {
        const num = parseFloat(currentMarksTrim);
        if (!isNaN(num) && num >= 0 && num <= assessment.totalMarks) {
          list.push({
            studentId: st.studentId,
            marks: num,
            feedback: currentFeedbackTrim || undefined,
          });
        }
      }
    }
    return list;
  }, [allStudents, gradesState, assessment.totalMarks]);

  const invalidEntriesCount = useMemo(() => {
    let count = 0;
    for (const st of allStudents) {
      const current = gradesState[st.studentId];
      if (!current || !current.marks.trim()) continue;
      const num = parseFloat(current.marks.trim());
      if (isNaN(num) || num < 0 || num > assessment.totalMarks) {
        count++;
      }
    }
    return count;
  }, [allStudents, gradesState, assessment.totalMarks]);

  const totalGradedCount = useMemo(() => {
    let count = 0;
    for (const st of allStudents) {
      const current = gradesState[st.studentId];
      if (!current || !current.marks.trim()) continue;
      const num = parseFloat(current.marks.trim());
      if (!isNaN(num) && num >= 0 && num <= assessment.totalMarks) {
        count++;
      }
    }
    return count;
  }, [allStudents, gradesState, assessment.totalMarks]);

  // 6. Filtered Students List
  const filteredStudents = useMemo(() => {
    return allStudents.filter((st) => {
      // Search Match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = st.name.toLowerCase().includes(q);
        const idMatch = st.studentIdDisplay?.toLowerCase().includes(q);
        if (!nameMatch && !idMatch) return false;
      }

      const currentMarks = gradesState[st.studentId]?.marks?.trim();
      const isCurrentlyGraded = currentMarks !== undefined && currentMarks.length > 0;

      switch (activeTab) {
        case "UNGRADED":
          return !isCurrentlyGraded;
        case "GRADED":
          return isCurrentlyGraded;
        case "SUBMITTED":
          return st.hasSubmitted;
        case "MISSING":
          return !st.hasSubmitted;
        case "ALL":
        default:
          return true;
      }
    });
  }, [allStudents, searchQuery, activeTab, gradesState]);

  // 7. Save All Handler
  const handleSaveAll = async () => {
    if (invalidEntriesCount > 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Marks Found",
        text2: `Some students have marks greater than ${assessment.totalMarks} or negative. Please fix before saving.`,
      });
      return;
    }

    if (modifiedEntries.length === 0) {
      Toast.show({
        type: "info",
        text1: "No Changes",
        text2: "No marks or feedback modifications to save.",
      });
      return;
    }

    try {
      await onSaveBulk(modifiedEntries);
      onClose();
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Bulk Marks Saved!",
          text2: `Successfully updated grades for ${modifiedEntries.length} student${
            modifiedEntries.length > 1 ? "s" : ""
          }.`,
        });
      }, 350);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: err?.response?.data?.message || err?.message || "Failed to save bulk grades.",
      });
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close bulk mark modal"
          >
            <Feather name="x" size={20} color="#0f172a" />
          </TouchableOpacity>

          <View style={styles.headerCenterCol}>
            <View style={styles.headerTitleRow}>
              <Feather name="layers" size={16} color="#2563eb" style={{ marginRight: 6 }} />
              <Text style={styles.headerTitleText}>Bulk Mark Input</Text>
            </View>
            <Text style={styles.headerSubtitleText} numberOfLines={1}>
              {assessment.title} • Max Marks: {assessment.totalMarks}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.quickActionTriggerBtn}
            onPress={() => setShowQuickActionMenu((prev) => !prev)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Quick actions menu"
          >
            <Feather name="more-vertical" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Dropdown / Sheet */}
        {showQuickActionMenu && (
          <View style={styles.quickActionDropdown}>
            <Text style={styles.quickActionHeading}>Batch Quick Actions</Text>
            <View style={styles.quickActionButtonsRow}>
              <TouchableOpacity
                style={styles.quickActionOption}
                onPress={() => handleFillUngraded(assessment.totalMarks)}
              >
                <Feather name="award" size={14} color="#16a34a" style={{ marginRight: 6 }} />
                <Text style={styles.quickActionOptionText}>
                  Fill Ungraded with Full ({assessment.totalMarks})
                </Text>
              </TouchableOpacity>

              {!isOffline && (
                <TouchableOpacity
                  style={styles.quickActionOption}
                  onPress={handleFillMissingWithZero}
                >
                  <Feather name="user-x" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                  <Text style={styles.quickActionOptionText}>Fill Missing with 0</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.quickActionOption}
                onPress={handleResetChanges}
              >
                <Feather name="rotate-ccw" size={14} color="#64748b" style={{ marginRight: 6 }} />
                <Text style={styles.quickActionOptionText}>Reset All Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search student by name or ID..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsContent}>
            <TouchableOpacity
              style={[styles.pill, activeTab === "ALL" && styles.pillActive]}
              onPress={() => setActiveTab("ALL")}
            >
              <Text style={[styles.pillText, activeTab === "ALL" && styles.pillTextActive]}>
                All ({allStudents.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, activeTab === "UNGRADED" && styles.pillActive]}
              onPress={() => setActiveTab("UNGRADED")}
            >
              <Text style={[styles.pillText, activeTab === "UNGRADED" && styles.pillTextActive]}>
                Ungraded ({allStudents.length - totalGradedCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, activeTab === "GRADED" && styles.pillActive]}
              onPress={() => setActiveTab("GRADED")}
            >
              <Text style={[styles.pillText, activeTab === "GRADED" && styles.pillTextActive]}>
                Graded ({totalGradedCount})
              </Text>
            </TouchableOpacity>

            {!isOffline && (
              <>
                <TouchableOpacity
                  style={[styles.pill, activeTab === "SUBMITTED" && styles.pillActive]}
                  onPress={() => setActiveTab("SUBMITTED")}
                >
                  <Text style={[styles.pillText, activeTab === "SUBMITTED" && styles.pillTextActive]}>
                    Submitted ({allStudents.filter((s) => s.hasSubmitted).length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, activeTab === "MISSING" && styles.pillActive]}
                  onPress={() => setActiveTab("MISSING")}
                >
                  <Text style={[styles.pillText, activeTab === "MISSING" && styles.pillTextActive]}>
                    Missing ({allStudents.filter((s) => !s.hasSubmitted).length})
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>

        {/* Student List View */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <ScrollView
            style={styles.listScrollView}
            contentContainerStyle={styles.listScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {filteredStudents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="search" size={36} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>No Students Found</Text>
                <Text style={styles.emptySubtitle}>
                  No students matched your search or selected filter.
                </Text>
              </View>
            ) : (
              filteredStudents.map((item, index) => {
                const currentGrade = gradesState[item.studentId] || { marks: "", feedback: "" };
                const marksVal = currentGrade.marks;
                const feedbackVal = currentGrade.feedback;

                const origMarksStr = item.initialMarks !== null ? String(item.initialMarks) : "";
                const origFeedbackStr = item.initialFeedback.trim();
                const isModified =
                  marksVal.trim() !== origMarksStr || feedbackVal.trim() !== origFeedbackStr;

                const num = parseFloat(marksVal.trim());
                const isMarksInvalid = marksVal.trim().length > 0 && (isNaN(num) || num < 0 || num > assessment.totalMarks);
                const isExpanded = expandedStudentId === item.studentId;

                const hasAttachments = item.attachments && item.attachments.length > 0;
                const hasLinks = item.links && item.links.length > 0;
                const hasContentNotes = Boolean(item.content?.trim());
                const canPreviewSubmission = hasAttachments || hasLinks || hasContentNotes;

                return (
                  <View
                    key={item.studentId}
                    style={[
                      styles.studentRowCard,
                      isModified && styles.studentRowCardModified,
                      isMarksInvalid && styles.studentRowCardInvalid,
                    ]}
                  >
                    {/* Top Row: Index + Avatar + Name + ID + Badges */}
                    <View style={styles.studentRowTop}>
                      {/* Index counter */}
                      <Text style={styles.indexNumText}>{index + 1}.</Text>

                      {/* Avatar */}
                      {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase() || "S"}
                          </Text>
                        </View>
                      )}

                      {/* Student Info */}
                      <View style={styles.nameIdContainer}>
                        <View style={styles.nameHeaderRow}>
                          <Text style={styles.studentNameText} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {isModified && (
                            <View style={styles.modifiedBadge}>
                              <Text style={styles.modifiedBadgeText}>Edited</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.studentMetaRow}>
                          {item.studentIdDisplay ? (
                            <View style={styles.studentIdBadge}>
                              <Feather name="hash" size={10} color="#475569" style={{ marginRight: 2 }} />
                              <Text style={styles.studentIdBadgeText}>{item.studentIdDisplay}</Text>
                            </View>
                          ) : null}

                          {/* Submission status badge */}
                          {isOffline ? (
                            <View style={styles.offlineStatusBadge}>
                              <Text style={styles.offlineStatusBadgeText}>In-Person</Text>
                            </View>
                          ) : item.hasSubmitted ? (
                            <View
                              style={[
                                styles.statusBadgeSubmitted,
                                item.isLate && styles.statusBadgeLate,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeSubmittedText,
                                  item.isLate && styles.statusBadgeLateText,
                                ]}
                              >
                                {item.isLate ? "Late" : "Submitted"}
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.statusBadgeMissing}>
                              <Text style={styles.statusBadgeMissingText}>Missing</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Marks Input Box */}
                      <View style={styles.marksInputWrapper}>
                        <TextInput
                          style={[
                            styles.marksInput,
                            isMarksInvalid && styles.marksInputError,
                            isModified && styles.marksInputModified,
                          ]}
                          placeholder="—"
                          placeholderTextColor="#94a3b8"
                          value={marksVal}
                          onChangeText={(txt) => handleMarksChange(item.studentId, txt)}
                          keyboardType="decimal-pad"
                          selectTextOnFocus
                          maxLength={6}
                        />
                        <Text style={styles.marksTotalLabel}>/{assessment.totalMarks}</Text>
                      </View>
                    </View>

                    {/* Invalid Mark Warning Note */}
                    {isMarksInvalid && (
                      <View style={styles.errorRow}>
                        <Feather name="alert-circle" size={12} color="#ef4444" style={{ marginRight: 4 }} />
                        <Text style={styles.errorRowText}>
                          Marks must be between 0 and {assessment.totalMarks}
                        </Text>
                      </View>
                    )}

                    {/* Middle Row: Expand Submission Preview or Quick Feedback */}
                    <View style={styles.actionPillsRow}>
                      {/* Submission preview toggle button */}
                      {canPreviewSubmission && (
                        <TouchableOpacity
                          style={[styles.smallActionBtn, isExpanded && styles.smallActionBtnActive]}
                          onPress={() =>
                            setExpandedStudentId((prev) => (prev === item.studentId ? null : item.studentId))
                          }
                          activeOpacity={0.7}
                        >
                          <Feather
                            name={isExpanded ? "chevron-up" : "paperclip"}
                            size={12}
                            color={isExpanded ? "#2563eb" : "#475569"}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.smallActionBtnText,
                              isExpanded && styles.smallActionBtnTextActive,
                            ]}
                          >
                            {isExpanded
                              ? "Hide Files"
                              : `View Work (${(item.attachments?.length || 0) + (item.links?.length || 0)})`}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Preset Feedback Chips */}
                      <TouchableOpacity
                        style={styles.presetChip}
                        onPress={() => handleApplyPresetFeedback(item.studentId, "Excellent work! ⭐")}
                      >
                        <Text style={styles.presetChipText}>Excellent ⭐</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.presetChip}
                        onPress={() => handleApplyPresetFeedback(item.studentId, "Good effort 👍")}
                      >
                        <Text style={styles.presetChipText}>Good 👍</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Expandable Submission Files / Work Preview */}
                    {isExpanded && canPreviewSubmission && (
                      <View style={styles.expandedSubmissionPreview}>
                        <Text style={styles.previewSectionTitle}>Student Submission:</Text>
                        {item.content ? (
                          <View style={styles.previewContentBox}>
                            <Text style={styles.previewContentText}>"{item.content}"</Text>
                          </View>
                        ) : null}

                        {item.attachments?.map((att, attIdx) => (
                          <TouchableOpacity
                            key={attIdx}
                            style={styles.attachmentPreviewItem}
                            onPress={() => openSafeUrl(att.url)}
                          >
                            <Feather name="file-text" size={14} color="#2563eb" style={{ marginRight: 6 }} />
                            <Text style={styles.attachmentPreviewText} numberOfLines={1}>
                              {att.name || "Attachment"}
                            </Text>
                            <Feather name="external-link" size={12} color="#94a3b8" style={{ marginLeft: "auto" }} />
                          </TouchableOpacity>
                        ))}

                        {item.links?.map((lnk, lnkIdx) => (
                          <TouchableOpacity
                            key={lnkIdx}
                            style={styles.attachmentPreviewItem}
                            onPress={() => openSafeUrl(lnk.url)}
                          >
                            <Feather name="link" size={14} color="#0891b2" style={{ marginRight: 6 }} />
                            <Text style={styles.attachmentPreviewText} numberOfLines={1}>
                              {lnk.title || lnk.url}
                            </Text>
                            <Feather name="external-link" size={12} color="#94a3b8" style={{ marginLeft: "auto" }} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Feedback Input Row */}
                    <View style={styles.feedbackRow}>
                      <Feather name="message-square" size={13} color="#94a3b8" style={styles.feedbackIcon} />
                      <TextInput
                        style={styles.feedbackInput}
                        placeholder="Add optional student feedback..."
                        placeholderTextColor="#94a3b8"
                        value={feedbackVal}
                        onChangeText={(txt) => handleFeedbackChange(item.studentId, txt)}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Sticky Bottom Summary & Save Bar */}
          <View
            style={[
              styles.bottomDockedBar,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <View style={styles.bottomStatsCol}>
              <Text style={styles.bottomStatsTitle}>
                {totalGradedCount} of {allStudents.length} Graded
              </Text>
              <Text style={styles.bottomStatsSubtitle}>
                {modifiedEntries.length > 0
                  ? `${modifiedEntries.length} student${modifiedEntries.length > 1 ? "s" : ""} modified`
                  : "All marks up to date"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveAllBtn,
                (modifiedEntries.length === 0 || invalidEntriesCount > 0 || isPending) &&
                  styles.saveAllBtnDisabled,
              ]}
              onPress={handleSaveAll}
              disabled={modifiedEntries.length === 0 || invalidEntriesCount > 0 || isPending}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save all bulk marks"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.saveAllBtnText}>
                    Save {modifiedEntries.length > 0 ? `(${modifiedEntries.length})` : "Grades"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {isVisible && <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />}
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerCenterCol: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitleText: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  quickActionTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionDropdown: {
    backgroundColor: "#ffffff",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionHeading: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickActionButtonsRow: {
    flexDirection: "column",
    gap: 6,
  },
  quickActionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  quickActionOptionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#ffffff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: "#0f172a",
    paddingVertical: 0,
  },
  filterPillsRow: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 8,
  },
  filterPillsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  pillActive: {
    backgroundColor: "#0f172a",
  },
  pillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  listScrollView: {
    flex: 1,
  },
  listScrollContent: {
    padding: 14,
    paddingBottom: 40,
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    maxWidth: 240,
  },
  studentRowCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  studentRowCardModified: {
    borderColor: "#93c5fd",
    backgroundColor: "#f0fdf4",
  },
  studentRowCardInvalid: {
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
  },
  studentRowTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  indexNumText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    width: 24,
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  nameIdContainer: {
    flex: 1,
    marginRight: 10,
  },
  nameHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  studentNameText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    flexShrink: 1,
  },
  modifiedBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  modifiedBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
  },
  studentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  studentIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  studentIdBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  offlineStatusBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  offlineStatusBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#0369a1",
  },
  statusBadgeSubmitted: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statusBadgeSubmittedText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#16a34a",
  },
  statusBadgeLate: {
    backgroundColor: "#fef3c7",
  },
  statusBadgeLateText: {
    color: "#b45309",
  },
  statusBadgeMissing: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statusBadgeMissingText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
  },
  marksInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  marksInput: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    width: 44,
    textAlign: "center",
    paddingVertical: 2,
  },
  marksInputModified: {
    color: "#15803d",
  },
  marksInputError: {
    borderColor: "#ef4444",
    color: "#dc2626",
  },
  marksTotalLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    marginLeft: 2,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingLeft: 34,
  },
  errorRowText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#ef4444",
  },
  actionPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingLeft: 34,
  },
  smallActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smallActionBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  smallActionBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  smallActionBtnTextActive: {
    color: "#2563eb",
  },
  presetChip: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  presetChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  expandedSubmissionPreview: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginLeft: 34,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  previewSectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  previewContentBox: {
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  previewContentText: {
    fontFamily,
    fontSize: 12,
    color: "#334155",
    fontStyle: "italic",
  },
  attachmentPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  attachmentPreviewText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 34,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  feedbackIcon: {
    marginRight: 6,
  },
  feedbackInput: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    paddingVertical: 3,
  },
  bottomDockedBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomStatsCol: {
    flex: 1,
  },
  bottomStatsTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  bottomStatsSubtitle: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    marginTop: 1,
  },
  saveAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 130,
  },
  saveAllBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.7,
  },
  saveAllBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});

