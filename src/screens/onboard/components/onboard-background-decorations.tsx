import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import { ONBOARD_COLORS } from "../constants";

/**
 * Renders the 4 pastel corner contours and bottom dual sprout motifs
 * matching the onboard profile completion mockup.
 */
export const OnboardBackgroundDecorations = React.memo(
  function OnboardBackgroundDecorations() {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* 1. TOP-LEFT CORNER: Soft Lavender/Purple Contour */}
          <Path
            d="M 0 0
               L 135 0
               C 142 55, 95 118, 0 142
               Z"
            fill={ONBOARD_COLORS.cornerPurple || "#EDE9FE"}
          />

          {/* 2. TOP-RIGHT CORNER: Soft Sky Blue Wave Lobe */}
          <Path
            d="M 390 0
               L 255 0
               C 260 55, 305 115, 390 140
               Z"
            fill={ONBOARD_COLORS.blueBox || "#D0E4FF"}
            opacity={0.65}
          />

          {/* 3. BOTTOM-LEFT CORNER: Soft Lavender Shape */}
          <Path
            d="M 0 740
               C 45 750, 115 785, 120 844
               L 0 844
               Z"
            fill={ONBOARD_COLORS.cornerPurple || "#EDE9FE"}
          />

          {/* 4. SPROUT / LEAF MOTIF (Bottom-Left) */}
          <G transform="translate(20, 725)">
            <Path
              d="M 16 36 C 16 26, 17 20, 18 16"
              stroke="#059669"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Path
              d="M 18 20 C 10 18, 4 12, 6 4 C 14 4, 18 12, 18 20 Z"
              fill="#10B981"
            />
            <Path
              d="M 18 16 C 24 12, 30 14, 32 6 C 24 6, 20 12, 18 16 Z"
              fill="#34D399"
            />
          </G>

          {/* 5. BOTTOM-RIGHT CORNER: Soft Cyan / Sky Blue Shape */}
          <Path
            d="M 390 735
               C 345 750, 285 790, 285 844
               L 390 844
               Z"
            fill={ONBOARD_COLORS.blueBox || "#D0E4FF"}
            opacity={0.65}
          />

          {/* 6. SPROUT / LEAF MOTIF (Bottom-Right) */}
          <G transform="translate(345, 730)">
            <Path
              d="M 16 36 C 16 26, 17 20, 18 16"
              stroke="#059669"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Path
              d="M 18 20 C 10 18, 4 12, 6 4 C 14 4, 18 12, 18 20 Z"
              fill="#10B981"
            />
            <Path
              d="M 18 16 C 24 12, 30 14, 32 6 C 24 6, 20 12, 18 16 Z"
              fill="#34D399"
            />
          </G>
        </Svg>
      </View>
    );
  },
);
