import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "@/services/api";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";

import AssessmentCard from "@/screens/hub-detail/components/assessment-detail-card";
import { spacing } from "@/theme/layout";

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
  const [activeFilterId, setActiveFilterId] = useState<string | null>(
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

  const { data: assessments, isLoading, refetch } = useQuery({
    queryKey: ["hubAssessments", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/assessments`)).data?.data || [],
  });

  const safeAssessments = useMemo(
    () => (Array.isArray(assessments) ? assessments : []),
    [assessments],
  );

  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === id || m.hub?.id === id,
  );
  const myRole = myHubMembership?.role;
  const myUserId = myHubMembership?.userId;

  const canManage = ["TEACHER", "CR", "TA"].includes(myRole);
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
      queryClient.invalidateQueries({ queryKey: ["assessments", id] });
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
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
      queryClient.invalidateQueries({ queryKey: ["assessments", id] });
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
      Toast.show({ type: "success", text1: "Grade Saved!" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Grading Failed",
        text2: err.response?.data?.message || err.message,
      }),
  });

  // 👇 3. Filter safely so undefined is never accessed with .filter()
  const displayedAssessments = useMemo(() => {
    if (!activeFilterId) return safeAssessments;
    const filtered = safeAssessments.filter((a: any) => a.id === activeFilterId);
    return filtered.length > 0 ? filtered : safeAssessments;
  }, [activeFilterId, safeAssessments]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/hub/${id}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color="#131b2e" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {activeFilterId ? "Coursework Details" : "All Coursework"}
          </Text>
          {hubDetails?.courseName ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {hubDetails.courseCode} • {hubDetails.courseName}
            </Text>
          ) : null}
        </View>
        {activeFilterId && safeAssessments.length > 1 ? (
          <TouchableOpacity
            style={styles.viewAllBadge}
            onPress={() => setActiveFilterId(null)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View all coursework"
          >
            <Text style={styles.viewAllBadgeText}>View All ({safeAssessments.length})</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primaryContainer}
          />
          <Text style={styles.loadingText}>Loading coursework...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedAssessments}
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
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No coursework found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(19, 27, 46, 0.08)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7f9fb",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  viewAllBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#131b2e",
    marginLeft: 10,
  },
  viewAllBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: 14,
  },
  loadingText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
    gap: 14,
  },
  emptyText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
  },
});
