import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import { CGPAResult } from "../utils";

interface CGPAHeroCardProps {
  result: CGPAResult;
}

export const CGPAHeroCard = React.memo(function CGPAHeroCard({
  result,
}: CGPAHeroCardProps) {
  const { calculatedCGPA, totalCredits, gradedCredits, standingInfo } = result;

  // Ring border color reflects academic standing if graded, or primary blue
  const ringColor =
    gradedCredits > 0 ? standingInfo.color : BENTO_COLORS.primaryBlue;

  // The calculated credits corresponding to the current CGPA
  const displayCredits =
    gradedCredits > 0
      ? gradedCredits % 1 === 0
        ? gradedCredits.toFixed(0)
        : gradedCredits.toFixed(1)
      : totalCredits % 1 === 0
        ? totalCredits.toFixed(0)
        : totalCredits.toFixed(1);

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        {/* Left: Clean, Solid Circular CGPA Ring Badge */}
        <View style={styles.gaugeContainer}>
          <View style={[styles.gaugeOuterRing, { borderColor: ringColor }]}>
            <View style={styles.gaugeInnerContent}>
              <Text style={styles.gaugeLabel}>CGPA</Text>
              <Text style={styles.gaugeValueBig}>{calculatedCGPA}</Text>
              <Text style={styles.gaugeScaleText}>/ 4.00</Text>
            </View>
          </View>
        </View>

        {/* Right: Calculated Credits & Academic Standing */}
        <View style={styles.rightSection}>
          {/* Total Calculated Credits Card */}
          <View style={styles.creditCard}>
            <View style={styles.creditIconCircle}>
              <Ionicons name="school" size={20} color="#2563eb" />
            </View>
            <View style={styles.creditTextContainer}>
              <Text style={styles.creditLabel}>Total Credits</Text>
              <Text style={styles.creditNumber}>{displayCredits}</Text>
              {gradedCredits > 0 && totalCredits > gradedCredits && (
                <Text style={styles.creditSubText}>
                  ({gradedCredits} of {totalCredits} graded)
                </Text>
              )}
            </View>
          </View>

          {/* Academic Standing Status Pill */}
          <View
            style={[
              styles.standingPill,
              {
                backgroundColor: `${standingInfo.color}15`,
                borderColor: `${standingInfo.color}35`,
              },
            ]}
          >
            <View
              style={[
                styles.standingDot,
                { backgroundColor: standingInfo.color },
              ]}
            />
            <Text
              style={[styles.standingText, { color: standingInfo.color }]}
              numberOfLines={1}
            >
              {standingInfo.text}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.borderColor,
    ...BENTO_COLORS.heroShadow,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeOuterRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 6,
    backgroundColor: "#f8faff",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeInnerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  gaugeValueBig: {
    fontFamily,
    fontSize: 28,
    fontWeight: "900",
    color: BENTO_COLORS.neutralText,
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: 2,
  },
  gaugeScaleText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: BENTO_COLORS.mutedText,
  },
  rightSection: {
    flex: 1,
    marginLeft: 18,
    justifyContent: "center",
  },
  creditCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  creditIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  creditTextContainer: {
    flex: 1,
  },
  creditLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  creditNumber: {
    fontFamily,
    fontSize: 22,
    fontWeight: "900",
    color: BENTO_COLORS.neutralText,
    marginTop: 1,
  },
  creditSubText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: BENTO_COLORS.mutedText,
    marginTop: 1,
  },
  standingPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  standingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  standingText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
  },
});
