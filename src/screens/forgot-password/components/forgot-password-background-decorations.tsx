import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import { FORGOT_PASSWORD_COLORS } from "../constants";

/**
 * Renders the 4 pastel corner contours and the signature sprout motif
 * matching the forgot password screen mockup.
 */
export const ForgotPasswordBackgroundDecorations = React.memo(
  function ForgotPasswordBackgroundDecorations() {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* 1. TOP-LEFT CORNER: Soft Sky Blue Wave Blob */}
          <Path
            d="M 0 0
               L 138 0
               C 142 55, 95 118, 0 142
               Z"
            fill={FORGOT_PASSWORD_COLORS.cornerBlue}
          />

          {/* 2. TOP-RIGHT CORNER: Soft Lavender / Purple Organic Wave Lobe */}
          <Path
            d="M 390 0
               L 252 0
               C 255 60, 305 125, 390 152
               Z"
            fill={FORGOT_PASSWORD_COLORS.cornerPurple}
          />

          {/* 3. BOTTOM-LEFT CORNER: Soft Pastel Mint Green Shape */}
          <Path
            d="M 0 735
               C 50 745, 125 780, 130 844
               L 0 844
               Z"
            fill={FORGOT_PASSWORD_COLORS.cornerGreen}
          />

          {/* 4. SPROUT / LEAF MOTIF (Bottom-Left) */}
          <G transform="translate(24, 720)">
            {/* Small curved stem */}
            <Path
              d="M 16 36 C 16 26, 17 20, 18 16"
              stroke={FORGOT_PASSWORD_COLORS.sproutStem}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Left curved leaf */}
            <Path
              d="M 18 20 C 10 18, 4 12, 6 4 C 14 4, 18 12, 18 20 Z"
              fill={FORGOT_PASSWORD_COLORS.sproutLeaf}
            />
            {/* Right curved leaf */}
            <Path
              d="M 18 16 C 24 12, 30 14, 32 6 C 24 6, 20 12, 18 16 Z"
              fill="#34D399"
            />
          </G>

          {/* 5. BOTTOM-RIGHT CORNER: Soft Lavender/Purple Lobe */}
          <Path
            d="M 390 730
               C 340 750, 290 790, 290 844
               L 390 844
               Z"
            fill={FORGOT_PASSWORD_COLORS.cornerPurple}
          />
        </Svg>
      </View>
    );
  },
);
