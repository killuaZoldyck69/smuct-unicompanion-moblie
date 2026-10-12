import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Ellipse, G } from "react-native-svg";
import { REGISTER_COLORS } from "../constants";

/**
 * Pastel corner contours and bottom-right sprout motif matching the register screen mockup.
 */
export const RegisterBackgroundDecorations = React.memo(
  function RegisterBackgroundDecorations() {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* 1. TOP-LEFT CORNER: Soft Lavender / Purple Contour */}
          <Path
            d="M 0 0
               L 135 0
               C 145 50, 95 115, 0 140
               Z"
            fill={REGISTER_COLORS.cornerPurple}
          />

          {/* 2. TOP-RIGHT CORNER: Soft Warm Yellow Lobe */}
          <Ellipse
            cx={390}
            cy={80}
            rx={90}
            ry={95}
            fill={REGISTER_COLORS.cornerYellow}
            opacity={0.65}
          />

          {/* 3. BOTTOM-LEFT CORNER: Soft Sky Blue Shape */}
          <Path
            d="M 0 740
               C 50 750, 120 785, 125 844
               L 0 844
               Z"
            fill={REGISTER_COLORS.cornerBlue}
          />

          {/* 4. BOTTOM-RIGHT CORNER: Soft Lavender Shape */}
          <Path
            d="M 390 735
               C 340 750, 280 790, 280 844
               L 390 844
               Z"
            fill={REGISTER_COLORS.cornerPurple}
          />

          {/* 5. SPROUT / LEAF MOTIF (Bottom-Right corner) */}
          <G transform="translate(345, 730)">
            {/* Small curved stem */}
            <Path
              d="M 16 36 C 16 26, 17 20, 18 16"
              stroke={REGISTER_COLORS.sproutStem}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Left curved leaf */}
            <Path
              d="M 18 20 C 10 18, 4 12, 6 4 C 14 4, 18 12, 18 20 Z"
              fill={REGISTER_COLORS.sproutLeaf}
            />
            {/* Right curved leaf */}
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
