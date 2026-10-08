// src/screens/exams/components/exam-skeleton.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { ExamTheme } from "../theme";

interface SkeletonProps {
  theme: ExamTheme;
}

export const ExamLoadingSkeleton = React.memo(function ExamLoadingSkeleton({
  theme,
}: SkeletonProps) {
  return (
    <View style={styles.container}>
      {/* Hero Skeleton */}
      <View
        style={[
          styles.heroSkeleton,
          {
            backgroundColor: theme.surface,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <View
          style={[
            styles.skeletonBlock,
            { width: 90, height: 16, backgroundColor: theme.surfaceMuted },
          ]}
        />
        <View
          style={[
            styles.skeletonBlock,
            {
              width: "60%",
              height: 18,
              marginTop: 10,
              backgroundColor: theme.surfaceMuted,
            },
          ]}
        />
        <View
          style={[
            styles.skeletonBlock,
            {
              width: "40%",
              height: 13,
              marginTop: 8,
              backgroundColor: theme.surfaceMuted,
            },
          ]}
        />
        <View
          style={[
            styles.bottomBarSkeleton,
            { backgroundColor: theme.surfaceMuted, marginTop: 14 },
          ]}
        />
      </View>

      {/* Tabs Skeleton */}
      <View
        style={[
          styles.tabsSkeleton,
          { backgroundColor: theme.tabBarBg },
        ]}
      />

      {/* Compact Exam Card Skeletons */}
      {[1, 2, 3].map((key) => (
        <View
          key={key}
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.leftBar,
              { backgroundColor: theme.surfaceMuted },
            ]}
          />
          <View style={styles.cardInner}>
            <View style={styles.rowBetween}>
              <View
                style={[
                  styles.skeletonBlock,
                  { width: 110, height: 12, backgroundColor: theme.surfaceMuted },
                ]}
              />
              <View
                style={[
                  styles.skeletonBlock,
                  { width: 14, height: 14, backgroundColor: theme.surfaceMuted },
                ]}
              />
            </View>

            <View style={[styles.rowBetween, { marginTop: 6 }]}>
              <View
                style={[
                  styles.skeletonBlock,
                  { width: 95, height: 13, backgroundColor: theme.surfaceMuted },
                ]}
              />
              <View
                style={[
                  styles.skeletonBlock,
                  { width: 60, height: 16, borderRadius: 10, backgroundColor: theme.surfaceMuted },
                ]}
              />
            </View>

            <View
              style={[
                styles.skeletonBlock,
                { width: "55%", height: 16, marginTop: 6, backgroundColor: theme.surfaceMuted },
              ]}
            />

            <View
              style={[
                styles.skeletonBlock,
                { width: 50, height: 13, marginTop: 6, backgroundColor: theme.surfaceMuted },
              ]}
            />

            <View
              style={[
                styles.skeletonBlock,
                { width: 70, height: 12, marginTop: 6, backgroundColor: theme.surfaceMuted },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
  },
  heroSkeleton: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  bottomBarSkeleton: {
    height: 38,
    borderRadius: 12,
  },
  tabsSkeleton: {
    height: 38,
    borderRadius: 14,
    marginBottom: 16,
  },
  cardSkeleton: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  leftBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  cardInner: {
    paddingLeft: 16,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 13,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonBlock: {
    borderRadius: 4,
  },
});
