// src/screens/campus-hub/shared/skeleton-loaders.tsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CAMPUS_HUB_COLORS } from "./design-tokens";

// ---------------------------------------------------------------------------
// Base Animated Skeleton Box (60fps native-driven shimmer pulse)
// ---------------------------------------------------------------------------
export function SkeletonBox({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#e2e8f0",
          opacity,
        },
        style,
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// 1. Lost & Found Detail Skeleton
// ---------------------------------------------------------------------------
export function LostFoundDetailSkeleton() {
  return (
    <SafeAreaView style={styles.screenContainer} edges={["top"]}>
      {/* Top Navigation Bar */}
      <View style={styles.topHeader}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox width={130} height={20} borderRadius={6} />
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image Box (4:3) */}
        <SkeletonBox
          width="100%"
          height={260}
          borderRadius={18}
          style={styles.heroBox}
        />

        {/* Badges Row */}
        <View style={styles.rowGap8}>
          <SkeletonBox width={75} height={26} borderRadius={CAMPUS_HUB_COLORS.pillRadius} />
          <SkeletonBox width={105} height={26} borderRadius={CAMPUS_HUB_COLORS.pillRadius} />
          <SkeletonBox width={65} height={26} borderRadius={CAMPUS_HUB_COLORS.pillRadius} />
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <SkeletonBox width="90%" height={24} borderRadius={6} />
          <SkeletonBox width="60%" height={24} borderRadius={6} />
        </View>

        {/* Author Info Card */}
        <View style={styles.authorCard}>
          <SkeletonBox width={46} height={46} borderRadius={23} />
          <View style={styles.authorMeta}>
            <SkeletonBox width={130} height={15} borderRadius={4} />
            <SkeletonBox width={180} height={12} borderRadius={4} />
          </View>
        </View>

        {/* Location & Time Info */}
        <View style={styles.metaRow}>
          <SkeletonBox width={140} height={28} borderRadius={8} />
          <SkeletonBox width={110} height={28} borderRadius={8} />
        </View>

        {/* Description Section */}
        <View style={styles.descriptionCard}>
          <SkeletonBox width={100} height={16} borderRadius={4} style={{ marginBottom: 12 }} />
          <View style={styles.colGap8}>
            <SkeletonBox width="100%" height={14} borderRadius={4} />
            <SkeletonBox width="96%" height={14} borderRadius={4} />
            <SkeletonBox width="92%" height={14} borderRadius={4} />
            <SkeletonBox width="65%" height={14} borderRadius={4} />
          </View>
        </View>

        {/* Bottom Action Button Placeholder */}
        <SkeletonBox
          width="100%"
          height={50}
          borderRadius={14}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// 2. Lost & Found Feed Skeleton (Card Grid / List)
// ---------------------------------------------------------------------------
export function LostFoundFeedSkeleton() {
  return (
    <View style={styles.feedContainer}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={styles.feedCard}>
          <View style={styles.feedCardTop}>
            <SkeletonBox width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, gap: 5, marginLeft: 10 }}>
              <SkeletonBox width={120} height={14} borderRadius={4} />
              <SkeletonBox width={80} height={11} borderRadius={4} />
            </View>
            <SkeletonBox width={65} height={22} borderRadius={11} />
          </View>

          {/* Title */}
          <SkeletonBox width="85%" height={18} borderRadius={5} style={{ marginVertical: 10 }} />

          {/* Description line */}
          <SkeletonBox width="95%" height={13} borderRadius={4} style={{ marginBottom: 6 }} />
          <SkeletonBox width="60%" height={13} borderRadius={4} style={{ marginBottom: 12 }} />

          {/* Image placeholder */}
          <SkeletonBox width="100%" height={180} borderRadius={14} style={{ marginBottom: 12 }} />

          {/* Footer chips */}
          <View style={styles.rowBetween}>
            <SkeletonBox width={110} height={20} borderRadius={6} />
            <SkeletonBox width={70} height={20} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 3. Marketplace (Buy-Sell) Detail Skeleton
// ---------------------------------------------------------------------------
export function MarketplaceDetailSkeleton() {
  return (
    <SafeAreaView style={styles.screenContainer} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox width={140} height={20} borderRadius={6} />
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Photo Carousel */}
        <SkeletonBox
          width="100%"
          height={280}
          borderRadius={18}
          style={styles.heroBox}
        />

        {/* Price & Condition Badge */}
        <View style={styles.rowBetween}>
          <SkeletonBox width={120} height={34} borderRadius={8} />
          <SkeletonBox width={80} height={26} borderRadius={CAMPUS_HUB_COLORS.pillRadius} />
        </View>

        {/* Product Title */}
        <View style={styles.titleBlock}>
          <SkeletonBox width="95%" height={24} borderRadius={6} />
          <SkeletonBox width="65%" height={24} borderRadius={6} />
        </View>

        {/* Seller Info Card */}
        <View style={styles.sellerCard}>
          <SkeletonBox width={48} height={48} borderRadius={24} />
          <View style={styles.authorMeta}>
            <SkeletonBox width={140} height={15} borderRadius={4} />
            <SkeletonBox width={160} height={12} borderRadius={4} />
          </View>
          <SkeletonBox width={40} height={40} borderRadius={20} />
        </View>

        {/* Description Section */}
        <View style={styles.descriptionCard}>
          <SkeletonBox width={110} height={16} borderRadius={4} style={{ marginBottom: 12 }} />
          <View style={styles.colGap8}>
            <SkeletonBox width="100%" height={14} borderRadius={4} />
            <SkeletonBox width="94%" height={14} borderRadius={4} />
            <SkeletonBox width="88%" height={14} borderRadius={4} />
            <SkeletonBox width="55%" height={14} borderRadius={4} />
          </View>
        </View>

        {/* Comments Section Header */}
        <View style={[styles.rowBetween, { marginTop: 16, marginBottom: 12 }]}>
          <SkeletonBox width={120} height={20} borderRadius={4} />
          <SkeletonBox width={50} height={16} borderRadius={4} />
        </View>

        {/* Sample Comment Bubble */}
        <View style={styles.commentRow}>
          <SkeletonBox width={34} height={34} borderRadius={17} />
          <View style={{ flex: 1, gap: 6, marginLeft: 10 }}>
            <SkeletonBox width={100} height={13} borderRadius={4} />
            <SkeletonBox width="90%" height={13} borderRadius={4} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// 4. Forum Discussion Detail Skeleton
// ---------------------------------------------------------------------------
export function ForumDiscussionDetailSkeleton() {
  return (
    <SafeAreaView style={styles.screenContainer} edges={["top"]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox width={120} height={20} borderRadius={6} />
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Question Bento Card */}
        <View style={styles.forumQuestionCard}>
          <View style={styles.rowGap8}>
            <SkeletonBox width={90} height={24} borderRadius={CAMPUS_HUB_COLORS.pillRadius} />
            <SkeletonBox width={65} height={24} borderRadius={CAMPUS_HUB_COLORS.pillRadius} />
          </View>

          {/* Title */}
          <SkeletonBox width="95%" height={24} borderRadius={6} style={{ marginVertical: 14 }} />
          <SkeletonBox width="70%" height={24} borderRadius={6} style={{ marginBottom: 16 }} />

          {/* Author Row */}
          <View style={styles.authorCard}>
            <SkeletonBox width={42} height={42} borderRadius={21} />
            <View style={styles.authorMeta}>
              <SkeletonBox width={130} height={15} borderRadius={4} />
              <SkeletonBox width={100} height={12} borderRadius={4} />
            </View>
          </View>

          {/* Question Body */}
          <View style={styles.colGap8}>
            <SkeletonBox width="100%" height={15} borderRadius={4} />
            <SkeletonBox width="98%" height={15} borderRadius={4} />
            <SkeletonBox width="92%" height={15} borderRadius={4} />
            <SkeletonBox width="75%" height={15} borderRadius={4} />
          </View>

          {/* Reaction Stats Footer */}
          <View style={[styles.rowGap8, { marginTop: 18 }]}>
            <SkeletonBox width={70} height={28} borderRadius={14} />
            <SkeletonBox width={70} height={28} borderRadius={14} />
          </View>
        </View>

        {/* Responses Count Header */}
        <View style={[styles.rowBetween, { marginTop: 20, marginBottom: 12 }]}>
          <SkeletonBox width={120} height={20} borderRadius={4} />
        </View>

        {/* 2 Discussion Reply Items */}
        {[1, 2].map((k) => (
          <View key={k} style={styles.forumReplyCard}>
            <View style={styles.rowCenter}>
              <SkeletonBox width={36} height={36} borderRadius={18} />
              <View style={{ flex: 1, marginLeft: 10, gap: 5 }}>
                <SkeletonBox width={110} height={14} borderRadius={4} />
                <SkeletonBox width={70} height={11} borderRadius={4} />
              </View>
            </View>
            <View style={[styles.colGap8, { marginTop: 10 }]}>
              <SkeletonBox width="96%" height={13} borderRadius={4} />
              <SkeletonBox width="80%" height={13} borderRadius={4} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// 5. Meme Feed Skeleton
// ---------------------------------------------------------------------------
export function MemeFeedSkeleton() {
  return (
    <View style={styles.feedContainer}>
      {[1, 2].map((k) => (
        <View key={k} style={styles.memeCard}>
          {/* Author Header */}
          <View style={styles.rowCenter}>
            <SkeletonBox width={42} height={42} borderRadius={21} />
            <View style={{ flex: 1, marginLeft: 10, gap: 5 }}>
              <SkeletonBox width={130} height={15} borderRadius={4} />
              <SkeletonBox width={90} height={12} borderRadius={4} />
            </View>
            <SkeletonBox width={28} height={28} borderRadius={14} />
          </View>

          {/* Caption */}
          <SkeletonBox width="85%" height={16} borderRadius={4} style={{ marginVertical: 12 }} />

          {/* Full Meme Image (1:1 Square) */}
          <SkeletonBox width="100%" height={320} borderRadius={16} style={{ marginBottom: 14 }} />

          {/* Reaction Buttons Bar */}
          <View style={styles.rowGap8}>
            <SkeletonBox width={70} height={32} borderRadius={16} />
            <SkeletonBox width={70} height={32} borderRadius={16} />
            <SkeletonBox width={70} height={32} borderRadius={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Unified Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroBox: {
    marginVertical: 14,
  },
  titleBlock: {
    gap: 8,
    marginVertical: 12,
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 14,
  },
  authorMeta: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    marginVertical: 12,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  descriptionCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    marginTop: 6,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  // Feed Cards
  feedContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 14,
  },
  feedCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  feedCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Forum Cards
  forumQuestionCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  forumReplyCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },

  // Meme Cards
  memeCard: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
  },

  // Helpers
  rowGap8: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colGap8: {
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
});

