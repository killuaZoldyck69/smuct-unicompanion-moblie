import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../../src/services/api";
import { colors } from "../../../src/theme/colors";
import { typography } from "../../../src/theme/typography";

import AssessmentCard from "../../../src/components/hub/cards/AssessmentCard";
import { spacing } from "../../../src/theme/layout";

export default function HubAssessmentsScreen() {
  // 👇 1. Grab the assessmentId from the route parameters
  const { id, assessmentId } = useLocalSearchParams<{
    id: string;
    assessmentId?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 👇 2. Automatically expand the card if an assessmentId was passed
  const [expandedId, setExpandedId] = useState<string | null>(
    assessmentId || null,
  );

  // --- Data Fetching ---
  const { data: myHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => (await api.get("/hubs/my")).data?.data || [],
  });

  const { data: hubDetails } = useQuery({
    queryKey: ["hub", id],
    queryFn: async () => (await api.get(`/hubs/${id}`)).data?.data,
  });

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["hubAssessments", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/assessments`)).data?.data || [],
  });

  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === id || m.hub?.id === id,
  );
  const myRole = myHubMembership?.role;
  const myUserId = myHubMembership?.userId;

  const canManage = ["TEACHER", "TA"].includes(myRole);
  const canSubmit = ["STUDENT", "CR", "TA"].includes(myRole);

  // --- Mutations ---
  const submitWorkMutation = useMutation({
    mutationFn: async (payload: {
      assessmentId: string;
      submittedUrl: string;
    }) =>
      await api.post(`/hubs/${id}/assessments/${payload.assessmentId}/submit`, {
        submittedUrl: payload.submittedUrl,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAssessments", id] });
      Toast.show({ type: "success", text1: "Work Submitted!" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: err.response?.data?.message || err.message,
      }),
  });

  const gradeWorkMutation = useMutation({
    mutationFn: async ({
      assessmentId,
      studentId,
      marks,
    }: {
      assessmentId: string;
      studentId: string;
      marks: number;
    }) =>
      await api.post(`/hubs/${id}/assessments/${assessmentId}/bulk-grade`, [
        { studentId, marks },
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAssessments", id] });
      Toast.show({ type: "success", text1: "Grade Saved!" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Grading Failed",
        text2: err.response?.data?.message || err.message,
      }),
  });

  // 👇 3. Filter the data so ONLY the clicked assessment is shown
  const displayedAssessments = assessmentId
    ? assessments.filter((a: any) => a.id === assessmentId)
    : assessments;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment Details</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryContainer}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={displayedAssessments} // 👈 Use the filtered list here
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AssessmentCard
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === item.id ? null : item.id))
              }
              hubMembers={hubDetails?.members || []}
              myUserId={myUserId}
              canManage={canManage}
              canSubmit={canSubmit}
              submitMutation={submitWorkMutation}
              gradeMutation={gradeWorkMutation}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Assessment not found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: 16 },
  headerTitle: {
    ...typography.titleLg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: 40,
  },
});
