import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import {
  useMyComplaints,
  useCreateComplaint,
} from "@/features/complaints/useComplaints";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
} from "../shared/design-tokens";

type FilterType = "ALL" | "PENDING" | "RESOLVED" | "REJECTED";

const CATEGORIES = [
  "Facilities",
  "Academic",
  "Hostel",
  "IT Support",
  "Other",
] as const;

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Rejected", value: "REJECTED" },
];

export const ComplaintsSection = React.memo(function ComplaintsSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Facilities");

  const { data: complaints, isLoading, refetch, isRefetching } = useMyComplaints();
  const createComplaintMutation = useCreateComplaint();

  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    if (activeFilter === "ALL") return complaints;
    return complaints.filter((c: any) => c.status === activeFilter);
  }, [complaints, activeFilter]);

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please provide both title and details.",
      });
      return;
    }

    createComplaintMutation.mutate(
      { title: trimmedTitle, description: trimmedDescription, category },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Complaint Submitted",
            text2: "Your complaint has been submitted to administration.",
          });
          setIsComposeVisible(false);
          setTitle("");
          setDescription("");
          setCategory("Facilities");
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Submission Failed",
            text2: err.message || "Could not submit complaint.",
          });
        },
      }
    );
  }, [title, description, category, createComplaintMutation]);

  const renderStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <View style={[styles.statusBadge, styles.statusResolved]}>
            <Feather name="check-circle" size={12} color="#047857" />
            <Text style={[styles.statusText, styles.statusResolvedText]}>
              Resolved
            </Text>
          </View>
        );
      case "REJECTED":
        return (
          <View style={[styles.statusBadge, styles.statusRejected]}>
            <Feather name="x-circle" size={12} color="#b91c1c" />
            <Text style={[styles.statusText, styles.statusRejectedText]}>
              Rejected
            </Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Feather name="clock" size={12} color="#b45309" />
            <Text style={[styles.statusText, styles.statusPendingText]}>
              Pending
            </Text>
          </View>
        );
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{item.category}</Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerTime}>
            <Feather name="calendar" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.idText}>
            #{item.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>
      </View>
    ),
    [renderStatusBadge]
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((opt) => {
          const isActive = activeFilter === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(opt.value)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${opt.label}`}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isActive && styles.filterPillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CAMPUS_HUB_COLORS.complaintAccent} />
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            filteredComplaints.length === 0 && styles.listEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[CAMPUS_HUB_COLORS.complaintAccent]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="shield"
                size={40}
                color={CAMPUS_HUB_COLORS.subtleText}
              />
              <Text style={styles.emptyTitle}>No Complaints Found</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === "ALL"
                  ? "You haven't submitted any complaints yet."
                  : `No ${activeFilter.toLowerCase()} complaints at this time.`}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsComposeVisible(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="File new complaint"
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={isComposeVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsComposeVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>File a Complaint</Text>
            <TouchableOpacity
              onPress={() => setIsComposeVisible(false)}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>CATEGORY</Text>
            <View style={styles.categorySelectRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChoice,
                      isSelected && styles.categoryChoiceActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChoiceText,
                        isSelected && styles.categoryChoiceTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>TITLE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief summary of the issue..."
              placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
              value={title}
              onChangeText={setTitle}
              maxLength={150}
            />

            <Text style={styles.inputLabel}>DETAILS</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe the complaint with specific details, location, and context..."
              placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitBtn,
                createComplaintMutation.isPending && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={createComplaintMutation.isPending}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Submit complaint"
            >
              {createComplaintMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Complaint</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  filterPillActive: {
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
  },
  filterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
    gap: 12,
  },
  listEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 18,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.complaintAccentText,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusPendingText: {
    color: "#b45309",
  },
  statusResolved: {
    backgroundColor: "#d1fae5",
  },
  statusResolvedText: {
    color: "#047857",
  },
  statusRejected: {
    backgroundColor: "#fee2e2",
  },
  statusRejectedText: {
    color: "#b91c1c",
  },
  statusText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
  },
  cardTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  footerTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  idText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  modalTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  inputLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  categorySelectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  categoryChoice: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: "#f1f5f9",
  },
  categoryChoiceActive: {
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
  },
  categoryChoiceText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  categoryChoiceTextActive: {
    color: "#ffffff",
  },
  textInput: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    minHeight: 110,
  },
  submitBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccent,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
