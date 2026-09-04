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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useMarketplaceFeed } from "@/features/campus-hub/useMarketplace";
import type { MarketplacePost, ListingType, MarketplaceCategory } from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "../shared/design-tokens";
import { setCampusHubActiveSection } from "../shared/hub-state";
import { ComposeMarketplaceModal } from "./compose-modal";

type FilterTab = "ALL" | ListingType | "SOLD";

interface FilterPill {
  key: FilterTab;
  label: string;
}

const FILTERS: FilterPill[] = [
  { key: "ALL", label: "All Listings" },
  { key: "SELLING", label: "For Sale" },
  { key: "BUYING", label: "Looking to Buy" },
  { key: "SOLD", label: "Sold" },
];

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

export function MarketplaceSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isComposeVisible, setIsComposeVisible] = useState(false);

  const queryParams = useMemo(() => {
    if (activeFilter === "SOLD") return { status: "SOLD" as const };
    if (activeFilter === "SELLING") return { type: "SELLING" as ListingType };
    if (activeFilter === "BUYING") return { type: "BUYING" as ListingType };
    return {};
  }, [activeFilter]);

  const { data: posts, isLoading, isError, refetch } = useMarketplaceFeed(queryParams);

  const filtered = useMemo<MarketplacePost[]>(() => {
    const list = Array.isArray(posts) ? posts : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const counts = useMemo(() => {
    const all = Array.isArray(posts) ? posts : [];
    return {
      total: all.length,
      selling: all.filter((p) => p.type === "SELLING").length,
      buying: all.filter((p) => p.type === "BUYING").length,
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
      setCampusHubActiveSection("MARKETPLACE");
      router.push(`/campus-hub/marketplace/${id}` as any);
    },
    [router]
  );

  if (isError) {
    return (
      <View style={styles.centerState}>
        <Feather name="alert-circle" size={36} color={CAMPUS_HUB_COLORS.dangerText} />
        <Text style={styles.stateTitle}>Could not load listings</Text>
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
            placeholder="Search listings..."
            placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible
            accessibilityLabel="Search marketplace"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} accessible accessibilityRole="button" accessibilityLabel="Clear search">
              <Feather name="x-circle" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.heroCard}>
          <View style={[styles.heroPill, { backgroundColor: "rgba(16,185,129,0.2)" }]}>
            <Text style={[styles.heroPillText, { color: "#6ee7b7" }]}>STUDENT MARKETPLACE</Text>
          </View>
          <Text style={styles.heroTitle}>Buy & Sell on Campus</Text>
          <Text style={styles.heroSubtitle}>
            Trade textbooks, electronics, and more with fellow students.
          </Text>
          <View style={styles.statsRow}>
            {[
              { label: "Total", value: counts.total },
              { label: "For Sale", value: counts.selling },
              { label: "Wanted", value: counts.buying },
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
            <Feather name="shopping-bag" size={36} color={CAMPUS_HUB_COLORS.subtleText} />
            <Text style={styles.stateTitle}>No listings yet</Text>
            <Text style={styles.stateSubtitle}>
              {searchQuery ? `No results for "${searchQuery}"` : "Post something for sale!"}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((post) => (
              <MarketplaceCard key={post.id} post={post} onPress={() => navigateToDetail(post.id)} />
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
        accessibilityLabel="Create marketplace listing"
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      <ComposeMarketplaceModal
        visible={isComposeVisible}
        onClose={() => setIsComposeVisible(false)}
        currentUser={currentUser}
      />
    </View>
  );
}

interface MarketplaceCardProps {
  post: MarketplacePost;
  onPress: () => void;
}

const MarketplaceCard = React.memo(function MarketplaceCard({
  post,
  onPress,
}: MarketplaceCardProps) {
  const isSelling = post.type === "SELLING";
  const isSold = post.status === "SOLD";

  return (
    <TouchableOpacity
      style={[styles.card, isSold && styles.cardSold]}
      onPress={onPress}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${post.type === "SELLING" ? "Selling" : "Buying"}: ${post.title}${post.price ? `, ৳${post.price}` : ""}`}
    >
      {post.images?.[0] ? (
        <Image source={{ uri: post.images[0] }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <Feather name="image" size={24} color={CAMPUS_HUB_COLORS.subtleText} />
        </View>
      )}

      {isSold && (
        <View style={styles.soldOverlay}>
          <Text style={styles.soldOverlayText}>SOLD</Text>
        </View>
      )}

      <View style={styles.cardInfo}>
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: isSelling
                  ? CAMPUS_HUB_COLORS.marketplaceAccentLight
                  : CAMPUS_HUB_COLORS.lostFoundAccentLight,
              },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color: isSelling
                    ? CAMPUS_HUB_COLORS.marketplaceAccentText
                    : CAMPUS_HUB_COLORS.lostFoundAccentText,
                },
              ]}
            >
              {isSelling ? "SELLING" : "WANTED"}
            </Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
        {post.price != null && (
          <Text style={styles.priceText}>৳{post.price.toLocaleString()}</Text>
        )}
        <View style={styles.cardFooter}>
          <Feather name="message-circle" size={11} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.commentCountText}>{post._count?.comments ?? 0}</Text>
          <Text style={styles.timeText}>{timeAgo(post.createdAt)}</Text>
        </View>
      </View>
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
    backgroundColor: "#064e3b",
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  heroPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    marginBottom: 10,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "47.5%",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: CAMPUS_HUB_COLORS.cardRadius,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  cardSold: {
    opacity: 0.75,
  },
  cardImage: {
    width: "100%",
    height: 130,
    resizeMode: "cover",
  },
  cardImagePlaceholder: {
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldOverlayText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 1,
  },
  cardInfo: {
    padding: 12,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
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
    fontSize: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 18,
  },
  priceText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  commentCountText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
    textAlign: "right",
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
