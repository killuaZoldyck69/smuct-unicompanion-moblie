import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import * as DocumentPicker from "expo-document-picker";

import { useResources, useCreateResource, useDeleteResource } from "@/features/hubs/useHubs";
import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  border: "rgba(15, 23, 42, 0.08)",
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface MaterialsTabProps {
  hubId: string;
  canManage: boolean;
  currentUserId?: string;
}

type SectionTab = "ALL" | "OFFICIAL" | "STUDENT_NOTES";

const CATEGORIES = ["ALL", "Slides", "Notes", "Questions", "References", "Links"];

export default function MaterialsTab({
  hubId,
  canManage,
  currentUserId,
}: MaterialsTabProps) {
  const queryClient = useQueryClient();

  const { data: resources, isLoading, isRefetching } = useResources(hubId);
  const createMutation = useCreateResource(hubId);
  const deleteMutation = useDeleteResource(hubId);

  const [activeSection, setActiveSection] = useState<SectionTab>("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);

  // Upload Modal State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [category, setCategory] = useState("Slides");
  const [isStudentNote, setIsStudentNote] = useState(!canManage);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const resourceList = Array.isArray(resources) ? resources : [];

  const displayedResources = useMemo(() => {
    let list = [...resourceList];

    if (activeSection === "OFFICIAL") {
      list = list.filter((r) => !r.isStudentNote);
    } else if (activeSection === "STUDENT_NOTES") {
      list = list.filter((r) => r.isStudentNote);
    }

    if (selectedCategory !== "ALL") {
      list = list.filter((r) => r.category === selectedCategory);
    }

    return list;
  }, [resourceList, activeSection, selectedCategory]);

  const handlePickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      setIsUploadingFiles(true);
      const uploaded = await uploadMultipleFilesToCloudinary(
        res.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || undefined,
          size: asset.size || undefined,
        })),
      );

      const items = uploaded.map((u) => ({
        name: u.name,
        url: u.secureUrl,
        size: u.size,
        type: u.type,
      }));

      setAttachedFiles((prev) => [...prev, ...items]);
      Toast.show({ type: "success", text1: "Files Uploaded" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: err.message || "Failed to upload file",
      });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleUploadSubmit = () => {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title Required" });
      return;
    }

    let validUrl = driveUrl.trim();
    if (validUrl && !/^https?:\/\//i.test(validUrl)) {
      validUrl = `https://${validUrl}`;
    }

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        driveUrl: validUrl || (attachedFiles[0]?.url ?? "https://drive.google.com"),
        category,
        isStudentNote: canManage ? isStudentNote : true, // Enforce normal student can only upload student notes
        attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
      },
      {
        onSuccess: () => {
          setIsUploadModalVisible(false);
          setTitle("");
          setDescription("");
          setDriveUrl("");
          setAttachedFiles([]);
          Toast.show({ type: "success", text1: "Material Published!" });
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Upload Failed",
            text2: err.response?.data?.message || err.message,
          });
        },
      },
    );
  };

  const handleDeleteResource = (resourceId: string, itemTitle: string) => {
    Alert.alert("Delete Resource", `Are you sure you want to remove "${itemTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(resourceId, {
            onSuccess: () => {
              Toast.show({ type: "success", text1: "Resource Deleted" });
            },
            onError: (err: any) => {
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: err.response?.data?.message || err.message,
              });
            },
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 1. Upload Material Button */}
      <View style={styles.topActionBar}>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => {
            setIsStudentNote(!canManage);
            setIsUploadModalVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Feather name="upload-cloud" size={17} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.uploadBtnText}>
            {canManage ? "Upload Course Material" : "Share Study Resource"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. Section Selector: All / Official / Student Resources */}
      <View style={styles.sectionTabsWrapper}>
        <View style={styles.sectionTabsContainer}>
          {[
            { id: "ALL", label: "All" },
            { id: "OFFICIAL", label: "Course Materials" },
            { id: "STUDENT_NOTES", label: "Student Resources" },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.sectionTabBtn, isActive && styles.sectionTabBtnActive]}
                onPress={() => setActiveSection(tab.id as SectionTab)}
              >
                <Text style={[styles.sectionTabText, isActive && styles.sectionTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Category Filter Chips */}
      <View style={styles.categoryFilterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. Materials List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : displayedResources.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="folder" size={32} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeSection === "OFFICIAL"
              ? "No Course Materials"
              : activeSection === "STUDENT_NOTES"
              ? "No Student Shared Resources"
              : "No Study Materials Found"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeSection === "OFFICIAL"
              ? "Faculty will post lecture slides, reference docs, and official syllabus files here."
              : "Share your notes, question banks, and helpful academic links with classmates."}
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            onPress={() => {
              setIsStudentNote(!canManage);
              setIsUploadModalVisible(true);
            }}
          >
            <Feather name="plus" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.emptyActionText}>
              {canManage ? "Upload Material" : "Share Resource"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedResources}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isUploader = currentUserId && item.uploaderId === currentUserId;
            const canDelete = isUploader || canManage;

            const isStudent = item.isStudentNote;
            const attachments = Array.isArray(item.attachments) ? item.attachments : [];

            return (
              <View style={styles.resourceCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isStudent ? "#f0fdf4" : "#eff6ff" },
                    ]}
                  >
                    <Feather
                      name={isStudent ? "book-open" : "file-text"}
                      size={18}
                      color={isStudent ? "#16a34a" : "#0284c7"}
                    />
                  </View>

                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Text style={styles.resourceTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                    </View>

                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.originBadge,
                          { backgroundColor: isStudent ? "#f0fdf4" : "#eff6ff" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.originBadgeText,
                            { color: isStudent ? "#15803d" : "#0369a1" },
                          ]}
                        >
                          {isStudent ? "Student Shared" : "Official Course"}
                        </Text>
                      </View>

                      {item.category && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{item.category}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {canDelete && (
                    <TouchableOpacity
                      onPress={() => handleDeleteResource(item.id, item.title)}
                      style={styles.deleteBtn}
                    >
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {item.description ? (
                  <Text style={styles.resourceDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                {/* Multiple Attachments if any */}
                {attachments.length > 0 && (
                  <View style={styles.attachmentsList}>
                    {attachments.map((att: any, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.attFilePill}
                        onPress={() => Linking.openURL(att.url)}
                      >
                        <Feather name="paperclip" size={13} color="#0284c7" style={{ marginRight: 6 }} />
                        <Text style={styles.attFileName} numberOfLines={1}>{att.name || `File ${idx + 1}`}</Text>
                        <Feather name="external-link" size={11} color="#64748b" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Footer: Contributor info & Open Button */}
                <View style={styles.cardFooter}>
                  <Text style={styles.uploaderText}>
                    By {item.uploader?.name || "Member"} • {new Date(item.createdAt).toLocaleDateString()}
                  </Text>

                  {item.driveUrl && (
                    <TouchableOpacity
                      style={styles.openUrlBtn}
                      onPress={() => Linking.openURL(item.driveUrl)}
                    >
                      <Text style={styles.openUrlText}>Open Link</Text>
                      <Feather name="external-link" size={12} color="#0284c7" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ["resources", hubId] });
              }}
              tintColor="#0f172a"
            />
          }
        />
      )}

      {/* Upload Material Modal */}
      {isUploadModalVisible && (
        <Modal visible={isUploadModalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {canManage ? "Upload Material" : "Share Resource"}
                </Text>
                <TouchableOpacity onPress={() => setIsUploadModalVisible(false)}>
                  <Feather name="x" size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginTop: 12 }}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Chapter 4 Lecture Slides / Past Midterm Papers"
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Details, topic coverage, or notes..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />

                <Text style={styles.inputLabel}>Drive Link or Resource URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://drive.google.com/..."
                  value={driveUrl}
                  onChangeText={setDriveUrl}
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  {["Slides", "Notes", "Questions", "References", "Links"].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catOption, category === cat && styles.catOptionActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.catOptionText, category === cat && styles.catOptionTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Upload Files via Cloudinary */}
                <TouchableOpacity
                  style={styles.filePickerBtn}
                  onPress={handlePickFiles}
                  disabled={isUploadingFiles}
                >
                  {isUploadingFiles ? (
                    <ActivityIndicator size="small" color="#0284c7" />
                  ) : (
                    <Feather name="paperclip" size={15} color="#0284c7" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.filePickerBtnText}>
                    {isUploadingFiles ? "Uploading Files..." : "+ Attach Document / PDF"}
                  </Text>
                </TouchableOpacity>

                {attachedFiles.map((att, idx) => (
                  <View key={idx} style={styles.attFileItem}>
                    <Text style={styles.attFileItemName} numberOfLines={1}>{att.name}</Text>
                    <TouchableOpacity onPress={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}>
                      <Feather name="x" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.submitMaterialBtn, (!title.trim() || isUploadingFiles) && { opacity: 0.6 }]}
                  onPress={handleUploadSubmit}
                  disabled={!title.trim() || isUploadingFiles}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitMaterialBtnText}>Publish Material</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  topActionBar: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 9999,
  },
  uploadBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  sectionTabsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 9999,
    padding: 4,
  },
  sectionTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 9999,
  },
  sectionTabBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTabText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  sectionTabTextActive: {
    color: "#0f172a",
    fontWeight: "800",
  },
  categoryFilterRow: {
    marginBottom: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  categoryChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  categoryChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  categoryChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  emptyActionText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  resourceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    ...BENTO.shadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resourceTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  originBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  originBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  categoryBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },
  resourceDesc: {
    fontFamily,
    fontSize: 13,
    color: "#475569",
    marginTop: 8,
    lineHeight: 18,
  },
  attachmentsList: {
    gap: 6,
    marginTop: 10,
  },
  attFilePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  attFileName: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.05)",
    paddingTop: 10,
    marginTop: 12,
  },
  uploaderText: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  openUrlBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  openUrlText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  inputLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
  },
  catOption: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: "#f1f5f9",
  },
  catOptionActive: {
    backgroundColor: "#0f172a",
  },
  catOptionText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  catOptionTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  filePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  filePickerBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0284c7",
  },
  attFileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  attFileItemName: {
    fontFamily,
    fontSize: 12,
    color: "#0f172a",
    flex: 1,
  },
  submitMaterialBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitMaterialBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
