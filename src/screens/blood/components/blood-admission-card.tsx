import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { formatBloodGroupSymbol } from "../utils";
import { fontFamily } from "../constants";
import type { BloodPostItem } from "@/features/blood/types";
import type { ParsedHospitalLocation } from "../utils";

interface BloodAdmissionCardProps {
  post: BloodPostItem;
  parsedHospital: ParsedHospitalLocation;
}

export const BloodAdmissionCard: React.FC<BloodAdmissionCardProps> = ({
  post,
  parsedHospital,
}) => {
  const bloodSymbol = formatBloodGroupSymbol(post.bloodGroup);
  const bagsNeeded = post.bagsNeeded || 1;
  const isUrgent =
    post.urgency === "High" ||
    post.urgency === "Emergency" ||
    post.urgency === "Critical" ||
    (!post.urgency && !post.isFulfilled);

  const urgencyPillLabel = post.isFulfilled
    ? "FULFILLED"
    : isUrgent
      ? "IMMEDIATE"
      : post.urgency === "Medium"
        ? "MODERATE"
        : "STANDARD";

  const urgencyLevelTitle = post.isFulfilled
    ? "Fulfilled"
    : isUrgent
      ? "Critical / Immediate"
      : post.urgency === "Medium"
        ? "Moderate Priority"
        : "Standard / Planned";

  const urgencyLevelSub = post.isFulfilled
    ? "Donation completed"
    : isUrgent
      ? "Within 3–4 hours"
      : post.urgency === "Medium"
        ? "Within 24 hours"
        : "Flexible timing";

  return (
    <View
      style={[
        styles.cardContainer,
        isUrgent && !post.isFulfilled && styles.cardUrgent,
      ]}
    >
      {/* Top Accent Gradient Bar for Urgent Requests */}
      {isUrgent && !post.isFulfilled && (
        <View style={styles.urgentTopBar} pointerEvents="none">
          <Svg height="4" width="100%">
            <Defs>
              <LinearGradient id={`admissionTopGrad_${post.id}`} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#e11d48" />
                <Stop offset="40%" stopColor="#f43f5e" />
                <Stop offset="75%" stopColor="#f97316" />
                <Stop offset="100%" stopColor="#f59e0b" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="4" fill={`url(#admissionTopGrad_${post.id})`} />
          </Svg>
        </View>
      )}

      {/* Decorative Soft Watermark Heart */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Feather name="heart" size={130} color="#be123c" />
      </View>

      {/* 1. TOP BADGES: BLOOD GROUP & BAGS */}
      <View style={styles.topRow}>
        <View style={styles.bloodPill}>
          <Feather
            name="droplet"
            size={14}
            color="#ffffff"
            style={styles.dropletIcon}
          />
          <Text style={styles.bloodSymbolText}>{bloodSymbol}</Text>
        </View>

        <View style={styles.bagPill}>
          <Feather
            name="package"
            size={13.5}
            color="#e11d48"
            style={styles.bagIcon}
          />
          <Text style={styles.bagPillText}>
            {bagsNeeded} {bagsNeeded === 1 ? "Bag Required" : "Bags Required"}
          </Text>
        </View>
      </View>

      {/* 2. PATIENT ADMISSION SECTION */}
      <View style={styles.admissionSection}>
        <View style={styles.admissionLabelRow}>
          <Text style={styles.admissionLabel}>PATIENT NAME</Text>
        </View>

        <Text style={styles.patientName} numberOfLines={2}>
          {post.patientName || "Anonymous Patient"}
        </Text>
      </View>

      {/* 4. DIAGNOSIS CALLOUT CARD */}
      <View style={styles.diagnosisCard}>
        <Feather
          name="alert-triangle"
          size={16}
          color="#be123c"
          style={styles.diagnosisIcon}
        />
        <Text style={styles.diagnosisText}>
          <Text style={styles.diagnosisPrefix}>Reason: </Text>
          <Text style={styles.diagnosisValue}>
            {post.patientCondition || "Critical blood transfusion needed"}
          </Text>
        </Text>
      </View>

      {/* 4b. MEDICAL & PATIENT DETAILS NOTE */}
      {!!post.details?.trim() && (
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeaderRow}>
            <Feather
              name="file-text"
              size={13}
              color="#be123c"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.detailsHeaderTitle}>
              PATIENT & MEDICAL DETAILS
            </Text>
          </View>
          <Text style={styles.detailsBodyText}>{post.details.trim()}</Text>
        </View>
      )}

      {/* 5. TWO BENTO CARDS: URGENCY LEVEL & TARGET HOSPITAL */}
      <View style={styles.bentoRow}>
        {/* Card 1: Urgency Level */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <Text style={styles.urgencyBang}>! </Text>
            <Text style={styles.urgencyHeaderText}>URGENCY LEVEL</Text>
          </View>
          <Text style={styles.bentoPrimaryText} numberOfLines={1}>
            {urgencyLevelTitle}
          </Text>
          <Text
            style={[
              styles.bentoSubText,
              post.isFulfilled && styles.bentoSubTextFulfilled,
            ]}
            numberOfLines={1}
          >
            {urgencyLevelSub}
          </Text>
        </View>

        {/* Card 2: Target Hospital */}
        <View style={styles.bentoCard}>
          <View style={styles.bentoHeaderRow}>
            <Feather
              name="plus-square"
              size={12}
              color="#be123c"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.hospitalHeaderText}>TARGET HOSPITAL</Text>
          </View>
          <Text style={styles.bentoPrimaryText} numberOfLines={1}>
            {parsedHospital.shortName}
          </Text>
          <Text style={styles.hospitalSubText} numberOfLines={1}>
            {parsedHospital.area}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#fff5f6",
    borderRadius: 28,
    borderWidth: 1.2,
    borderColor: "rgba(244, 63, 94, 0.16)",
    padding: 18,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  cardUrgent: {
    borderWidth: 2,
    borderColor: "#fb7185",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  urgentTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  watermarkContainer: {
    position: "absolute",
    right: -24,
    bottom: -24,
    opacity: 0.07,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bloodPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#be123c",
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 22,
    shadowColor: "#be123c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  dropletIcon: {
    marginRight: 5,
  },
  bloodSymbolText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  bagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.16)",
    paddingHorizontal: 13,
    paddingVertical: 7.5,
    borderRadius: 22,
  },
  bagIcon: {
    marginRight: 6,
  },
  bagPillText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: -0.2,
  },
  timestampRow: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  timestampBadge: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.08)",
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 14,
  },
  timestampText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#78716c",
  },
  admissionSection: {
    marginTop: 18,
  },
  admissionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  admissionLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#be123c",
    letterSpacing: 0.8,
  },
  urgencyPill: {
    backgroundColor: "#fce7ec",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    marginLeft: 8,
  },
  urgencyPillFulfilled: {
    backgroundColor: "#d1fae5",
  },
  urgencyPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#9f1239",
    letterSpacing: 0.4,
  },
  urgencyPillTextFulfilled: {
    color: "#059669",
  },
  patientName: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  diagnosisCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  diagnosisIcon: {
    marginTop: 1.5,
  },
  diagnosisText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },
  diagnosisPrefix: {
    fontWeight: "700",
    color: "#0f172a",
  },
  diagnosisValue: {
    fontWeight: "600",
    color: "#881337",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  detailsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailsHeaderTitle: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#be123c",
    letterSpacing: 0.5,
  },
  detailsBodyText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#334155",
    fontWeight: "500",
  },
  bentoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.08)",
    padding: 12,
    justifyContent: "center",
  },
  bentoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  urgencyBang: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "900",
    color: "#be123c",
  },
  urgencyHeaderText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#be123c",
    letterSpacing: 0.5,
  },
  hospitalHeaderText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  bentoPrimaryText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 5,
    letterSpacing: -0.2,
  },
  bentoSubText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: "#be123c",
    marginTop: 2,
  },
  bentoSubTextFulfilled: {
    color: "#059669",
  },
  hospitalSubText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
});
