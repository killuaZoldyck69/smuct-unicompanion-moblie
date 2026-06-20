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
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

const INITIAL_FORM = {
  name: "",
  email: "",
  batch: "",
  graduationYear: "",
  department: "",
  degree: "",
  currentCompany: "",
  currentPosition: "",
  skills: "",
  linkedInUrl: "",
  personalWebsiteUrl: "",
};

export default function AdminAlumniScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");

  // Modals State
  const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [bulkJsonText, setBulkJsonText] = useState("");

  // --- Fetch Data ---
  const { data: alumniList, isLoading } = useQuery({
    queryKey: ["adminAlumni"],
    queryFn: async () => {
      const response = await api.get("/alumni");
      return response.data?.data || [];
    },
  });

  // --- Mutations ---
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingId) return await api.patch(`/alumni/${editingId}`, payload);
      return await api.post("/alumni", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAlumni"] });
      queryClient.invalidateQueries({ queryKey: ["alumniDirectory"] });
      Toast.show({
        type: "success",
        text1: editingId ? "Alumni Updated" : "Alumni Added",
      });
      closeSingleModal();
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Save Failed", text2: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/alumni/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAlumni"] });
      queryClient.invalidateQueries({ queryKey: ["alumniDirectory"] });
      Toast.show({ type: "info", text1: "Alumni Deleted" });
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (payload: any[]) =>
      await api.post("/alumni/bulk", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAlumni"] });
      queryClient.invalidateQueries({ queryKey: ["alumniDirectory"] });
      Toast.show({ type: "success", text1: "Bulk Upload Successful!" });
      setIsBulkModalVisible(false);
      setBulkJsonText("");
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Bulk Upload Failed",
        text2: err.message,
      }),
  });

  // --- Handlers ---
  const openAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsSingleModalVisible(true);
  };

  const openEditModal = (alumni: any) => {
    setEditingId(alumni.id);
    setFormData({
      ...alumni,
      graduationYear: alumni.graduationYear?.toString() || "",
      skills: alumni.skills ? alumni.skills.join(", ") : "",
    });
    setIsSingleModalVisible(true);
  };

  const closeSingleModal = () => {
    setIsSingleModalVisible(false);
    setEditingId(null);
  };

  const handleSaveSingle = () => {
    if (
      !formData.name ||
      !formData.batch ||
      !formData.graduationYear ||
      !formData.department
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Name, Batch, Year, and Department are required.",
      });
      return;
    }

    const payload = {
      ...formData,
      graduationYear: parseInt(formData.graduationYear, 10),
      skills: formData.skills
        ? formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Alumni", `Are you sure you want to remove ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  const handleBulkUpload = () => {
    try {
      const parsedData = JSON.parse(bulkJsonText);
      if (!Array.isArray(parsedData))
        throw new Error("JSON must be an array of objects.");
      bulkUploadMutation.mutate(parsedData);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Invalid JSON format",
        text2: error.message,
      });
    }
  };

  // --- Filtering ---
  const filteredAlumni = useMemo(() => {
    if (!alumniList) return [];
    if (!searchQuery) return alumniList;
    const q = searchQuery.toLowerCase();
    return alumniList.filter(
      (a: any) =>
        a.name.toLowerCase().includes(q) ||
        a.batch?.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q),
    );
  }, [alumniList, searchQuery]);

  // --- Render ---
  const renderAlumniRow = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.alumniName}>{item.name}</Text>
        <Text style={styles.alumniMeta}>
          {item.batch} • {item.department} • Class of {item.graduationYear}
        </Text>
        {item.currentCompany && (
          <Text style={styles.alumniSubMeta}>
            {item.currentPosition} at {item.currentCompany}
          </Text>
        )}
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => openEditModal(item)}
        >
          <Feather name="edit-2" size={18} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Feather name="trash-2" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={colors.onSurface} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Manage Alumni</Text>
            <Text style={styles.headerSubtitle}>Add, Edit, or Bulk Upload</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: colors.primaryContainer },
          ]}
          onPress={openAddModal}
        >
          <Feather
            name="user-plus"
            size={16}
            color={colors.onPrimary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.actionBtnTextWhite}>Add Single</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: colors.secondaryContainer },
          ]}
          onPress={() => setIsBulkModalVisible(true)}
        >
          <Feather
            name="upload-cloud"
            size={16}
            color={colors.secondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.actionBtnTextWhite, { color: colors.secondary }]}
          >
            Bulk JSON
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainerWrapper}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, batch, dept..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : (
        <FlatList
          data={filteredAlumni}
          keyExtractor={(item) => item.id}
          renderItem={renderAlumniRow}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* SINGLE ADD/EDIT MODAL */}
      <Modal
        visible={isSingleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeSingleModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Alumni" : "Add Alumni"}
              </Text>
              <TouchableOpacity
                onPress={handleSaveSingle}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.sectionHeader}>Required Information</Text>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                placeholder="John Doe"
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Batch</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.batch}
                    onChangeText={(t) => setFormData({ ...formData, batch: t })}
                    placeholder="e.g. 22nd Batch"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Graduation Year</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.graduationYear}
                    onChangeText={(t) =>
                      setFormData({ ...formData, graduationYear: t })
                    }
                    placeholder="2024"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>Department</Text>
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={(t) =>
                  setFormData({ ...formData, department: t })
                }
                placeholder="e.g. CSE"
              />

              <Text style={styles.sectionHeader}>
                Professional Information (Optional)
              </Text>
              <Text style={styles.label}>Current Company</Text>
              <TextInput
                style={styles.input}
                value={formData.currentCompany}
                onChangeText={(t) =>
                  setFormData({ ...formData, currentCompany: t })
                }
                placeholder="Google"
              />
              <Text style={styles.label}>Job Title / Position</Text>
              <TextInput
                style={styles.input}
                value={formData.currentPosition}
                onChangeText={(t) =>
                  setFormData({ ...formData, currentPosition: t })
                }
                placeholder="Software Engineer"
              />
              <Text style={styles.label}>Skills (Comma separated)</Text>
              <TextInput
                style={styles.input}
                value={formData.skills}
                onChangeText={(t) => setFormData({ ...formData, skills: t })}
                placeholder="React, Node.js, Python"
              />

              <Text style={styles.sectionHeader}>
                Contact & Links (Optional)
              </Text>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(t) => setFormData({ ...formData, email: t })}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.label}>LinkedIn URL</Text>
              <TextInput
                style={styles.input}
                value={formData.linkedInUrl}
                onChangeText={(t) =>
                  setFormData({ ...formData, linkedInUrl: t })
                }
                placeholder="https://linkedin.com/in/..."
                autoCapitalize="none"
              />
              <Text style={styles.label}>Personal Website</Text>
              <TextInput
                style={styles.input}
                value={formData.personalWebsiteUrl}
                onChangeText={(t) =>
                  setFormData({ ...formData, personalWebsiteUrl: t })
                }
                placeholder="https://..."
                autoCapitalize="none"
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* BULK UPLOAD JSON MODAL */}
      <Modal
        visible={isBulkModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsBulkModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Bulk Upload</Text>
              <TouchableOpacity
                onPress={handleBulkUpload}
                disabled={bulkUploadMutation.isPending}
              >
                {bulkUploadMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.instructionText}>
                Paste a JSON array of alumni objects. Required fields: name,
                batch, graduationYear, department.
              </Text>
              <TextInput
                style={[styles.input, styles.jsonInput]}
                value={bulkJsonText}
                onChangeText={setBulkJsonText}
                placeholder={
                  '[\n  {\n    "name": "Jane Doe",\n    "batch": "20th Batch",\n    "graduationYear": 2022,\n    "department": "BBA"\n  }\n]'
                }
                multiline
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
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
    paddingTop: 60,
    paddingBottom: spacing.stackSm,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  topActions: {
    flexDirection: "row",
    gap: spacing.stackMd,
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackLg,
    backgroundColor: colors.surfaceContainerLowest,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: rounded.md,
  },
  actionBtnTextWhite: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  searchContainerWrapper: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.stackMd,
    height: 48,
  },
  searchIcon: { marginRight: spacing.stackSm },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardInfo: { flex: 1, marginRight: spacing.stackMd },
  alumniName: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 2,
  },
  alumniMeta: {
    ...typography.labelSm,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  alumniSubMeta: { ...typography.labelSm, color: colors.outline },

  actionRow: { flexDirection: "row", gap: spacing.stackMd },
  iconBtn: {
    padding: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
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

  modalContent: { padding: spacing.marginMobile, paddingBottom: 60 },
  sectionHeader: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
    marginTop: spacing.stackLg,
    marginBottom: spacing.stackSm,
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    marginTop: spacing.stackSm,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  rowInputs: { flexDirection: "row", justifyContent: "space-between" },

  instructionText: {
    ...typography.bodyMd,
    color: colors.outline,
    marginBottom: spacing.stackLg,
  },
  jsonInput: {
    flex: 1,
    minHeight: 300,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12,
  },
});
