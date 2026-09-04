import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import {
  useLostFoundFeed,
} from "@/features/campus-hub/useLostFound";
import type { LostFoundPost, LostFoundType, LostFoundStatus } from "@/services/lost-found-service";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "../shared/design-tokens";
import { setCampusHubActiveSection } from "../shared/hub-state";
import { ComposeLostFoundModal } from "./compose-modal";

type FilterTab = "ALL" | LostFoundType | "CLAIMED";

interface FilterPill {
  key: FilterTab;
  label: string;
}

const FILTERS: FilterPill[] = [
  { key: "ALL", label: "All" },
  { key: "LOST", label: "Lost" },
  { key: "FOUND", label: "Found" },
  { key: "CLAIMED", label: "Claimed" },
];

function toStatusParam(tab: FilterTab): { type?: LostFoundType; status?: LostFoundStatus } {
  if (tab === "LOST") return { type: "LOST", status: "ACTIVE" };
  if (tab === "FOUND") return { type: "FOUND", status: "ACTIVE" };
  if (tab === "CLAIMED") return { status: "CLAIMED" };
  return {};
}

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

export function LostFoundSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isComposeVisible, setIsComposeVisible] = useState(false);

  const { data: posts, isLoading, isError, refetch } = useLostFoundFeed(
    toStatusParam(activeFilter)
  );

  const filtered = useMemo<LostFoundPost[]>(() => {
    const list = Array.isArray(posts) ? posts : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const counts = useMemo(() => {
    const all = Array.isArray(posts) ? posts : [];
    return {
      total: all.length,
      lost: all.filter((p) => p.type === "LOST").length,
      found: all.filter((p) => p.type === "FOUND").length,
    };
  }, [posts]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const navigateToDetail = useCallback(
    (id: string) => {
      setCampusHubActiveSection("LOST_FOUND");
      router.push(`/campus-hub/lost-found/${id}` as any);
    },
    [router]
  );

  if (isError) {
    return (
      <View style={styles.centerState}>
        <Feather name="alert-circle" size={36} color={CAMPUS_HUB_COLORS.dangerText} />
        <Text style={styles.stateTitle}>Could not load posts</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: ACCENT }]} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 130 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[ACCENT]}
            tintColor={ACCENT}
          />
        }
      >
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={CAMPUS_HUB_COLORS.subtleText} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, location..."
            placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible
            accessibilityLabel="Search lost and found"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} accessible accessibilityRole="button" accessibilityLabel="Clear search">
              <Feather name="x-circle" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={[styles.heroPill, { backgroundColor: "rgba(245,158,11,0.18)" }]}>
              <Text style={[styles.heroPillText, { color: "#fde68a" }]}>CAMPUS LOST & FOUND</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Help the Community</Text>
          <Text style={styles.heroSubtitle}>
            Post what you lost or found. Reunite items with their owners.
          </Text>
          <View style={styles.statsRow}>
            {[
              { label: "Total Posts", value: counts.total },
              { label: "Lost", value: counts.lost },
              { label: "Found", value: counts.found },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterPill, active && { backgroundColor: ACCENT }]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.8}
                accessible
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={f.label}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="search" size={36} color={CAMPUS_HUB_COLORS.subtleText} />
            <Text style={styles.stateTitle}>Nothing here yet</Text>
            <Text style={styles.stateSubtitle}>
              {searchQuery ? `No results for "${searchQuery}"` : "Be the first to post!"}
            </Text>
          </View>
        ) : (
          <View style={styles.feed}>
            {filtered.map((post) => (
              <LostFoundCard key={post.id} post={post} onPress={() => navigateToDetail(post.id)} />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
        onPress={() => {
          if (!currentUser) return Toast.show({ type: "error", text1: "Please log in first." });
          setIsComposeVisible(true);
        }}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Create Lost & Found post"
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      <ComposeLostFoundModal
        visible={isComposeVisible}
        onClose={() => setIsComposeVisible(false)}
        currentUser={currentUser}
      />
    </View>
  );
}

interface LostFoundCardProps {
  post: LostFoundPost;
  onPress: () => void;
}

const LostFoundCard = React.memo(function LostFoundCard({ post, onPress }: LostFoundCardProps) {
  const isLost = post.type === "LOST";
  const badgeBg = isLost ? CAMPUS_HUB_COLORS.dangerBg : CAMPUS_HUB_COLORS.marketplaceAccentLight;
  const badgeColor = isLost ? CAMPUS_HUB_COLORS.dangerText : CAMPUS_HUB_COLORS.marketplaceAccentText;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${post.type === "LOST" ? "Lost" : "Found"}: ${post.title}`}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardTopRow}>
          <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.typeBadgeText, { color: badgeColor }]}>
              {isLost ? "LOST" : "FOUND"}
            </Text>
          </View>
          {post.status === "CLAIMED" && (
            <View style={[styles.typeBadge, { backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight }]}>
              <Text style={[styles.typeBadgeText, { color: CAMPUS_HUB_COLORS.marketplaceAccentText }]}>
                CLAIMED
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{post.description}</Text>
        <View style={styles.cardFooter}>
          <Feather name="map-pin" size={11} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.locationText} numberOfLines={1}>{post.location}</Text>
          <Text style={styles.timeText}>{timeAgo(post.createdAt)}</Text>
        </View>
        <View style={styles.commentCount}>
          <Feather name="message-circle" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.commentCountText}>{post._count?.comments ?? 0}</Text>
        </View>
      </View>
      {post.images?.[0] && (
        <Image source={{ uri: post.images[0] }} style={styles.cardImage} />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  heroCard: {
    backgroundColor: "#78350f",
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  heroTopRow: {
    marginBottom: 10,
  },
  heroPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  heroPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 18,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    paddingTop: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
  statLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingRight: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  filterText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  filterTextActive: {
    color: CAMPUS_HUB_COLORS.white,
  },
  feed: {
    gap: 12,
  },
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 20,
  },
  cardDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  commentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  commentCountText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  cardImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
    resizeMode: "cover",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  centerState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  stateTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
  },
  stateSubtitle: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    padding: 34,
    alignItems: "center",
    gap: 8,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
