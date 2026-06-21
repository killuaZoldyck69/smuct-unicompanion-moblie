import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

import HubHeader from "../../src/components/hub/HubHeader";
import CreateAnnouncementModal from "../../src/components/hub/CreateAnnouncementModal";
import UploadResourceModal from "../../src/components/hub/UploadResourceModal";
import AnnouncementCommentsModal from "../../src/components/hub/AnnouncementCommentsModal";
import EditHubModal from "../../src/components/hub/EditHubModal";

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type SubTab = "ANNOUNCEMENTS" | "QA" | "RESOURCES" | "MEMBERS";

export default function CourseHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<SubTab>("ANNOUNCEMENTS");

  // Modals
  const [isAnnounceModalVisible, setIsAnnounceModalVisible] = useState(false);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [isResourceModalVisible, setIsResourceModalVisible] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<any>(null);
  const [isEditHubModalVisible, setIsEditHubModalVisible] = useState(false);

  // Forms
  const [questionForm, setQuestionForm] = useState({ title: "", content: "" });
  const [selectedMember, setSelectedMember] = useState<any>(null);

  // --- Data Fetching ---
  const { data: hubDetails, isLoading: isLoadingHub } = useQuery({
    queryKey: ["hub", id],
    queryFn: async () => (await api.get(`/hubs/${id}`)).data?.data,
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ["hubAnnouncements", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/announcements`)).data?.data || [],
  });

  // 🔥 THE FIX: Get the live, updated announcement from the fresh data array!
  const currentActiveAnnouncement = activeAnnouncement
    ? announcements?.find((a: any) => a.id === activeAnnouncement.id) ||
      activeAnnouncement
    : null;

  const { data: discussions, isLoading: isLoadingDiscussions } = useQuery({
    queryKey: ["hubDiscussions", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/discussions`)).data?.data || [],
  });

  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ["hubResources", id],
    queryFn: async () =>
      (await api.get(`/hubs/${id}/resources`)).data?.data || [],
  });

  // --- Permissions & Identity ---
  const { data: myHubs } = useQuery({
    queryKey: ["myHubs"],
    queryFn: async () => (await api.get("/hubs/my")).data?.data || [],
  });

  const myHubMembership = myHubs?.find(
    (m: any) => m.hubId === id || m.hub?.id === id,
  );
  const myRole = myHubMembership?.role;
  const myUserId = myHubMembership?.userId;
  const canManage = myRole === "TEACHER" || myRole === "CR" || myRole === "TA";

  // --- Mutations ---
  const postAnnouncementMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/announcements`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAnnouncements", id] });
      Toast.show({ type: "success", text1: "Announcement Posted" });
      setIsAnnounceModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });

  const postQuestionMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/discussions`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDiscussions", id] });
      Toast.show({ type: "success", text1: "Question Posted" });
      setIsQuestionModalVisible(false);
      setQuestionForm({ title: "", content: "" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => await api.patch(`/hubs/${id}/members/${memberId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
      Toast.show({ type: "success", text1: "Role Updated!" });
      setIsMemberModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to update role",
        text2: err.message,
      }),
  });

  const postResourceMutation = useMutation({
    mutationFn: async (payload: any) =>
      await api.post(`/hubs/${id}/resources`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubResources", id] });
      Toast.show({ type: "success", text1: "Material Uploaded!" });
      setIsResourceModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Upload Failed", text2: err.message }),
  });

  const postCommentMutation = useMutation({
    mutationFn: async ({
      announcementId,
      content,
    }: {
      announcementId: string;
      content: string;
    }) =>
      await api.post(`/hubs/${id}/announcements/${announcementId}/comments`, {
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubAnnouncements", id] });
      Toast.show({ type: "success", text1: "Comment Posted!" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });
  const updateHubMutation = useMutation({
    mutationFn: async (payload: any) => await api.patch(`/hubs/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hub", id] });
      Toast.show({ type: "success", text1: "Hub Updated Successfully!" });
      setIsEditHubModalVisible(false);
    },
    onError: (err: any) =>
      Toast.show({ type: "error", text1: "Update Failed", text2: err.message }),
  });

  // --- Render Sub-Components ---
  const renderAnnouncementCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.userInfoRow}>
          <View style={styles.avatarFallbackSmall}>
            <Text style={styles.avatarTextSmall}>
              {item.creator?.name?.charAt(0) || "U"}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.creator?.name}</Text>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.contentBody}>{item.content}</Text>

      {item.attachedLinkUrl && (
        <TouchableOpacity
          style={styles.attachmentPill}
          onPress={() => Linking.openURL(item.attachedLinkUrl)}
        >
          <Feather
            name="link"
            size={16}
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.attachmentText} numberOfLines={1}>
            {item.attachedLinkTitle || item.attachedLinkUrl}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.footerAction}
          onPress={() => setActiveAnnouncement(item)}
        >
          <Feather
            name="message-circle"
            size={16}
            color={colors.outline}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.metaText}>
            {item.comments?.length || 0} Class comments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResourceCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Linking.openURL(item.driveUrl)}
    >
      <View style={styles.cardHeaderRow}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={[
              styles.avatarFallbackSmall,
              {
                backgroundColor: item.isStudentNote
                  ? colors.secondaryContainer
                  : colors.primaryContainer,
              },
            ]}
          >
            <Feather
              name={item.isStudentNote ? "book-open" : "file-text"}
              size={16}
              color={item.isStudentNote ? colors.secondary : colors.onPrimary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.discussionTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.dateText}>
              By {item.uploader?.name} • {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <Feather name="external-link" size={18} color={colors.outline} />
      </View>
    </TouchableOpacity>
  );

  const renderDiscussionCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.userName}>{item.author?.name} asked:</Text>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.discussionTitle}>{item.title}</Text>
      <Text style={styles.contentBody} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.cardFooter}>
        <Feather
          name="message-circle"
          size={16}
          color={colors.outline}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.metaText}>{item.replies?.length || 0} Replies</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoadingHub)
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HubHeader
        hubDetails={hubDetails}
        canManage={canManage}
        onEditPress={() => setIsEditHubModalVisible(true)}
      />

      <View style={styles.tabsContainer}>
        {["ANNOUNCEMENTS", "QA", "RESOURCES", "MEMBERS"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab as SubTab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "QA"
                ? "Q&A"
                : tab === "ANNOUNCEMENTS"
                  ? "Announcements"
                  : tab === "RESOURCES"
                    ? "Materials"
                    : "Members"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TAB CONTENT */}
      {activeTab === "ANNOUNCEMENTS" && (
        <>
          {isLoadingAnnouncements ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={announcements}
              keyExtractor={(item) => item.id}
              renderItem={renderAnnouncementCard}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No announcements yet.</Text>
              }
            />
          )}
          {canManage && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setIsAnnounceModalVisible(true)}
            >
              <Feather name="edit-2" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </>
      )}

      {activeTab === "RESOURCES" && (
        <>
          {isLoadingResources ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={resources}
              keyExtractor={(item) => item.id}
              renderItem={renderResourceCard}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No materials or notes uploaded yet.
                </Text>
              }
            />
          )}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsResourceModalVisible(true)}
          >
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      {activeTab === "QA" && (
        <>
          {isLoadingDiscussions ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={discussions}
              keyExtractor={(item) => item.id}
              renderItem={renderDiscussionCard}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No questions asked yet.</Text>
              }
            />
          )}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsQuestionModalVisible(true)}
          >
            <Feather name="help-circle" size={24} color="#FFF" />
          </TouchableOpacity>
        </>
      )}

      {activeTab === "MEMBERS" && (
        <FlatList
          data={hubDetails?.members || []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.memberRow}
              activeOpacity={canManage ? 0.7 : 1}
              onPress={() => {
                if (!canManage) return;
                if (item.user?.id === myUserId)
                  return Toast.show({
                    type: "info",
                    text1: "Cannot Edit Self",
                  });
                setSelectedMember(item);
                setIsMemberModalVisible(true);
              }}
            >
              <View style={styles.userInfoRow}>
                {item.user?.image ? (
                  <Image
                    source={{ uri: item.user.image }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>
                      {item.user?.name?.charAt(0)}
                    </Text>
                  </View>
                )}
                <View>
                  <Text style={styles.memberListName}>{item.user?.name}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.roleBadge,
                  item.role === "TEACHER" && {
                    backgroundColor: colors.primaryContainer + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    item.role === "TEACHER" && { color: colors.primary },
                  ]}
                >
                  {item.role}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* --- MODALS --- */}
      <CreateAnnouncementModal
        isVisible={isAnnounceModalVisible}
        onClose={() => setIsAnnounceModalVisible(false)}
        onSubmit={(payload) => postAnnouncementMutation.mutate(payload)}
        isPending={postAnnouncementMutation.isPending}
      />

      <UploadResourceModal
        isVisible={isResourceModalVisible}
        onClose={() => setIsResourceModalVisible(false)}
        onSubmit={(payload) => postResourceMutation.mutate(payload)}
        isPending={postResourceMutation.isPending}
        canManage={canManage}
      />

      {/* 🔥 THE FIX IS PASSED HERE AS THE 'announcement' PROP */}
      <AnnouncementCommentsModal
        isVisible={!!activeAnnouncement}
        onClose={() => setActiveAnnouncement(null)}
        announcement={currentActiveAnnouncement}
        onSubmit={(content) =>
          postCommentMutation.mutate({
            announcementId: activeAnnouncement.id,
            content,
          })
        }
        isPending={postCommentMutation.isPending}
      />

      <Modal
        visible={isQuestionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsQuestionModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Ask the Class</Text>
              <TouchableOpacity
                onPress={() => postQuestionMutation.mutate(questionForm)}
                disabled={postQuestionMutation.isPending}
              >
                {postQuestionMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                value={questionForm.title}
                onChangeText={(text) =>
                  setQuestionForm({ ...questionForm, title: text })
                }
                placeholder="Question Subject..."
                autoFocus
              />
              <TextInput
                style={[styles.textArea, { marginTop: spacing.stackLg }]}
                value={questionForm.content}
                onChangeText={(text) =>
                  setQuestionForm({ ...questionForm, content: text })
                }
                placeholder="Elaborate your question here..."
                multiline
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal visible={isMemberModalVisible} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              padding: 24,
              borderRadius: rounded.xl,
            }}
          >
            <Text
              style={{
                ...typography.titleLg,
                fontWeight: "700",
                marginBottom: 16,
              }}
            >
              Manage: {selectedMember?.user?.name}
            </Text>
            <View style={{ gap: 12 }}>
              {["STUDENT", "TA", "CR"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={{
                    padding: 16,
                    borderRadius: rounded.md,
                    borderWidth: 1,
                    borderColor:
                      selectedMember?.role === role
                        ? colors.primaryContainer
                        : colors.surfaceContainerHighest,
                    backgroundColor:
                      selectedMember?.role === role
                        ? colors.primaryContainer + "10"
                        : "transparent",
                  }}
                  onPress={() =>
                    updateRoleMutation.mutate({
                      memberId: selectedMember.id,
                      role,
                    })
                  }
                >
                  <Text
                    style={{
                      ...typography.labelMd,
                      color:
                        selectedMember?.role === role
                          ? colors.primary
                          : colors.onSurface,
                    }}
                  >
                    Make {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={{
                marginTop: 24,
                padding: 16,
                alignItems: "center",
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: rounded.md,
              }}
              onPress={() => setIsMemberModalVisible(false)}
            >
              <Text style={{ ...typography.labelMd, fontWeight: "700" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <EditHubModal
        isVisible={isEditHubModalVisible}
        onClose={() => setIsEditHubModalVisible(false)}
        onSubmit={(payload) => updateHubMutation.mutate(payload)}
        isPending={updateHubMutation.isPending}
        hubDetails={hubDetails}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: colors.primaryContainer },
  tabText: { ...typography.labelMd, color: colors.outline, fontSize: 11 },
  tabTextActive: { color: colors.primaryContainer, fontWeight: "700" },
  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  emptyText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: 40,
  },

  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackSm,
  },
  userInfoRow: { flexDirection: "row", alignItems: "center" },
  avatarFallbackSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackSm,
  },
  avatarTextSmall: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  userName: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  dateText: { ...typography.labelSm, color: colors.outline, fontSize: 10 },
  contentBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginTop: 4,
  },
  discussionTitle: {
    ...typography.titleLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "800",
    marginBottom: 2,
  },

  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    padding: 12,
    borderRadius: rounded.md,
    marginTop: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  attachmentText: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.stackMd,
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  metaText: { ...typography.labelSm, color: colors.outline },

  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackMd,
    borderRadius: rounded.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.stackMd,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  avatarText: {
    ...typography.bodyLg,
    color: colors.secondary,
    fontWeight: "700",
  },
  memberListName: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  roleBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.md,
  },
  roleText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontWeight: "800",
    fontSize: 10,
  },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },

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
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "600",
  },
  textArea: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    padding: 16,
    ...typography.bodyMd,
    color: colors.onSurface,
    textAlignVertical: "top",
  },
});
