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
  ScrollView,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import api from "@/services/api";
import { authClient } from "@/services/auth-client";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 6,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

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
    return `${department || "Dept"} • Sem ${currentSemester || "N/A"}${
      section ? ` • Sec ${section}` : ""
    }`;
  }
  if (user.teacherProfile) {
    const { department, designation } = user.teacherProfile;
    return `${designation || "Faculty"} • ${department || "Department"}`;
  }
  return "University Member";
};

// ==================================================
// 2. MAIN COMPONENT
// ==================================================
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
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      setReplyText("");
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to post reply",
        text2: err.message || "Please try again.",
      });
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
      Toast.show({ type: "info", text1: "Discussion Deleted" });
      router.back();
    },
  });

  const editMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.patch(`/forum/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumThread", id] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      Toast.show({ type: "success", text1: "Question Updated" });
      setIsEditModalVisible(false);
    },
  });

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText.trim());
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
      "Delete Discussion",
      "Are you sure you want to permanently delete this discussion?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!thread) return;
    try {
      const msg = `💬 Campus Forum: ${thread.title}\n\n${thread.description}\n\nRead & reply on SMUCT UniCompanion!`;
      await Share.share({ message: msg });
    } catch {
      // Ignored
    }
  };

  if (isLoading || !thread) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
      </SafeAreaView>
    );
  }

  const isAuthor = currentUserId === thread.authorId;

  const renderOriginalPost = () => (
    <View style={styles.postHeaderContainer}>
      {/* 1. QUESTION BENTO CARD */}
      <View style={styles.questionBentoCard}>
        {/* Top Status Row */}
        <View style={styles.topStatusRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>DISCUSSION</Text>
          </View>
          {thread.isResolved ? (
            <View style={styles.resolvedPill}>
              <Feather
                name="check-circle"
                size={11}
                color="#047857"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.resolvedPillText}>RESOLVED</Text>
            </View>
          ) : (
            <View style={styles.openPill}>
              <Text style={styles.openPillText}>OPEN QUESTION</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.questionTitleText}>{thread.title}</Text>

        {/* Author Metadata Row */}
        <TouchableOpacity
          style={styles.authorMetaRow}
          onPress={() => setSelectedProfile(thread.author)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`View author profile for ${thread.author?.name}`}
        >
          {thread.author?.image ? (
            <Image
              source={{ uri: thread.author.image }}
              style={styles.authorAvatar}
            />
          ) : (
            <View style={styles.authorAvatarFallback}>
              <Text style={styles.authorAvatarText}>
                {thread.author?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.authorNameText}>
                {thread.author?.name || "University Member"}
              </Text>
              <View style={styles.authorTagBadge}>
                <Text style={styles.authorTagText}>Author</Text>
              </View>
            </View>
            <Text style={styles.authorSubtitleText}>
              {getUserSubtitle(thread.author)}
            </Text>
            <Text style={styles.timestampText}>
              Posted {format12HourTime(thread.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Question Body */}
        <Text style={styles.questionBodyText}>{thread.description}</Text>

        {/* Author Action Buttons */}
        {isAuthor && (
          <View style={styles.authorActionsRow}>
            {!thread.isResolved && (
              <TouchableOpacity
                style={styles.actionBtnResolve}
                onPress={() => resolveMutation.mutate()}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Mark question as resolved"
              >
                <Feather
                  name="check-circle"
                  size={13}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.actionBtnTextResolve}>
                  Mark as Resolved
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionBtnEdit}
              onPress={handleEditInit}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit question"
            >
              <Feather
                name="edit-2"
                size={13}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnTextEdit}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnDelete}
              onPress={handleDelete}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete question"
            >
              <Feather
                name="trash-2"
                size={13}
                color="#be123c"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnTextDelete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 2. RESPONSES SECTION HEADER */}
      <View style={styles.responsesHeaderRow}>
        <Text style={styles.responsesHeaderTitle}>
          {thread.responses?.length || 0} Response
          {thread.responses?.length === 1 ? "" : "s"}
        </Text>
        <Text style={styles.responsesHeaderSubtitle}>
          Community insights & answers
        </Text>
      </View>
    </View>
  );

  const renderReply = ({ item }: { item: any }) => {
    const isReplyFromAuthor = item.responderId === thread.authorId;

    return (
      <View style={styles.replyBentoCard}>
        <TouchableOpacity
          onPress={() => setSelectedProfile(item.responder)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`View responder profile of ${item.responder?.name}`}
        >
          {item.responder?.image ? (
            <Image
              source={{ uri: item.responder.image }}
              style={styles.replyAvatar}
            />
          ) : (
            <View style={styles.replyAvatarFallback}>
              <Text style={styles.replyAvatarText}>
                {item.responder?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.replyContentBlock}>
          <View style={styles.replyHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Text style={styles.replyAuthorName} numberOfLines={1}>
                {item.responder?.name || "University Member"}
              </Text>
              {isReplyFromAuthor && (
                <View style={styles.replyAuthorTag}>
                  <Text style={styles.replyAuthorTagText}>Author</Text>
                </View>
              )}
            </View>
            <Text style={styles.replyTimeText}>
              {format12HourTime(item.createdAt)}
            </Text>
          </View>

          <Text style={styles.replyBodyText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerIconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Discussion</Text>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerIconButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Share discussion"
          >
            <Feather name="share-2" size={18} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={thread.responses || []}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderOriginalPost}
          renderItem={renderReply}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyRepliesCard}>
              <Feather
                name="message-circle"
                size={28}
                color={BENTO_COLORS.subtleText}
                style={{ marginBottom: 6 }}
              />
              <Text style={styles.emptyRepliesTitle}>No Responses Yet</Text>
              <Text style={styles.emptyRepliesDesc}>
                Be the first to share an answer or helpful tip.
              </Text>
            </View>
          }
        />

        {/* BOTTOM ACTION BAR */}
        <View
          style={[
            styles.bottomInputBar,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          {thread.isResolved ? (
            <View style={styles.resolvedFooterBanner}>
              <Feather
                name="lock"
                size={14}
                color="#047857"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.resolvedFooterText}>
                This discussion has been marked as resolved.
              </Text>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInputPill}
                placeholder="Type a helpful response..."
                placeholderTextColor={BENTO_COLORS.subtleText}
                value={replyText}
                onChangeText={setReplyText}
                multiline={true}
                maxLength={500}
                accessible={true}
                accessibilityLabel="Type response"
              />
              <TouchableOpacity
                style={[
                  styles.sendButtonPill,
                  !replyText.trim() && { opacity: 0.5 },
                ]}
                onPress={handleSendReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Send response"
              >
                {replyMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Feather name="send" size={16} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* --- USER PROFILE INFO MODAL --- */}
      <Modal visible={!!selectedProfile} animationType="fade" transparent={true}>
        <View style={styles.profileModalOverlay} accessibilityViewIsModal={true}>
          <View style={styles.profileModalCard}>
            <TouchableOpacity
              style={styles.profileCloseBtn}
              onPress={() => setSelectedProfile(null)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close profile details"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>

            {selectedProfile?.image ? (
              <Image
                source={{ uri: selectedProfile.image }}
                style={styles.profileAvatarLarge}
              />
            ) : (
              <View style={styles.profileAvatarFallbackLarge}>
                <Text style={styles.profileAvatarTextLarge}>
                  {selectedProfile?.name?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
            )}

            <Text style={styles.profileNameText}>{selectedProfile?.name}</Text>
            <Text style={styles.profileRoleText}>
              {getUserSubtitle(selectedProfile)}
            </Text>
          </View>
        </View>
      </Modal>

      {/* --- EDIT QUESTION MODAL --- */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={styles.modalCloseBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel edit"
              >
                <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Edit Question</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>QUESTION TITLE</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.title}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, title: text }))
                  }
                  maxLength={120}
                  accessible={true}
                  accessibilityLabel="Edit question title"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DETAILS & CONTEXT</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputArea]}
                  value={editForm.description}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, description: text }))
                  }
                  multiline={true}
                  textAlignVertical="top"
                  accessible={true}
                  accessibilityLabel="Edit question details"
                />
              </View>

              <TouchableOpacity
                style={styles.saveEditBtn}
                onPress={handleEditSubmit}
                disabled={editMutation.isPending}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Save question changes"
              >
                {editMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.saveEditBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ==================================================
// 3. STYLES
// ==================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  postHeaderContainer: {
    marginBottom: 8,
  },

  // --- QUESTION BENTO CARD ---
  questionBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 22,
    marginBottom: 18,
    ...BENTO_COLORS.shadow,
  },
  topStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  categoryPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  categoryPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.6,
  },
  resolvedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  resolvedPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.4,
  },
  openPill: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  openPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.4,
  },
  questionTitleText: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  authorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  authorAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  authorAvatarText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  authorNameText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  authorTagBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  authorTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0369a1",
  },
  authorSubtitleText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#0284c7",
    marginTop: 2,
  },
  timestampText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 14,
  },
  questionBodyText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
    lineHeight: 23,
    marginBottom: 10,
  },
  authorActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 12,
  },
  actionBtnResolve: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  actionBtnTextResolve: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionBtnEdit: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  actionBtnTextEdit: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  actionBtnDelete: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  actionBtnTextDelete: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#be123c",
  },

  // --- RESPONSES SECTION HEADER ---
  responsesHeaderRow: {
    marginBottom: 12,
  },
  responsesHeaderTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  responsesHeaderSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },

  // --- REPLY BENTO CARD ---
  replyBentoCard: {
    flexDirection: "row",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    ...BENTO_COLORS.shadow,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  replyAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  replyAvatarText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  replyContentBlock: {
    flex: 1,
  },
  replyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  replyAuthorName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  replyAuthorTag: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  replyAuthorTagText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#0369a1",
  },
  replyTimeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  replyBodyText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "500",
    color: BENTO_COLORS.neutralText,
    lineHeight: 20,
  },

  emptyRepliesCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 4,
    ...BENTO_COLORS.shadow,
  },
  emptyRepliesTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
  },
  emptyRepliesDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
  },

  // --- BOTTOM INPUT BAR ---
  bottomInputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: BENTO_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  resolvedFooterBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  resolvedFooterText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#047857",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInputPill: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.neutralText,
    maxHeight: 100,
  },
  sendButtonPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- PROFILE MODAL ---
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  profileModalCard: {
    width: "100%",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    ...BENTO_COLORS.heroShadow,
  },
  profileCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  profileAvatarFallbackLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileAvatarTextLarge: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  profileNameText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
  },
  profileRoleText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
  },

  // --- EDIT MODAL ---
  modalContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BENTO_COLORS.white,
    ...BENTO_COLORS.shadow,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  formInput: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  formInputArea: {
    minHeight: 140,
    paddingTop: 14,
  },
  saveEditBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 16,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 10,
    ...BENTO_COLORS.heroShadow,
  },
  saveEditBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
