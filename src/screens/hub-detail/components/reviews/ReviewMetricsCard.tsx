import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily, RatingDistribution } from "./types";

interface ReviewMetricsCardProps {
  isTeacher?: boolean;
  isReviewOpen: boolean;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
  onOpenSettings: () => void;
}

export const ReviewMetricsCard: React.FC<ReviewMetricsCardProps> = React.memo(
  ({
    isTeacher = false,
    isReviewOpen,
    averageRating,
    totalReviews,
    ratingDistribution,
    onOpenSettings,
  }) => {
    return (
      <View style={styles.card}>
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Course Evaluation</Text>
            <View style={styles.statusPillRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isReviewOpen ? "#10b981" : "#94a3b8" },
                ]}
              />
              <Text style={styles.statusPillText}>
                {isReviewOpen ? "Evaluations Open" : "Evaluations Closed"}
              </Text>
            </View>
          </View>

          {/* Only TEACHER can active review and configure questions */}
          {isTeacher && (
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={onOpenSettings}
              activeOpacity={0.8}
            >
              <Feather name="sliders" size={13} color="#0f172a" style={{ marginRight: 6 }} />
              <Text style={styles.settingsBtnText}>Configure</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rating Metrics & Star Breakdown */}
        <View style={styles.metricsContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>{averageRating > 0 ? averageRating : "—"}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={14}
                  color={star <= Math.round(Number(averageRating)) ? "#f59e0b" : "#cbd5e1"}
                />
              ))}
            </View>
            <Text style={styles.totalReviewsText}>
              {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
            </Text>
          </View>

          {/* Distribution Bars */}
          <View style={styles.distributionBox}>
            {[5, 4, 3, 2, 1].map((s) => {
              const count = ratingDistribution[s] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <View key={s} style={styles.distRow}>
                  <Text style={styles.distLabel}>{s}★</Text>
                  <View style={styles.distBarBg}>
                    <View style={[styles.distBarFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.distCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Anonymous Shield Banner for Teacher */}
        {isTeacher && (
          <View style={styles.privacyGuaranteeCard}>
            <View style={styles.privacyShieldIcon}>
              <Feather name="shield" size={15} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyGuaranteeTitle}>
                Anonymous & Randomized Evaluation
              </Text>
              <Text style={styles.privacyGuaranteeDesc}>
                To uphold academic confidentiality and protect student identities, reviews are
                fully anonymized and presented in random order.
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    ...BENTO.shadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  statusPillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPillText: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  settingsBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 4,
  },
  scoreBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafaf9",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e7e5e4",
    minWidth: 105,
  },
  scoreText: {
    fontFamily,
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  totalReviewsText: {
    fontFamily,
    fontSize: 11,
    color: "#78716c",
    fontWeight: "600",
    marginTop: 4,
  },
  distributionBox: {
    flex: 1,
    gap: 4,
  },
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distLabel: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    width: 22,
  },
  distBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  distBarFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 3,
  },
  distCount: {
    fontFamily,
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
    width: 18,
    textAlign: "right",
  },
  privacyGuaranteeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  privacyShieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  privacyGuaranteeTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#1e40af",
  },
  privacyGuaranteeDesc: {
    fontFamily,
    fontSize: 11,
    color: "#3b82f6",
    fontWeight: "500",
    lineHeight: 15,
    marginTop: 2,
  },
});
