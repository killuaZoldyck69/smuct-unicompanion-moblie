import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../src/services/api";
import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

// --- Helpers ---
export const format12HourTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

const getUserSubtitle = (user: any) => {
  if (!user) return "";
  if (user.studentProfile) {
    const { department, currentSemester, section } = user.studentProfile;
    return `${department || "No Dept"} • Sem ${currentSemester || "N/A"} • Sec ${section || "N/A"}`;
  }
  if (user.teacherProfile) {
    const { department, designation } = user.teacherProfile;
    return `${designation || "Faculty"} • ${department || "No Dept"}`;
  }
  return "University Member";
};

export default function ThreadScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as any)?.id;

  const [replyText, setReplyText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  // State for the Responder Profile Modal
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const { data: thread, isLoading } = useQuery({
    queryKey: ["forumThread", id],
    queryFn: async () => {
      const response = await api.get(`/forum/${id}`);
      return response.data?.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) =>
      await api.post(`/forum/${id}/respond`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumThread", id] });
      setReplyText("");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async () => await api.patch(`/forum/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumThread", id] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      Toast.show({ type: "success", text1: "Marked as Resolved" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await api.delete(`/forum/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      Toast.show({ type: "info", text1: "Post Deleted" });
      router.back();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.patch(`/forum/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumThread", id] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      Toast.show({ type: "success", text1: "Post Updated" });
      setIsEditModalVisible(false);
    },
  });

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText);
  };

  const handleEditInit = () => {
    setEditForm({ title: thread.title, description: thread.description });
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    if (!editForm.title.trim() || !editForm.description.trim()) return;
    editMutation.mutate(editForm);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to permanently delete this discussion?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  if (isLoading || !thread) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  const isAuthor = currentUserId === thread.authorId;

  const renderOriginalPost = () => (
    <View style={styles.originalPostContainer}>
      <Text style={styles.threadTitle}>{thread.title}</Text>

      <View style={styles.authorRow}>
        <TouchableOpacity onPress={() => setSelectedProfile(thread.author)}>
          {thread.author?.image ? (
            <Image
              source={{ uri: thread.author.image }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {thread.author?.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>
            {thread.author?.name}{" "}
            <Text style={styles.authorRoleBadge}>(Author)</Text>
          </Text>

          {/* NEW: Author Subtitle Info */}
          <Text style={styles.authorSubtitle} numberOfLines={1}>
            {getUserSubtitle(thread.author)}
          </Text>

          <View style={styles.metaRow}>
            <Feather
              name="clock"
              size={12}
              color={colors.outline}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.timeText}>
              {format12HourTime(thread.createdAt)}
            </Text>
          </View>
        </View>

        {isAuthor && !thread.isResolved && (
          <TouchableOpacity
            style={styles.resolveBtn}
            onPress={() => resolveMutation.mutate()}
          >
            <Feather
              name="check"
              size={16}
              color={colors.onPrimary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.resolveBtnText}>Resolve</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.threadDesc}>{thread.description}</Text>

      {/* Author Actions */}
      {isAuthor && (
        <View style={styles.authorActionsRow}>
          <TouchableOpacity
            style={styles.actionBtnEdit}
            onPress={handleEditInit}
          >
            <Feather
              name="edit-2"
              size={14}
              color={colors.secondary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.actionBtnTextEdit}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtnDelete}
            onPress={handleDelete}
          >
            <Feather
              name="trash-2"
              size={14}
              color={colors.error}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.actionBtnTextDelete}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />
      <Text style={styles.responseCountHeader}>
        {thread.responses?.length || 0} Responses
      </Text>
    </View>
  );

  const renderReply = ({ item }: { item: any }) => (
    <View style={styles.replyCard}>
      <TouchableOpacity onPress={() => setSelectedProfile(item.responder)}>
        {item.responder?.image ? (
          <Image
            source={{ uri: item.responder.image }}
            style={styles.replyAvatarImage}
          />
        ) : (
          <View style={styles.replyAvatarFallback}>
            <Text style={styles.replyAvatarText}>
              {item.responder?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.replyContentBlock}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyAuthorName}>
            {item.responder?.name}
            {item.responderId === thread.authorId && (
              <Text style={{ color: colors.primary }}> (Author)</Text>
            )}
          </Text>
          <Text style={styles.replyTimeText}>
            {format12HourTime(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.replyText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    // FIX: Stronger Android Keyboard Support
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={thread.responses || []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderOriginalPost}
        renderItem={renderReply}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {!thread.isResolved ? (
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="Type a helpful response..."
            placeholderTextColor={colors.outlineVariant}
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !replyText.trim() && { opacity: 0.5 }]}
            onPress={handleSendReply}
            disabled={!replyText.trim() || replyMutation.isPending}
          >
            {replyMutation.isPending ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Feather name="send" size={20} color={colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.resolvedFooter,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <Feather
            name="lock"
            size={16}
            color={colors.outline}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.resolvedFooterText}>
            This discussion has been marked as resolved.
          </Text>
        </View>
      )}

      {/* --- EDIT POST MODAL --- */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Post</Text>
              <TouchableOpacity
                onPress={handleEditSubmit}
                disabled={editMutation.isPending}
              >
                {editMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.titleInput}
                value={editForm.title}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, title: text })
                }
                maxLength={100}
              />
              <TextInput
                style={styles.descInput}
                value={editForm.description}
                onChangeText={(text) =>
                  setEditForm({ ...editForm, description: text })
                }
                multiline
                textAlignVertical="top"
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* --- USER PROFILE INFO MODAL --- */}
      <Modal
        visible={!!selectedProfile}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalCard}>
            <TouchableOpacity
              style={styles.profileCloseBtn}
              onPress={() => setSelectedProfile(null)}
            >
              <Feather name="x" size={20} color={colors.onSurface} />
            </TouchableOpacity>

            {selectedProfile?.image ? (
              <Image
                source={{ uri: selectedProfile.image }}
                style={styles.profileModalAvatarImage}
              />
            ) : (
              <View style={styles.profileModalAvatarFallback}>
                <Text style={styles.profileModalAvatarText}>
                  {selectedProfile?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <Text style={styles.profileModalName}>{selectedProfile?.name}</Text>
            <Text style={styles.profileModalRole}>
              {selectedProfile?.role || "Member"}
            </Text>

            <View style={styles.profileInfoBox}>
              <Text style={styles.profileInfoText}>
                {getUserSubtitle(selectedProfile)}
              </Text>
              {selectedProfile?.studentProfile?.batch && (
                <Text style={styles.profileInfoTextSub}>
                  Batch: {selectedProfile.studentProfile.batch}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backBtn: { padding: spacing.stackSm, marginLeft: spacing.stackSm },
  headerTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
  },

  listContent: { paddingBottom: spacing.sectionBreak },

  originalPostContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.marginMobile,
    marginBottom: spacing.stackSm,
  },
  threadTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.stackLg,
    fontWeight: "700",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.stackMd,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarText: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  authorName: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  authorRoleBadge: { fontSize: 12, fontWeight: "500", color: colors.primary },
  authorSubtitle: {
    ...typography.labelSm,
    color: colors.secondary,
    marginBottom: 2,
  },

  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  timeText: { ...typography.labelSm, color: colors.outline, fontSize: 11 },

  resolveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: rounded.full,
  },
  resolveBtnText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: "700",
  },

  threadDesc: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    lineHeight: 26,
  },

  authorActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.stackLg,
    gap: spacing.stackMd,
  },
  actionBtnEdit: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
  },
  actionBtnTextEdit: {
    ...typography.labelSm,
    color: colors.secondary,
    fontWeight: "700",
  },
  actionBtnDelete: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
  },
  actionBtnTextDelete: {
    ...typography.labelSm,
    color: colors.error,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginVertical: spacing.sectionBreak,
  },
  responseCountHeader: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackMd,
  },

  replyCard: {
    flexDirection: "row",
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.stackMd,
  },
  replyAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  replyAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.stackMd,
    backgroundColor: colors.surfaceContainerHigh,
  },
  replyAvatarText: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  replyContentBlock: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.stackSm,
  },
  replyAuthorName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  replyTimeText: { fontSize: 10, color: colors.outline },
  replyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    paddingTop: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.stackSm,
    marginBottom: 2,
  },

  resolvedFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.stackLg,
    backgroundColor: colors.surfaceContainerHigh,
    paddingTop: 20,
  },
  resolvedFooterText: {
    ...typography.bodyMd,
    color: colors.outline,
    fontStyle: "italic",
  },

  // Edit Modal Styles
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
  titleInput: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.stackLg,
    paddingVertical: spacing.stackSm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  descInput: {
    flex: 1,
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    lineHeight: 24,
  },

  // Info Modal Styles
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  profileModalCard: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    alignItems: "center",
    ...shadows.level1,
  },
  profileCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
  },
  profileModalAvatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.stackLg,
    marginTop: spacing.stackLg,
  },
  profileModalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.stackLg,
    marginTop: spacing.stackLg,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  profileModalAvatarText: {
    fontSize: 32,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  profileModalName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileModalRole: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: spacing.stackLg,
  },
  profileInfoBox: {
    width: "100%",
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    alignItems: "center",
  },
  profileInfoText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
    textAlign: "center",
  },
  profileInfoTextSub: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: 4,
  },
});
