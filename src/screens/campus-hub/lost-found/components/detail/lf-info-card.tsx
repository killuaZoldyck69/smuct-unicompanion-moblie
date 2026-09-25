import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo, formatDateTime } from "@/screens/campus-hub/shared/design-tokens";
import { AvatarChip } from "@/screens/campus-hub/shared/avatar-chip";
import {
  TypeBadge,
  StatusBadge,
  CategoryBadge,
} from "@/screens/campus-hub/lost-found/components/status-badge";
import type { LostFoundPost } from "@/services/lost-found-service";
import type { AuthorProfileModalData } from "@/screens/campus-hub/shared/author-modal";

interface LFInfoCardProps {
  post: LostFoundPost;
  isAuthor: boolean;
  onViewAuthor: (author: AuthorProfileModalData) => void;
}

export function LFInfoCard({ post, isAuthor, onViewAuthor }: LFInfoCardProps) {
  const isResolved = post.status === "RESOLVED" || post.status === "CLAIMED";

  return (
    <View style={styles.card}>
      {/* Resolved banner */}
      {isResolved && (
        <View style={styles.resolvedBanner}>
          <Feather name="check-circle" size={16} color="#047857" />
          <Text style={styles.resolvedBannerText}>Item Successfully Handed Over</Text>
        </View>
      )}

      {/* Badges */}
      <View style={styles.badgeRow}>
        <TypeBadge type={post.type} />
        {post.category && <CategoryBadge category={post.category} />}
        <StatusBadge status={post.status} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Key Facts */}
      <View style={styles.factsRow}>
        <View style={styles.factItem}>
          <Feather name="map-pin" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.factText} numberOfLines={1}>{post.location}</Text>
        </View>
        <Text style={styles.factDot}>•</Text>
        <View style={styles.factItem}>
          <Feather name="calendar" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
          <Text style={styles.factText}>{formatDateTime(post.createdAt)}</Text>
        </View>
        <Text style={styles.factDot}>•</Text>
        <Text style={styles.factText}>{timeAgo(post.createdAt)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Author chip */}
      <AvatarChip
        name={post.author?.name ?? "SMUCT Member"}
        image={post.author?.image}
        subtitle={`${
          post.author?.studentProfile?.department ||
          post.author?.teacherProfile?.department ||
          "Campus Hub"
        } • Tap for details`}
        onPress={() => onViewAuthor(post.author as AuthorProfileModalData)}
      />

      <View style={styles.divider} />

      {/* Description */}
      <Text style={styles.sectionLabel}>DESCRIPTION</Text>
      <Text style={styles.description}>{post.description}</Text>

      {/* Verification question */}
      {!!post.verificationQuestion && (
        <View style={styles.verificationCard}>
          <View style={styles.verificationHeader}>
            <Feather name="shield" size={14} color="#0284c7" />
            <Text style={styles.verificationLabel}>
              {isAuthor ? "YOUR VERIFICATION QUESTION" : "OWNERSHIP VERIFICATION QUESTION"}
            </Text>
          </View>
          <Text style={styles.verificationQuestion}>{post.verificationQuestion}</Text>
          {isAuthor && !!post.verificationAnswer && (
            <View style={styles.secretAnswerBox}>
              <Text style={styles.secretAnswerLabel}>EXPECTED ANSWER (PRIVATE TO YOU):</Text>
              <Text style={styles.secretAnswer}>{post.verificationAnswer}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  resolvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  resolvedBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#047857",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 26,
    marginBottom: 8,
  },
  factsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  factItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  factText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  factDot: {
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginVertical: 12,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  description: {
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 22,
    marginBottom: 10,
  },
  verificationCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 6,
  },
  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  verificationQuestion: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
  secretAnswerBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  secretAnswerLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 2,
  },
  secretAnswer: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
});
