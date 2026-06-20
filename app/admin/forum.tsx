import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
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

type FilterType = "ALL" | "UNRESOLVED" | "RESOLVED";

export default function AdminForumManageScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Fetch Data ---
  const { data: posts, isLoading } = useQuery({
    queryKey: ["adminForumPosts"],
    queryFn: async () => {
      const response = await api.get("/forum");
      return response.data?.data || [];
    },
  });

  // --- Mutations ---
  const resolveMutation = useMutation({
    mutationFn: async (id: string) => await api.patch(`/forum/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminForumPosts"] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      Toast.show({ type: "success", text1: "Post Resolved" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to resolve",
        text2: err.message,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/forum/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminForumPosts"] });
      queryClient.invalidateQueries({ queryKey: ["forumPosts"] });
      Toast.show({ type: "info", text1: "Post Deleted Successfully" });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to delete",
        text2: err.message,
      }),
  });

  // --- Action Handlers ---
  const handleResolve = (id: string, title: string) => {
    Alert.alert("Resolve Discussion", `Mark "${title}" as resolved?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Resolve",
        style: "default",
        onPress: () => resolveMutation.mutate(id),
      },
    ]);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Post",
      `Are you sure you want to permanently delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    );
  };

  // --- Filtering Logic ---
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let filtered = posts;

    if (activeFilter === "UNRESOLVED")
      filtered = filtered.filter((p: any) => !p.isResolved);
    if (activeFilter === "RESOLVED")
      filtered = filtered.filter((p: any) => p.isResolved);

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.title.toLowerCase().includes(lowerQ) ||
          p.author?.name?.toLowerCase().includes(lowerQ),
      );
    }
    return filtered;
  }, [posts, activeFilter, searchQuery]);

  const renderPostCard = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.author?.name}</Text>
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {item.isResolved && (
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          )}
        </View>

        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.statsRow}>
          <Feather
            name="message-circle"
            size={14}
            color={colors.outline}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.metaText}>
            {item._count?.responses || 0} Replies
          </Text>
        </View>

        <View style={styles.actionRow}>
          {!item.isResolved && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGreen]}
              onPress={() => handleResolve(item.id, item.title)}
            >
              <Feather
                name="check"
                size={14}
                color={colors.onPrimary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnText}>Resolve</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnRed]}
            onPress={() => handleDelete(item.id, item.title)}
          >
            <Feather
              name="trash-2"
              size={14}
              color={colors.error}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionBtnTextRed}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Forum Moderation</Text>
          <Text style={styles.headerSubtitle}>Manage campus discussions</Text>
        </View>
      </View>

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
            placeholder="Search by title or author..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {["ALL", "UNRESOLVED", "RESOLVED"].map((filter) => (
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
              {filter === "ALL"
                ? "All Posts"
                : filter === "UNRESOLVED"
                  ? "Active"
                  : "Resolved"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="shield"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Posts Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostCard}
          contentContainerStyle={styles.listContent}
        />
      )}
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

  searchContainerWrapper: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
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
    flex: 1,
    paddingVertical: spacing.stackMd,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: colors.primaryContainer },
  tabText: { ...typography.labelMd, color: colors.outline },
  tabTextActive: { color: colors.primaryContainer, fontWeight: "700" },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "600",
  },

  listContent: { padding: spacing.marginMobile, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
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
    marginBottom: spacing.stackSm,
  },
  authorInfo: { flex: 1 },
  authorName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
  },

  resolvedBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resolvedText: {
    ...typography.labelSm,
    fontSize: 10,
    color: "#2E7D32",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  postTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "600",
    marginBottom: spacing.stackSm,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  metaText: { ...typography.labelSm, color: colors.outline },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    paddingTop: spacing.stackMd,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.md,
  },
  actionBtnGreen: { backgroundColor: "#2E7D32" },
  actionBtnRed: { backgroundColor: colors.errorContainer },
  actionBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  actionBtnTextRed: {
    ...typography.labelMd,
    color: colors.error,
    fontWeight: "700",
  },
});
