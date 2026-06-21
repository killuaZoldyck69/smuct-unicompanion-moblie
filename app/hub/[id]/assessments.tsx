import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

import api from "../../../src/services/api";
import { colors } from "../../../src/theme/colors";
import { typography } from "../../../src/theme/typography";
import { spacing, rounded, shadows } from "../../../src/theme/layout";

// --- Live Countdown Hook ---
const useCountdown = (deadline: string) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(deadline).getTime() - new Date().getTime();
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft("Deadline Passed");
        return;
      }
      setIsOverdue(false);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m remaining`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [deadline]);

  return { timeLeft, isOverdue };
};

export default function HubAssessmentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modals
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [submitModalData, setSubmitModalData] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [gradingModalData, setGradingModalData] = useState<any>(null);

  // Forms
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    type: "ASSIGNMENT",
    deadline: "",
    totalMarks: "100",
  });
  const [submittedUrl, setSubmittedUrl] = useState("");
  const [gradingMarks, setGradingMarks] = useState<{ [key: string]: string }>(
    {},
  );

  // --- Fetch Data ---
  const { data: hubDetails } = useQuery({
    queryKey: ["hub", id],
    queryFn: async () => (await api.get(`/hubs/${id}`)).data?.data,
  });

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["hubAssessments", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/assessments`)).data?.data || [],
  });

  // --- Identify User Role ---
  const { data: myHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => {
      const response = await api.get("/hubs/my");
      return response.data?.data || [];
    },
  });

  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === id || m.hub?.id === id,
  );
  const myRole = myHubMembership?.role;
  const canManage = ["TEACHER", "CR", "TA"].includes(myRole);

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/assessments`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAssessments", id] });
      Toast.show({ type: "success", text1: "Assessment Created" });
      setIsCreateModalVisible(false);
      setNewAssessment({
        title: "",
        description: "",
        type: "ASSIGNMENT",
        deadline: "",
        totalMarks: "100",
      });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to create",
        text2: err.message,
      }),
  });

  const submitMutation = useMutation({
    mutationFn: async ({
      assessmentId,
      url,
    }: {
      assessmentId: string;
      url: string;
    }) =>
      await api.post(`/assessments/${assessmentId}/submit`, {
        submittedUrl: url,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAssessments", id] });
      Toast.show({ type: "success", text1: "Work Submitted!" });
      setSubmitModalData(null);
      setSubmittedUrl("");
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: err.message,
      }),
  });

  const gradeMutation = useMutation({
    mutationFn: async ({
      submissionId,
      marks,
    }: {
      submissionId: string;
      marks: number;
    }) => await api.patch(`/submissions/${submissionId}/grade`, { marks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAssessments", id] });
      Toast.show({ type: "success", text1: "Grade Saved" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Grading Failed",
        text2: err.message,
      }),
  });

  // --- Handlers ---
  const handleCreate = () => {
    if (!newAssessment.title || !newAssessment.deadline)
      return Toast.show({
        type: "error",
        text1: "Title and Deadline required",
      });

    createMutation.mutate({
      ...newAssessment,
      totalMarks: parseFloat(newAssessment.totalMarks) || 100,
      deadline: new Date(newAssessment.deadline).toISOString(),
    });
  };

  const openLink = (url: string) =>
    Linking.openURL(url).catch(() =>
      Toast.show({ type: "error", text1: "Invalid URL" }),
    );

  // --- Render Components ---
  const AssessmentCard = ({ item }: { item: any }) => {
    const { timeLeft, isOverdue } = useCountdown(item.deadline);
    const mySub = item.submissions?.find(
      (s: any) => s.studentId === myHubMembership?.userId,
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <View
            style={[
              styles.timerBadge,
              isOverdue && { backgroundColor: colors.errorContainer },
            ]}
          >
            <Feather
              name="clock"
              size={12}
              color={isOverdue ? colors.error : colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.timerText, isOverdue && { color: colors.error }]}
            >
              {timeLeft}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.marksText}>Total Marks: {item.totalMarks}</Text>

          {canManage ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setGradingModalData(item)}
            >
              <Text style={styles.actionBtnText}>
                Grade ({item.submissions?.length || 0})
              </Text>
            </TouchableOpacity>
          ) : mySub ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>
                {mySub.marks !== null
                  ? `Graded: ${mySub.marks}/${item.totalMarks}`
                  : "Submitted"}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                isOverdue && {
                  backgroundColor: colors.surfaceContainerHighest,
                },
              ]}
              onPress={() =>
                setSubmitModalData({ id: item.id, title: item.title })
              }
              disabled={isOverdue}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  isOverdue && { color: colors.outline },
                ]}
              >
                Submit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderGradingRow = ({ item }: { item: any }) => (
    <View style={styles.gradingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.studentName}>{item.student?.name}</Text>
        <TouchableOpacity onPress={() => openLink(item.submittedUrl)}>
          <Text style={styles.linkText} numberOfLines={1}>
            View Work
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.scoreInputBox}>
        <TextInput
          style={styles.scoreInput}
          placeholder={item.marks !== null ? String(item.marks) : "0"}
          keyboardType="numeric"
          onChangeText={(val) =>
            setGradingMarks((prev) => ({ ...prev, [item.id]: val }))
          }
        />
        <TouchableOpacity
          style={styles.saveGradeBtn}
          onPress={() =>
            gradeMutation.mutate({
              submissionId: item.id,
              marks: parseFloat(gradingMarks[item.id] || "0"),
            })
          }
        >
          <Feather name="check" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Assessments</Text>
          <Text style={styles.headerSubtitle}>
            {hubDetails?.courseCode || "Course"} Work
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : assessments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="file-text"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Assessments Yet</Text>
        </View>
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AssessmentCard item={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}

      {canManage && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* --- CREATE ASSESSMENT MODAL --- */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Assessment</Text>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={newAssessment.title}
                onChangeText={(t) =>
                  setNewAssessment({ ...newAssessment, title: t })
                }
                placeholder="e.g. Midterm Assignment"
              />

              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newAssessment.type}
                  onValueChange={(val) =>
                    setNewAssessment({ ...newAssessment, type: val })
                  }
                >
                  <Picker.Item label="Assignment" value="ASSIGNMENT" />
                  <Picker.Item label="Quiz" value="QUIZ" />
                  <Picker.Item label="Presentation" value="PRESENTATION" />
                </Picker>
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Deadline (YYYY-MM-DDTHH:MM)</Text>
                  <TextInput
                    style={styles.input}
                    value={newAssessment.deadline}
                    onChangeText={(t) =>
                      setNewAssessment({ ...newAssessment, deadline: t })
                    }
                    placeholder="2026-07-01T23:59"
                  />
                </View>
                <View style={{ flex: 0.5, marginLeft: 8 }}>
                  <Text style={styles.label}>Total Marks</Text>
                  <TextInput
                    style={styles.input}
                    value={newAssessment.totalMarks}
                    onChangeText={(t) =>
                      setNewAssessment({ ...newAssessment, totalMarks: t })
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* --- SUBMIT WORK MODAL --- */}
      <Modal visible={!!submitModalData} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                Submit: {submitModalData?.title}
              </Text>
              <TouchableOpacity onPress={() => setSubmitModalData(null)}>
                <Feather name="x" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Google Drive / Document URL</Text>
            <TextInput
              style={styles.input}
              value={submittedUrl}
              onChangeText={setSubmittedUrl}
              placeholder="https://docs.google.com/..."
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.submitBlockBtn}
              onPress={() =>
                submitMutation.mutate({
                  assessmentId: submitModalData!.id,
                  url: submittedUrl,
                })
              }
            >
              {submitMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBlockText}>Submit Assignment</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- GRADING MODAL --- */}
      <Modal
        visible={!!gradingModalData}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setGradingModalData(null)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Grading: {gradingModalData?.title}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <FlatList
            data={gradingModalData?.submissions || []}
            keyExtractor={(item) => item.id}
            renderItem={renderGradingRow}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyTitle}>No submissions yet.</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: { ...typography.titleLg, color: colors.outline },

  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackSm,
  },

  typeBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.md,
  },
  typeText: {
    ...typography.labelSm,
    fontWeight: "800",
    color: colors.onSurfaceVariant,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.full,
  },
  timerText: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "700",
  },

  cardTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.stackLg,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  marksText: { ...typography.labelMd, color: colors.outline },

  actionBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.md,
  },
  actionBtnText: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },
  statusBox: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.md,
  },
  statusText: { ...typography.labelMd, color: "#2E7D32", fontWeight: "700" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },

  // Modals
  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "700",
  },
  modalContent: { flex: 1, padding: spacing.marginMobile },
  label: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  rowInputs: { flexDirection: "row", justifyContent: "space-between" },
  pickerContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    overflow: "hidden",
  },

  // Grading Row
  gradingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.stackMd,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  studentName: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
  },
  linkText: {
    ...typography.bodyMd,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  scoreInputBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreInput: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 60,
    textAlign: "center",
    ...typography.bodyLg,
    fontWeight: "700",
  },
  saveGradeBtn: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: rounded.md,
  },

  // Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: rounded.xl,
    borderTopRightRadius: rounded.xl,
    padding: spacing.marginMobile,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  sheetTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  submitBlockBtn: {
    backgroundColor: colors.primaryContainer,
    paddingVertical: 16,
    borderRadius: rounded.md,
    alignItems: "center",
    marginTop: spacing.stackLg,
  },
  submitBlockText: { ...typography.labelMd, color: "#FFF", fontWeight: "700" },
});
