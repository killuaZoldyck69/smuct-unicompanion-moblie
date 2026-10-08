// src/screens/exams/components/academic-illustration.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Rect, Circle, G, Line } from "react-native-svg";
import { ExamTheme } from "../theme";

interface IllustrationProps {
  theme: ExamTheme;
}

export const HeroAcademicIllustration = React.memo(function HeroAcademicIllustration({
  theme,
}: IllustrationProps) {
  const isDark = theme.isDark;

  return (
    <View style={styles.heroPosition} pointerEvents="none">
      <Svg width={130} height={110} viewBox="0 0 130 110" fill="none">
        {/* Soft pastel mint/cyan background circular blobs */}
        <Circle
          cx="82"
          cy="52"
          r="44"
          fill={isDark ? "rgba(45, 212, 191, 0.08)" : "#e6f8f2"}
        />
        <Circle
          cx="106"
          cy="32"
          r="26"
          fill={isDark ? "rgba(56, 189, 248, 0.06)" : "#e0f2fe"}
        />

        {/* Smartphone / Tablet device with code window */}
        <G opacity={isDark ? 0.9 : 0.88}>
          <Rect
            x="48"
            y="14"
            width="64"
            height="80"
            rx="12"
            fill={isDark ? "#1e293b" : "#ffffff"}
            stroke={isDark ? "#38bdf8" : "#bfdbfe"}
            strokeWidth="2.5"
          />

          {/* Device header bar */}
          <Rect
            x="54"
            y="20"
            width="52"
            height="18"
            rx="5"
            fill={isDark ? "rgba(56, 189, 248, 0.2)" : "#dbeafe"}
          />

          {/* </> Code bracket symbol */}
          <Path
            d="M72 25L67 29L72 33"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M80 25L85 29L80 33"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M77 24L75 34"
            stroke="#2563eb"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Content placeholder lines */}
          <Line
            x1="56"
            y1="46"
            x2="88"
            y2="46"
            stroke={isDark ? "#475569" : "#cbd5e1"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <Line
            x1="56"
            y1="54"
            x2="98"
            y2="54"
            stroke={isDark ? "#475569" : "#cbd5e1"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <Line
            x1="56"
            y1="62"
            x2="80"
            y2="62"
            stroke={isDark ? "#475569" : "#cbd5e1"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </G>

        {/* Books underneath device */}
        <G opacity={isDark ? 0.92 : 0.9}>
          {/* Green book */}
          <Rect
            x="24"
            y="76"
            width="62"
            height="16"
            rx="4"
            fill="#34d399"
          />
          <Rect
            x="24"
            y="80"
            width="62"
            height="3"
            fill="#059669"
          />

          {/* White pages/book above green book */}
          <Rect
            x="28"
            y="67"
            width="54"
            height="11"
            rx="3"
            fill={isDark ? "#334155" : "#ffffff"}
            stroke={isDark ? "#475569" : "#cbd5e1"}
            strokeWidth="1.2"
          />
        </G>
      </Svg>
    </View>
  );
});

export const AcademicEmptyIllustration = React.memo(function AcademicEmptyIllustration({
  theme,
}: IllustrationProps) {
  const accent = theme.isDark ? theme.mint : "#0d9488";

  return (
    <View style={styles.emptyContainer}>
      <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
        <Circle
          cx="36"
          cy="36"
          r="30"
          fill={theme.isDark ? "rgba(45, 212, 191, 0.08)" : "rgba(13, 148, 136, 0.06)"}
        />
        <Path
          d="M36 20L16 30L36 40L56 30L36 20Z"
          fill={accent}
          opacity={0.88}
        />
        <Path
          d="M23 35V45C23 45 28 50 36 50C44 50 49 45 49 45V35"
          stroke={accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.88}
        />
        <Path
          d="M54 31V42"
          stroke={accent}
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={0.88}
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  heroPosition: {
    position: "absolute",
    right: 4,
    top: 14,
    width: 130,
    height: 110,
  },
  emptyContainer: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
});
