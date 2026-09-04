import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  BackHandler,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useForumPosts,
  useCreateForumPost,
} from "@/features/forum/useForum";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  primaryBlue: "#1e3a8a",
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

type FilterType = "ALL" | "UNRESOLVED" | "RESOLVED" | "MY_POSTS";

const timeAgo = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

// ==================================================
// 2. MAIN COMPONENT
// ==================================================
export interface ForumProps {
  embedded?: boolean;
}

export function Forum({ embedded = false }: ForumProps = {}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", description: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: posts, isLoading, refetch } = useForumPosts();
  const createPostMutation = useCreateForumPost();

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePost = () => {
    if (!newPost.title.trim() || !newPost.description.trim()) {
      return Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Question title and description are required.",
      });
    }

    createPostMutation.mutate(newPost, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Question Published!" });
        setIsComposeVisible(false);
        setNewPost({ title: "", description: "" });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to post",
          text2: err.message || "Network error",
        });
      },
    });
  };

  // --- Filtering & Statistics ---
  const { filteredPosts, counts } = useMemo(() => {
    const list = Array.isArray(posts) ? posts : [];

    let open = 0;
    let resolved = 0;
    let myPosts = 0;

    list.forEach((p: any) => {
      if (p.isResolved) {
        resolved++;
      } else {
        open++;
      }
      if (p.authorId === currentUserId) {
        myPosts++;
      }
    });

    let filtered = list;
    if (activeFilter === "UNRESOLVED") {
      filtered = filtered.filter((p: any) => !p.isResolved);
    } else if (activeFilter === "RESOLVED") {
      filtered = filtered.filter((p: any) => p.isResolved);
    } else if (activeFilter === "MY_POSTS") {
      filtered = filtered.filter((p: any) => p.authorId === currentUserId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p: any) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }

    return {
      filteredPosts: filtered,
      counts: {
        total: list.length,
        open,
        resolved,
        myPosts,
      },
    };
  }, [posts, activeFilter, searchQuery, currentUserId]);

  useEffect(() => {
    if (!isComposeVisible) return;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setIsComposeVisible(false);
        return true;
      }
    );
    return () => backHandler.remove();
  }, [isComposeVisible]);

  const ContainerComponent = embedded ? View : SafeAreaView;
  const containerProps = embedded
    ? { style: styles.safeContainer }
    : { style: styles.safeContainer, edges: ["top" as const] };

  return (
    <ContainerComponent {...(containerProps as any)}>
      {/* 1. TOP BRAND NAVIGATION BAR */}
      {!embedded && (
        <View style={styles.topNavBar}>
          <View style={styles.topNavLeft}>
            {currentUser?.image ? (
              <Image
                source={{ uri: currentUser.image }}
                style={styles.navAvatar}
              />
            ) : (
              <View style={styles.navAvatarFallback}>
                <Text style={styles.navAvatarText}>
                  {currentUser?.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            <Text style={styles.navBrandTitle}>UniCompanion</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push("/(tabs)/notices")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View notices and notifications"
          >
            <Feather name="bell" size={18} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>
      )}


      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 132 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.deepNavy]}
            tintColor={BENTO_COLORS.deepNavy}
          />
        }
      >
        {/* 2. SCREEN TITLE & SUBTITLE */}

        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle}>Campus Forum</Text>
          <Text style={styles.screenSubtitle}>
            Student Q&A & Community Discussions
          </Text>
        </View>

        {/* 3. SEARCH BAR */}
        <View style={styles.searchBarWrapper}>
          <Feather
            name="search"
            size={16}
            color={BENTO_COLORS.subtleText}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions by keyword..."
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search discussions"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ padding: 4 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Feather
                name="x-circle"
                size={16}
                color={BENTO_COLORS.subtleText}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 4. COMMUNITY HERO BENTO CARD */}
        <View style={styles.heroBentoCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTagPill}>
              <Text style={styles.heroTagText}>STUDENT COMMUNITY</Text>
            </View>
            {counts.open > 0 && (
              <View style={styles.openAlertPill}>
                <View style={styles.pulseDot} />
                <Text style={styles.openAlertText}>
                  {counts.open} ACTIVE
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>
            {counts.open > 0
              ? `${counts.open} Open Discussions`
              : "Campus Discussion Hub"}
          </Text>

          <Text style={styles.heroSubtitle}>
            Ask questions, share course insights, and get answers from
            fellow students, faculty, and campus administrators.
          </Text>

          {/* Quick Stats Grid */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{counts.open}</Text>
              <Text style={styles.heroStatLabel}>Needs Help</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{counts.resolved}</Text>
              <Text style={styles.heroStatLabel}>Resolved</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{counts.total}</Text>
              <Text style={styles.heroStatLabel}>Total Posts</Text>
            </View>
          </View>
        </View>

        {/* 5. FILTER PILLS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {[
            { key: "ALL", label: `All Posts (${counts.total})` },
            { key: "UNRESOLVED", label: `Needs Help (${counts.open})` },
            { key: "RESOLVED", label: `Resolved (${counts.resolved})` },
            { key: "MY_POSTS", label: `My Posts (${counts.myPosts})` },
          ].map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(filter.key as FilterType)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={filter.label}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 6. DISCUSSIONS LIST */}
        {isLoading ? (
          // Skeleton Loader
          <View style={styles.stateContainer}>
            <View style={styles.skeletonCard}>
              <View style={styles.skeletonTopRow}>
                <View style={styles.skeletonAvatar} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.skeletonNameBar} />
                  <View style={styles.skeletonTimeBar} />
                </View>
                <View style={styles.skeletonBadge} />
              </View>
              <View style={styles.skeletonTitleBar} />
              <View style={[styles.skeletonTitleBar, { width: "70%" }]} />
              <View style={styles.skeletonFooterBar} />
            </View>
            <View style={[styles.skeletonCard, { marginTop: 14 }]}>
              <View style={styles.skeletonTopRow}>
                <View style={styles.skeletonAvatar} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={styles.skeletonNameBar} />
                  <View style={styles.skeletonTimeBar} />
                </View>
                <View style={styles.skeletonBadge} />
              </View>
              <View style={styles.skeletonTitleBar} />
              <View style={[styles.skeletonTitleBar, { width: "60%" }]} />
              <View style={styles.skeletonFooterBar} />
            </View>
          </View>
        ) : filteredPosts.length === 0 ? (
          // Empty State
          <View style={styles.emptyBentoCard}>
            <View style={styles.emptyIconCircle}>
              <Feather
                name="message-square"
                size={36}
                color={BENTO_COLORS.subtleText}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? "No matching discussions"
                : activeFilter === "UNRESOLVED"
                  ? "No Unresolved Questions"
                  : "No Discussions Found"}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery.trim()
                ? `No discussions matched "${searchQuery}". Try a different keyword.`
                : "Be the first student or faculty member to start a discussion!"}
            </Text>
            {activeFilter !== "ALL" && (
              <TouchableOpacity
                style={styles.emptyResetBtn}
                onPress={() => setActiveFilter("ALL")}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="View all forum discussions"
              >
                <Text style={styles.emptyResetBtnText}>View All Posts</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Discussions Feed
          <View style={styles.cardsListContainer}>
            {filteredPosts.map((item: any) => {
              const isResolved = item.isResolved;
              const replyCount = item._count?.responses || 0;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.forumBentoCard,
                    isResolved && styles.forumBentoCardResolved,
                  ]}
                  onPress={() => router.push(`/forum/${item.id}`)}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Post by ${
                    item.author?.name || "Anonymous"
                  }: ${item.title}. ${
                    isResolved ? "Resolved." : "Needs help."
                  } ${replyCount} replies. Tap to view.`}
                >
                  {/* Card Header: Author Info & Status Badge */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.authorBox}>
                      {item.author?.image ? (
                        <Image
                          source={{ uri: item.author.image }}
                          style={styles.authorAvatar}
                          accessible={true}
                          accessibilityLabel={`${
                            item.author.name || "Author"
                          }'s avatar`}
                        />
                      ) : (
                        <View style={styles.authorAvatarFallback}>
                          <Text style={styles.authorAvatarText}>
                            {item.author?.name?.charAt(0).toUpperCase() || "U"}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text style={styles.authorNameText} numberOfLines={1}>
                          {item.author?.name || "University Member"}
                        </Text>
                        <Text style={styles.timeAgoText}>
                          {timeAgo(item.createdAt)}
                        </Text>
                      </View>
                    </View>

                    {isResolved ? (
                      <View style={styles.resolvedBadge}>
                        <Feather
                          name="check-circle"
                          size={11}
                          color="#047857"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.resolvedBadgeText}>RESOLVED</Text>
                      </View>
                    ) : (
                      <View style={styles.needsHelpBadge}>
                        <Text style={styles.needsHelpBadgeText}>
                          NEEDS HELP
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Title: Dominant, Sans-Serif Plus Jakarta Sans */}
                  <Text style={styles.postTitleText} numberOfLines={2}>
                    {item.title}
                  </Text>

                  {/* Description preview */}
                  <Text style={styles.postDescText} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* Divider */}
                  <View style={styles.cardDivider} />

                  {/* Card Footer: Replies Pill & Action Circle */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.replyCountPill}>
                      <Feather
                        name="message-square"
                        size={12}
                        color={BENTO_COLORS.deepNavy}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.replyCountPillText}>
                        {replyCount} {replyCount === 1 ? "Reply" : "Replies"}
                      </Text>
                    </View>

                    <View style={styles.cardActionCircle}>
                      <Feather
                        name="arrow-up-right"
                        size={14}
                        color={BENTO_COLORS.deepNavy}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* --- FLOATING ACTION BUTTON --- */}
      <TouchableOpacity
        style={[
          styles.fabBtn,
          { bottom: insets.bottom > 0 ? insets.bottom + 92 : 104 },
        ]}
        onPress={() => setIsComposeVisible(true)}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Ask a question"
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ================================================== */}
      {/* 7. SOFT CAMPUS BENTO QUESTION COMPOSE MODAL        */}
      {/* ================================================== */}
      <Modal
        visible={isComposeVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsComposeVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsComposeVisible(false)}
                style={styles.modalCloseBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Ask a Question</Text>
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
                  placeholder="What do you need help with?"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  value={newPost.title}
                  onChangeText={(text) =>
                    setNewPost((prev) => ({ ...prev, title: text }))
                  }
                  maxLength={120}
                  accessible={true}
                  accessibilityLabel="Question Title"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>DETAILS & CONTEXT</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputArea]}
                  placeholder="Describe your question, course details, or issue with specifics..."
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  value={newPost.description}
                  onChangeText={(text) =>
                    setNewPost((prev) => ({ ...prev, description: text }))
                  }
                  multiline={true}
                  textAlignVertical="top"
                  accessible={true}
                  accessibilityLabel="Question Description"
                />
              </View>

              <TouchableOpacity
                style={styles.submitPostBtn}
                onPress={handlePost}
                disabled={createPostMutation.isPending}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Submit question"
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name="send"
                      size={16}
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.submitPostBtnText}>
                      Publish Question
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </ContainerComponent>
  );
}

// ==================================================
// 3. STYLES
// ==================================================
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  topNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: BENTO_COLORS.background,
  },
  topNavLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  navAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  navAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  navAvatarText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  navBrandTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  headerTitlesContainer: {
    marginTop: 4,
    marginBottom: 14,
  },
  screenTitle: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },

  // --- SEARCH BAR ---
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.neutralText,
  },

  // --- HERO BENTO CARD ---
  heroBentoCard: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    ...BENTO_COLORS.heroShadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heroTagPill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  heroTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  openAlertPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96, 165, 250, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#60a5fa",
  },
  openAlertText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#bfdbfe",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.72)",
    lineHeight: 18,
    marginBottom: 18,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingTop: 14,
  },
  heroStatItem: {
    alignItems: "center",
    flex: 1,
  },
  heroStatValue: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
  },
  heroStatLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#c1dcff",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },

  // --- FILTER PILLS ---
  filterPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    paddingRight: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    ...BENTO_COLORS.shadow,
  },
  filterPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  filterPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  filterPillTextActive: {
    color: "#ffffff",
  },

  // --- FORUM CARDS FEED ---
  cardsListContainer: {
    gap: 14,
  },
  forumBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    ...BENTO_COLORS.shadow,
  },
  forumBentoCardResolved: {
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  authorAvatarText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  authorNameText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  timeAgoText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  resolvedBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.4,
  },
  needsHelpBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  needsHelpBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.4,
  },
  postTitleText: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 23,
    marginBottom: 6,
  },
  postDescText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 19,
    marginBottom: 14,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyCountPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  replyCountPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  cardActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },

  // --- FLOATING ACTION BUTTON ---
  fabBtn: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.heroShadow,
  },

  // --- SKELETON LOADERS ---
  stateContainer: {
    paddingVertical: 8,
  },
  skeletonCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    ...BENTO_COLORS.shadow,
  },
  skeletonTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  skeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#edf2f7",
  },
  skeletonNameBar: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#edf2f7",
    marginBottom: 4,
  },
  skeletonTimeBar: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#edf2f7",
  },
  skeletonBadge: {
    width: 70,
    height: 20,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#edf2f7",
  },
  skeletonTitleBar: {
    width: "80%",
    height: 16,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  skeletonFooterBar: {
    width: "30%",
    height: 20,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: "#edf2f7",
    marginTop: 8,
  },

  // --- EMPTY STATE ---
  emptyBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 34,
    alignItems: "center",
    marginTop: 10,
    ...BENTO_COLORS.shadow,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyDesc: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  emptyResetBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  emptyResetBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // --- MODAL STYLES ---
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
  submitPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 16,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 10,
    ...BENTO_COLORS.heroShadow,
  },
  submitPostBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
