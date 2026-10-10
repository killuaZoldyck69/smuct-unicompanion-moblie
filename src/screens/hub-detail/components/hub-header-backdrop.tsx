import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Rect, Ellipse } from "react-native-svg";

interface HubHeaderBackdropProps {
  accentColor?: string;
  topOffset?: number;
}

export const HubHeaderBackdrop = React.memo(function HubHeaderBackdrop({
  accentColor = "#059669",
  topOffset = 0,
}: HubHeaderBackdropProps) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        topOffset > 0 ? { top: topOffset } : null,
      ]}
      pointerEvents="none"
    >
      {/* 1. Database Cylinder Stack (Top Left) */}
      <View style={styles.databaseWrap}>
        <Svg width={30} height={34} viewBox="0 0 24 24" fill="none">
          <Ellipse
            cx="12"
            cy="5"
            rx="9"
            ry="3"
            stroke={accentColor}
            strokeWidth="1.6"
          />
          <Path
            d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"
            stroke={accentColor}
            strokeWidth="1.6"
          />
          <Path
            d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"
            stroke={accentColor}
            strokeWidth="1.6"
          />
        </Svg>
      </View>

      {/* 2. Dot Matrix Grid (Left) */}
      <View style={styles.dotGridLeft}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={`dot-l-${i}`}
            style={[styles.dot, { backgroundColor: accentColor }]}
          />
        ))}
      </View>

      {/* 3. Code Tags </> (Top Center-Left) */}
      <View style={styles.codeTagsWrap}>
        <Svg width={32} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 6L2 12L7 18"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M17 6L22 12L17 18"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M14 4L10 20"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* 4. Sparkle / 4-Point Star (Top Center) */}
      <View style={styles.sparkleWrap}>
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"
            fill={accentColor}
          />
        </Svg>
      </View>

      {/* 5. Graduation Cap (Top Center-Right) */}
      <View style={styles.gradCapWrap}>
        <Svg width={36} height={26} viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 10v6M2 10l10-5 10 5-10 5z"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6 12v5c3 3 9 3 12 0v-5"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* 6. Open Book (Top Right) */}
      <View style={styles.bookWrap}>
        <Svg width={30} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <Path
            d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
            stroke={accentColor}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* 7. Connected Molecule / Nodes (Right) */}
      <View style={styles.moleculeWrap}>
        <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
          <Circle cx="18" cy="5" r="3" stroke={accentColor} strokeWidth="1.6" />
          <Circle cx="6" cy="12" r="3" stroke={accentColor} strokeWidth="1.6" />
          <Circle cx="18" cy="19" r="3" stroke={accentColor} strokeWidth="1.6" />
          <Path
            d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"
            stroke={accentColor}
            strokeWidth="1.6"
          />
        </Svg>
      </View>

      {/* 8. Dot Matrix Grid (Far Right) */}
      <View style={styles.dotGridRight}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`dot-r-${i}`}
            style={[styles.dot, { backgroundColor: accentColor }]}
          />
        ))}
      </View>

      {/* 9. University Campus Classical Building (Bottom Right) */}
      <View style={styles.campusBuildingWrap}>
        <Svg width={140} height={90} viewBox="0 0 140 90" fill="none">
          {/* Spire & Dome */}
          <Circle cx="70" cy="13" r="1.5" fill={accentColor} />
          <Path d="M70 14.5v5" stroke={accentColor} strokeWidth="1.4" />
          <Path
            d="M52 27 C52 17, 88 17, 88 27 Z"
            fill={accentColor}
            fillOpacity="0.45"
            stroke={accentColor}
            strokeWidth="1.4"
          />

          {/* Roof Pediment */}
          <Path
            d="M36 33 L70 25 L104 33 Z"
            fill={accentColor}
            fillOpacity="0.4"
            stroke={accentColor}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* Architrave Beam */}
          <Rect
            x="34"
            y="33"
            width="72"
            height="4"
            rx="1"
            fill={accentColor}
            fillOpacity="0.45"
          />

          {/* Columns */}
          <Rect
            x="40"
            y="39"
            width="5"
            height="34"
            rx="1.5"
            fill={accentColor}
            fillOpacity="0.38"
          />
          <Rect
            x="54"
            y="39"
            width="5"
            height="34"
            rx="1.5"
            fill={accentColor}
            fillOpacity="0.38"
          />
          <Rect
            x="68"
            y="39"
            width="5"
            height="34"
            rx="1.5"
            fill={accentColor}
            fillOpacity="0.38"
          />
          <Rect
            x="82"
            y="39"
            width="5"
            height="34"
            rx="1.5"
            fill={accentColor}
            fillOpacity="0.38"
          />
          <Rect
            x="96"
            y="39"
            width="5"
            height="34"
            rx="1.5"
            fill={accentColor}
            fillOpacity="0.38"
          />

          {/* Column Arches */}
          <Path
            d="M45 46 C45 41 54 41 54 46"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <Path
            d="M59 46 C59 41 68 41 68 46"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <Path
            d="M73 46 C73 41 82 41 82 46"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <Path
            d="M87 46 C87 41 96 41 96 46"
            stroke={accentColor}
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Base Steps */}
          <Rect
            x="30"
            y="74"
            width="80"
            height="4"
            rx="1"
            fill={accentColor}
            fillOpacity="0.45"
          />
          <Rect
            x="24"
            y="79"
            width="92"
            height="4"
            rx="1"
            fill={accentColor}
            fillOpacity="0.45"
          />
        </Svg>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  databaseWrap: {
    position: "absolute",
    top: 14,
    left: 68,
    opacity: 0.22,
    transform: [{ rotate: "-6deg" }],
  },
  dotGridLeft: {
    position: "absolute",
    top: 48,
    left: 14,
    width: 32,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    opacity: 0.22,
  },
  dot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  codeTagsWrap: {
    position: "absolute",
    top: 10,
    left: "37%",
    opacity: 0.22,
  },
  sparkleWrap: {
    position: "absolute",
    top: 14,
    left: "52%",
    opacity: 0.26,
  },
  gradCapWrap: {
    position: "absolute",
    top: 8,
    left: "58%",
    opacity: 0.22,
    transform: [{ rotate: "-4deg" }],
  },
  bookWrap: {
    position: "absolute",
    top: 14,
    right: 76,
    opacity: 0.22,
  },
  moleculeWrap: {
    position: "absolute",
    top: 38,
    right: 28,
    opacity: 0.24,
    transform: [{ rotate: "12deg" }],
  },
  dotGridRight: {
    position: "absolute",
    top: 68,
    right: 12,
    width: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    opacity: 0.22,
  },
  campusBuildingWrap: {
    position: "absolute",
    bottom: 84,
    right: 4,
    opacity: 0.20,
  },
});
