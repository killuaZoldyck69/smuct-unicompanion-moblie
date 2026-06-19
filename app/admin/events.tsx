import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

export default function AdminEventsManageScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    eventDate: "", // e.g., 2026-12-25
    eventTime: "", // e.g., 10:00 AM
  });

  // Fetch Existing Events
  const { data: events, isLoading } = useQuery({
    queryKey: ["campusEvents"],
    queryFn: async () => {
      const response = await api.get("/events");
      return response.data?.data || [];
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
      Toast.show({ type: "success", text1: "Event Cancelled" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to remove",
        text2: err.message,
      }),
  });

  const handleDelete = (id: string, title: string) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Delete the event "${title}"?`))
        deleteMutation.mutate(id);
    } else {
      Alert.alert(
        "Cancel Event?",
        `Are you sure you want to remove "${title}"?`,
        [
          { text: "Keep", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMutation.mutate(id),
          },
        ],
      );
    }
  };

  const handleAddEvent = async () => {
    if (!formData.title || !formData.eventDate) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Title and Date are required.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine Date and Time into a single ISO string for the backend
      const combinedDateTimeStr = `${formData.eventDate} ${formData.eventTime || "00:00"}`;
      const isoDate = new Date(combinedDateTimeStr).toISOString();

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        eventDate: isoDate,
      };

      await api.post("/events", payload);

      queryClient.invalidateQueries({ queryKey: ["campusEvents"] });
      Toast.show({ type: "success", text1: "Event Scheduled!" });

      setFormData({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        eventTime: "",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to schedule",
        text2: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    key: keyof typeof formData,
    icon: any,
    placeholder: string,
    multiline = false,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}
      >
        <Feather
          name={icon}
          size={18}
          color={colors.outline}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={placeholder}
          placeholderTextColor={colors.outlineVariant}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
        />
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
          <Text style={styles.headerTitle}>Event Scheduler</Text>
          <Text style={styles.headerSubtitle}>Add or remove campus events</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ADD NEW EVENT */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>SCHEDULE NEW EVENT</Text>
          {renderInput(
            "Event Title",
            "title",
            "type",
            "e.g. Spring Festival 2026",
          )}
          {renderInput(
            "Location (Optional)",
            "location",
            "map-pin",
            "e.g. Main Auditorium",
          )}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.stackSm }}>
              {renderInput("Date", "eventDate", "calendar", "YYYY-MM-DD")}
            </View>
            <View style={{ flex: 1, marginLeft: spacing.stackSm }}>
              {renderInput("Time (Optional)", "eventTime", "clock", "10:00 AM")}
            </View>
          </View>

          {renderInput(
            "Description (Optional)",
            "description",
            "align-left",
            "Event details...",
            true,
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleAddEvent}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>Schedule Event</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* MANAGE EXISTING */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>UPCOMING EVENTS</Text>
          {isLoading ? (
            <ActivityIndicator
              color={colors.primaryContainer}
              style={{ marginVertical: spacing.stackLg }}
            />
          ) : events?.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming events.</Text>
          ) : (
            events?.map((item: any) => {
              const displayDate = new Date(item.eventDate).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              );
              return (
                <View key={item.id} style={styles.activeRow}>
                  <View style={styles.datePill}>
                    <Text style={styles.datePillText}>{displayDate}</Text>
                  </View>
                  <View style={{ flex: 1, paddingRight: spacing.stackMd }}>
                    <Text style={styles.activeTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.activeSub}>
                      {item.location || "TBA"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id, item.title)}
                    disabled={deleteMutation.isPending}
                  >
                    <Feather name="trash-2" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },
  scrollContent: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.marginMobile,
    marginBottom: spacing.stackLg,
    ...shadows.level1,
  },
  cardHeader: {
    ...typography.labelSm,
    color: colors.outline,
    letterSpacing: 1.5,
    marginBottom: spacing.stackLg,
  },

  row: { flexDirection: "row", justifyContent: "space-between" },
  inputGroup: { marginBottom: spacing.stackMd },
  inputLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    height: 48,
    borderRadius: rounded.md,
    paddingHorizontal: spacing.stackSm,
  },
  inputWrapperMultiline: {
    height: 100,
    alignItems: "flex-start",
    paddingTop: spacing.stackSm,
  },
  inputIcon: { marginRight: spacing.stackMd },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },
  inputMultiline: { height: "100%" },

  submitButton: {
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.lg,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.stackSm,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: "600",
  },

  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginVertical: spacing.stackLg,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.stackMd,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  datePill: {
    backgroundColor: colors.primaryContainer + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
    marginRight: spacing.stackMd,
  },
  datePillText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
  activeTitle: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
  },
  activeSub: { ...typography.labelSm, color: colors.outline, marginTop: 2 },
  deleteBtn: {
    padding: spacing.stackSm,
    backgroundColor: colors.errorContainer,
    borderRadius: rounded.md,
  },
});
