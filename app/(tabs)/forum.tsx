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
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import api from "../../src/services/api";
import { authClient } from "../../src/services/auth-client";

type FilterType = "ALL" | "UNRESOLVED" | "RESOLVED" | "MY_POSTS";

// --- Relative Time Helper (e.g. "10 mins ago") ---
const timeAgo = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

export default function ForumFeedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  // --- Current User ---
  const { data: session } = authClient.useSession();
  const currentUser = session?.user as any;
  const currentUserId = currentUser?.id;

  // --- States ---
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", description: "" });

  // --- Data Fetching ---
  const { data: posts, isLoading } = useQuery({
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
      return Toast.show({
        type: "error",
        text1: "Title and description are required.",
      });
    }
    createPostMutation.mutate(newPost);
  };

  // --- Filters ---
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

  // --- Card Renderer ---
  const renderPostCard = ({ item }: { item: any }) => {
    const isResolved = item.isResolved;
    const replyCount = item._count?.responses || 0;

    // Dynamic styles based on resolution status (White vs Yellow card)
    const cardBg = isResolved ? "#fef08a" : "#ffffff";
    const pillBg = isResolved ? "#ffffff" : "#d0e4ff";
    const pillTextColor = isResolved ? "#131b2e" : "#1e3a8a";

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        activeOpacity={0.9}
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
              <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
            </View>
          </View>

          {isResolved ? (
            <View style={styles.resolvedBadge}>
              <Feather
                name="check-circle"
                size={12}
                color="#065f46"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.moreOptionsBtn}>
              <Feather name="more-horizontal" size={20} color="#76777d" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.postDesc} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={[styles.replyPill, { backgroundColor: pillBg }]}>
            <Feather
              name="message-square"
              size={14}
              color={pillTextColor}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.replyPillText, { color: pillTextColor }]}>
              {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
            </Text>
          </View>

          <View
            style={[
              styles.arrowCircle,
              isResolved && { backgroundColor: "#fde047" },
            ]}
          >
            <Feather name="arrow-right" size={18} color="#131b2e" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. TOP NAV BAR */}
      <View style={styles.navBar}>
        {currentUser?.image ? (
          <Image source={{ uri: currentUser.image }} style={styles.navAvatar} />
        ) : (
          <View style={styles.navAvatarFallback}>
            <Feather name="user" size={16} color="#76777d" />
          </View>
        )}
        <Text style={styles.navTitle}>UniCompanion</Text>
        <TouchableOpacity>
          <Feather name="bell" size={22} color="#131b2e" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* 2. HEADER & SEARCH */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>Campus Forum</Text>

          <View style={styles.searchBar}>
            <Feather
              name="search"
              size={20}
              color="#76777d"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search discussions..."
              placeholderTextColor="#76777d"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* 3. FILTER PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsWrapper}
          contentContainerStyle={styles.tabsContainer}
        >
          {[
            { key: "ALL", label: "All Posts" },
            { key: "UNRESOLVED", label: "Needs Help" },
            { key: "RESOLVED", label: "Resolved" },
            { key: "MY_POSTS", label: "My Posts" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.tabPill,
                activeFilter === filter.key && styles.tabPillActive,
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

        {/* 4. LIST CONTENT */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#131b2e" />
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Feather
              name="message-square"
              size={48}
              color="#c6c6cd"
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
            scrollEnabled={false} // Disable FlatList scrolling so outer ScrollView works
          />
        )}
      </ScrollView>

      {/* 5. FLOATING ACTION BUTTON (Black Circle) */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
        onPress={() => setIsComposeVisible(true)}
      >
        <Feather name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* 6. CREATE POST MODAL (Bento Style) */}
      <Modal
        visible={isComposeVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsComposeVisible(false)}
                style={styles.iconBtn}
              >
                <Feather name="x" size={24} color="#131b2e" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Ask a Question</Text>
              <TouchableOpacity
                style={[
                  styles.postBtn,
                  createPostMutation.isPending && { opacity: 0.7 },
                ]}
                onPress={handlePost}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.postBtnText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={[styles.bentoCard, styles.whiteCard]}>
                <Text style={styles.bentoLabel}>QUESTION TITLE</Text>
                <TextInput
                  style={styles.titleInput}
                  placeholder="What do you need help with?"
                  placeholderTextColor="#76777d"
                  value={newPost.title}
                  onChangeText={(text) =>
                    setNewPost({ ...newPost, title: text })
                  }
                  maxLength={100}
                />

                <View style={styles.divider} />

                <Text style={styles.bentoLabel}>DESCRIPTION</Text>
                <TextInput
                  style={styles.descInput}
                  placeholder="Provide more details..."
                  placeholderTextColor="#76777d"
                  value={newPost.description}
                  onChangeText={(text) =>
                    setNewPost({ ...newPost, description: text })
                  }
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" }, // Soft background matching mockup gradient base
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },

  // Navigation Bar
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.5,
  },
  navAvatar: { width: 36, height: 36, borderRadius: 18 },
  navAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e3e5",
    justifyContent: "center",
    alignItems: "center",
  },

  // Header & Search
  headerSection: { paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  pageTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 36,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -1,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    height: 56,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#131b2e",
    height: "100%",
  },

  // Filter Tabs
  tabsWrapper: { marginBottom: 24 },
  tabsContainer: { paddingHorizontal: 20, gap: 12 },
  tabPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  tabPillActive: { backgroundColor: "#131b2e" },
  tabText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
  },
  tabTextActive: { color: "#ffffff" },

  // Post Cards
  listContent: { paddingHorizontal: 20, gap: 16 },
  card: {
    borderRadius: 32,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#d0e4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: "#f2f4f6",
  },
  avatarText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#1e3a8a",
    fontWeight: "800",
  },
  authorName: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "800",
    color: "#131b2e",
    marginBottom: 2,
  },
  timeText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "600",
    color: "#76777d",
  },

  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a7f3d0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  resolvedText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    color: "#065f46",
    fontWeight: "800",
  },
  moreOptionsBtn: { padding: 4 },

  postTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e",
    marginBottom: 12,
    lineHeight: 28,
  },
  postDesc: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#45464d",
    lineHeight: 24,
    marginBottom: 24,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  replyPillText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "800",
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f2f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e",
  },

  // Floating Action Button
  fab: {
    position: "absolute",
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#131b2e",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
  },

  // Modal (Compose)
  modalContainer: { flex: 1, backgroundColor: "#f7f9fb" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconBtn: { padding: 4 },
  modalHeaderTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 18,
    fontWeight: "800",
    color: "#131b2e",
  },
  postBtn: {
    backgroundColor: "#131b2e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  postBtnText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },

  modalScrollContent: { padding: 20 },
  bentoCard: { borderRadius: 32, padding: 24, marginBottom: 16 },
  whiteCard: { backgroundColor: "#ffffff" },
  bentoLabel: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "800",
    color: "#76777d",
    letterSpacing: 1,
    marginBottom: 12,
  },
  titleInput: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
    marginBottom: 24,
  },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.05)", marginBottom: 24 },
  descInput: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#45464d",
    lineHeight: 24,
    minHeight: 150,
  },
});
