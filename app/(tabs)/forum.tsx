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
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

type FilterType = "ALL" | "UNRESOLVED" | "RESOLVED" | "MY_POSTS";

// --- 12-Hour Timestamp Helper ---
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

export default function ForumFeedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const currentUserId = (session?.user as any)?.id;

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", description: "" });

  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["forumPosts"],
    queryFn: async () => {
      const response = await api.get("/forum");
      return response.data?.data || [];
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (payload: typeof newPost) =>
      await api.post("/forum", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      Toast.show({ type: "success", text1: "Question Posted!" });
      setIsComposeVisible(false);
      setNewPost({ title: "", description: "" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to post",
        text2: err.message,
      }),
  });

  const handlePost = () => {
    if (!newPost.title.trim() || !newPost.description.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Title and description are required.",
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let filtered = posts;

    if (activeFilter === "UNRESOLVED")
      filtered = filtered.filter((p: any) => !p.isResolved);
    if (activeFilter === "RESOLVED")
      filtered = filtered.filter((p: any) => p.isResolved);
    if (activeFilter === "MY_POSTS")
      filtered = filtered.filter((p: any) => p.authorId === currentUserId);

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.title.toLowerCase().includes(lowerQ) ||
          p.description.toLowerCase().includes(lowerQ),
      );
    }
    return filtered;
  }, [posts, activeFilter, searchQuery, currentUserId]);

  const renderPostCard = ({ item }: { item: any }) => {
    const isResolved = item.isResolved;
    const replyCount = item._count?.responses || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/forum/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.authorRow}>
            {item.author?.image ? (
              <Image
                source={{ uri: item.author.image }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {item.author?.name?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.authorName}>{item.author?.name}</Text>
              <View style={styles.metaRow}>
                <Feather
                  name="clock"
                  size={10}
                  color={colors.outline}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.timeText}>
                  {format12HourTime(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
          {isResolved && (
            <View style={styles.resolvedBadge}>
              <Feather
                name="check-circle"
                size={12}
                color="#2E7D32"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          )}
        </View>

        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.postDesc} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Feather
              name="message-circle"
              size={16}
              color={colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.footerText,
                { color: colors.primary, fontWeight: "600" },
              ]}
            >
              {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.outline} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campus Forum</Text>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Horizontally Scrollable Filters */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={{ paddingRight: spacing.marginMobile }}
        >
          {[
            { key: "ALL", label: "All Posts" },
            { key: "MY_POSTS", label: "My Posts" },
            { key: "UNRESOLVED", label: "Needs Help" },
            { key: "RESOLVED", label: "Resolved" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.tabButton,
                activeFilter === filter.key && styles.tabButtonActive,
              ]}
              onPress={() => setActiveFilter(filter.key as FilterType)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeFilter === filter.key && styles.tabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="message-square"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Discussions Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsComposeVisible(true)}
      >
        <Feather name="edit-2" size={24} color={colors.onPrimary} />
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>Ask a Question</Text>
              <TouchableOpacity
                onPress={handlePost}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <TextInput
                style={styles.titleInput}
                placeholder="What do you need help with?"
                placeholderTextColor={colors.outlineVariant}
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
                maxLength={100}
              />
              <TextInput
                style={styles.descInput}
                placeholder="Provide more details..."
                placeholderTextColor={colors.outlineVariant}
                value={newPost.description}
                onChangeText={(text) =>
                  setNewPost({ ...newPost, description: text })
                }
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
    paddingTop: 60,
    paddingBottom: spacing.stackMd,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.stackLg,
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

  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  tabButton: {
    paddingVertical: spacing.stackMd,
    paddingHorizontal: spacing.stackLg,
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
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "600",
    marginBottom: spacing.stackSm,
  },

  listContent: { padding: spacing.marginMobile, paddingBottom: 120 }, // Extra padding for FAB
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
    alignItems: "flex-start",
    marginBottom: spacing.stackMd,
  },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackSm,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarText: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  authorName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  timeText: { ...typography.labelSm, fontSize: 10, color: colors.outline },

  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resolvedText: { ...typography.labelSm, color: "#2E7D32", fontWeight: "700" },

  postTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 6,
  },
  postDesc: {
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
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "10",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footerText: { ...typography.labelMd, color: colors.outline },

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
});
