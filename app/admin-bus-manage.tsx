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

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

export default function AdminBusManageScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    route: "",
    busNumber: "",
    departureTime: "",
    stops: "", // Will be split into array by commas
  });

  // Fetch Existing
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["busSchedules"],
    queryFn: async () => {
      const response = await api.get("/buses");
      return response.data?.data || [];
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/buses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["busSchedules"] });
      Toast.show({ type: "success", text1: "Schedule Removed" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to remove",
        text2: err.message,
      }),
  });

  const handleDelete = (id: string, route: string) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Delete the "${route}" route?`))
        deleteMutation.mutate(id);
    } else {
      Alert.alert(
        "Delete Route?",
        `Are you sure you want to remove "${route}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteMutation.mutate(id),
          },
        ],
      );
    }
  };

  const handleAddSchedule = async () => {
    if (!formData.route || !formData.departureTime) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Route and Departure Time are required.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        route: formData.route.trim(),
        busNumber: formData.busNumber.trim() || "N/A",
        departureTime: formData.departureTime.trim(),
        stops: formData.stops
          ? formData.stops
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s !== "")
          : [],
      };

      await api.post("/buses", payload);

      queryClient.invalidateQueries({ queryKey: ["busSchedules"] });
      Toast.show({ type: "success", text1: "Route Added!" });

      setFormData({ route: "", busNumber: "", departureTime: "", stops: "" });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to add",
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
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather
          name={icon}
          size={18}
          color={colors.outline}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={formData[key]}
          onChangeText={(text) => setFormData({ ...formData, [key]: text })}
          placeholder={placeholder}
          placeholderTextColor={colors.outlineVariant}
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
          <Text style={styles.headerTitle}>Manage Transport</Text>
          <Text style={styles.headerSubtitle}>Add or remove bus schedules</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ADD NEW SCHEDULE */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ADD NEW ROUTE</Text>
          {renderInput("Route Name", "route", "map", "e.g. Campus to Azimpur")}
          {renderInput(
            "Departure Time",
            "departureTime",
            "clock",
            "e.g. 07:00 AM",
          )}
          {renderInput(
            "Bus Number (Optional)",
            "busNumber",
            "hash",
            "e.g. Bus-1",
          )}
          {renderInput(
            "Stops (Comma Separated)",
            "stops",
            "map-pin",
            "e.g. Azimpur, Dhanmondi, Savar",
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleAddSchedule}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.submitButtonText}>Add Schedule</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* MANAGE EXISTING */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>ACTIVE ROUTES</Text>
          {isLoading ? (
            <ActivityIndicator
              color={colors.primaryContainer}
              style={{ marginVertical: spacing.stackLg }}
            />
          ) : schedules?.length === 0 ? (
            <Text style={styles.emptyText}>No routes exist yet.</Text>
          ) : (
            schedules?.map((item: any) => (
              <View key={item.id} style={styles.activeRow}>
                <View style={{ flex: 1, paddingRight: spacing.stackMd }}>
                  <Text style={styles.activeTitle} numberOfLines={1}>
                    {item.route}
                  </Text>
                  <Text style={styles.activeSub}>
                    {item.departureTime} • Bus: {item.busNumber}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id, item.route)}
                  disabled={deleteMutation.isPending}
                >
                  <Feather name="trash-2" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
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
  inputIcon: { marginRight: spacing.stackMd },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },

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
