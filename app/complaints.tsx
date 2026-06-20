import React, { useState, useMemo } from "react";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

type FilterType = "ALL" | "PENDING" | "RESOLVED" | "REJECTED";

const CATEGORIES = ["Facilities", "Academic", "Hostel", "IT Support", "Other"];

export default function MyComplaintsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "Facilities",
  });

  // --- Fetch Data ---
  const { data: complaints, isLoading } = useQuery({
    queryKey: ["myComplaints"],
    queryFn: async () => {
      const response = await api.get("/complaints/my");
      return response.data?.data || [];
    },
  });

  // --- Mutations ---
  const createComplaintMutation = useMutation({
    mutationFn: async (payload: typeof newComplaint) =>
      await api.post("/complaints", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myComplaints"] });
      Toast.show({
        type: "success",
        text1: "Complaint Submitted",
        text2: "We will look into this shortly.",
      });
      setIsComposeVisible(false);
      setNewComplaint({ title: "", description: "", category: "Facilities" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Submission Failed",
        text2: err.message,
      }),
  });

  const handleSubmit = () => {
    if (!newComplaint.title.trim() || !newComplaint.description.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please provide a title and description.",
      });
      return;
    }
    createComplaintMutation.mutate(newComplaint);
  };

  // --- Filtering Logic ---
  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    if (activeFilter === "ALL") return complaints;
    return complaints.filter((c: any) => c.status === activeFilter);
  }, [complaints, activeFilter]);

  // --- Render Functions ---
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.statusText, { color: "#2E7D32" }]}>
              Resolved
            </Text>
          </View>
        );
      case "REJECTED":
        return (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: colors.errorContainer },
            ]}
          >
            <Text style={[styles.statusText, { color: colors.error }]}>
              Rejected
            </Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.statusText, { color: "#E65100" }]}>
              Pending
            </Text>
          </View>
        );
    }
  };

  const renderComplaintCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        {renderStatusBadge(item.status)}
      </View>

      <Text style={styles.complaintTitle}>{item.title}</Text>
      <Text style={styles.complaintDesc}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerRow}>
          <Feather
            name="calendar"
            size={14}
            color={colors.outline}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.dateText}>
            Submitted on {formatDate(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.ticketId}>
          ID: #{item.id.slice(-6).toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Help & Complaints</Text>
          <Text style={styles.headerSubtitle}>
            Track and report campus issues
          </Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.tabsContainer}>
        {["ALL", "PENDING", "RESOLVED"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.tabButton,
              activeFilter === filter && styles.tabButtonActive,
            ]}
            onPress={() => setActiveFilter(filter as FilterType)}
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === filter && styles.tabTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : filteredComplaints.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="check-circle"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Complaints Found</Text>
          <Text style={styles.emptySubtitle}>
            You don't have any {activeFilter.toLowerCase()} complaints.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id}
          renderItem={renderComplaintCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsComposeVisible(true)}
      >
        <Feather name="plus" size={24} color={colors.onPrimary} />
      </TouchableOpacity>

      {/* Compose Modal */}
      <Modal
        visible={isComposeVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsComposeVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Complaint</Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={createComplaintMutation.isPending}
              >
                {createComplaintMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newComplaint.category}
                  onValueChange={(itemValue) =>
                    setNewComplaint({ ...newComplaint, category: itemValue })
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Issue Title</Text>
              <TextInput
                style={styles.input}
                value={newComplaint.title}
                onChangeText={(text) =>
                  setNewComplaint({ ...newComplaint, title: text })
                }
                placeholder="Brief summary of the issue"
                placeholderTextColor={colors.outlineVariant}
              />

              <Text style={styles.label}>Detailed Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newComplaint.description}
                onChangeText={(text) =>
                  setNewComplaint({ ...newComplaint, description: text })
                }
                placeholder="Provide all necessary details (location, time, context)..."
                placeholderTextColor={colors.outlineVariant}
                multiline
                textAlignVertical="top"
              />
            </View>
          </KeyboardAvoidingView>
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

  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.stackMd,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: colors.primaryContainer },
  tabText: { ...typography.labelMd, color: colors.outline },
  tabTextActive: { color: colors.primaryContainer, fontWeight: "700" },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  emptyTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  emptySubtitle: { ...typography.bodyMd, color: colors.outline },

  listContent: { padding: spacing.marginMobile, paddingBottom: 120 },
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
    marginBottom: spacing.stackMd,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: rounded.md,
  },
  categoryText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.full,
  },
  statusText: {
    ...typography.labelSm,
    fontWeight: "800",
    textTransform: "uppercase",
    fontSize: 10,
  },

  complaintTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 6,
  },
  complaintDesc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.stackLg,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  footerRow: { flexDirection: "row", alignItems: "center" },
  dateText: { ...typography.labelSm, color: colors.outline },
  ticketId: {
    ...typography.labelSm,
    color: colors.outline,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },

  // Modal Styles
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
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  textArea: { minHeight: 120 },
  pickerContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    overflow: "hidden",
  },
});
