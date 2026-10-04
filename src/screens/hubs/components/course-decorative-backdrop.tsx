import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CourseVisualTheme } from "../theme/course-theme-types";

interface CourseDecorativeBackdropProps {
  theme: CourseVisualTheme;
}

export const CourseDecorativeBackdrop = React.memo(
  function CourseDecorativeBackdrop({ theme }: CourseDecorativeBackdropProps) {
    const { motif, accent, iconName } = theme;

    return (
      <View style={styles.container} pointerEvents="none">
        {/* Soft Radial Ambient Circle 1 */}
        <View
          style={[
            styles.ambientCircleLarge,
            {
              backgroundColor: accent,
            },
          ]}
        />

        {/* Soft Radial Ambient Circle 2 */}
        <View
          style={[
            styles.ambientCircleSmall,
            {
              borderColor: accent,
            },
          ]}
        />

        {/* Procedural Motif Accents */}
        {motif === "grid-terminal" && (
          <View style={styles.gridContainer}>
            <View style={[styles.gridDot, { backgroundColor: accent }]} />
            <View style={[styles.gridDot, { backgroundColor: accent }]} />
            <View style={[styles.gridDot, { backgroundColor: accent }]} />
            <View style={[styles.gridDot, { backgroundColor: accent }]} />
            <View style={[styles.gridDot, { backgroundColor: accent }]} />
            <View style={[styles.gridDot, { backgroundColor: accent }]} />
          </View>
        )}

        {motif === "circles-formula" && (
          <View
            style={[
              styles.formulaRing,
              {
                borderColor: accent,
              },
            ]}
          />
        )}

        {motif === "circuits-waves" && (
          <View style={styles.circuitsContainer}>
            <View style={[styles.circuitLine, { backgroundColor: accent }]} />
            <View
              style={[
                styles.circuitLine,
                { width: 34, backgroundColor: accent, marginTop: 4 },
              ]}
            />
          </View>
        )}

        {motif === "growth-charts" && (
          <View style={styles.chartBarsContainer}>
            <View
              style={[styles.chartBar, { height: 12, backgroundColor: accent }]}
            />
            <View
              style={[styles.chartBar, { height: 18, backgroundColor: accent }]}
            />
            <View
              style={[styles.chartBar, { height: 26, backgroundColor: accent }]}
            />
          </View>
        )}

        {motif === "creative-organic" && (
          <View
            style={[
              styles.organicBlob,
              {
                backgroundColor: accent,
              },
            ]}
          />
        )}

        {motif === "academic-book" && (
          <View
            style={[
              styles.academicDiamond,
              {
                borderColor: accent,
              },
            ]}
          />
        )}

        {/* Faint Low-Opacity Signature Watermark Icon */}
        <View style={styles.watermarkContainer}>
          <Feather
            name={iconName}
            size={76}
            color={accent}
            style={styles.watermarkIcon}
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderRadius: 24,
  },
  ambientCircleLarge: {
    position: "absolute",
    top: -30,
    right: -25,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.05,
  },
  ambientCircleSmall: {
    position: "absolute",
    top: 10,
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 1.5,
    borderStyle: "dashed",
    opacity: 0.12,
  },
  gridContainer: {
    position: "absolute",
    top: 24,
    right: 68,
    flexDirection: "row",
    flexWrap: "wrap",
    width: 32,
    gap: 6,
    opacity: 0.15,
  },
  gridDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  formulaRing: {
    position: "absolute",
    top: -10,
    right: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    opacity: 0.1,
  },
  circuitsContainer: {
    position: "absolute",
    top: 28,
    right: 60,
    alignItems: "flex-end",
    opacity: 0.15,
  },
  circuitLine: {
    width: 48,
    height: 2,
    borderRadius: 1,
  },
  chartBarsContainer: {
    position: "absolute",
    top: 22,
    right: 65,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    opacity: 0.14,
  },
  chartBar: {
    width: 4,
    borderRadius: 2,
  },
  organicBlob: {
    position: "absolute",
    top: -15,
    right: 40,
    width: 55,
    height: 55,
    borderRadius: 28,
    opacity: 0.08,
  },
  academicDiamond: {
    position: "absolute",
    top: 15,
    right: 60,
    width: 24,
    height: 24,
    borderWidth: 1.5,
    transform: [{ rotate: "45deg" }],
    opacity: 0.12,
  },
  watermarkContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    opacity: 0.07,
  },
  watermarkIcon: {
    transform: [{ rotate: "-6deg" }],
  },
});
