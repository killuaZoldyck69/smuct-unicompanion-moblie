import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";
import { SPLASH_COLORS } from "../constants";

/**
 * Pixel-accurate vector reproduction of the 4 corner designs from the design mockup:
 *
 * 1. Top-Left: Smooth pastel sky-blue curved contour embracing the status bar.
 * 2. Top-Right: Smooth pastel mint-green circular lobe along the right edge.
 * 3. Bottom-Left: Soft sky-blue filled organic shape with a prominent circular arc stroke.
 * 4. Bottom-Right: Double-lobed soft lavender/purple organic shapes crossed by an arched purple line.
 */
export const BackgroundDecorations = React.memo(
  function BackgroundDecorations() {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* ========================================================= */}
          {/* 1. TOP-LEFT CORNER: Soft Sky Blue Contour                 */}
          {/* ========================================================= */}
          <Path
            d="M 0 0
               L 125 0
               C 135 48, 92 112, 0 135
               Z"
            fill={SPLASH_COLORS.cornerBlue || "#DDF0FF"}
          />

          {/* ========================================================= */}
          {/* 2. TOP-RIGHT CORNER: Soft Mint Green Lobe                 */}
          {/* ========================================================= */}
          <Ellipse
            cx={390}
            cy={85}
            rx={88}
            ry={95}
            fill={SPLASH_COLORS.cornerGreen || "#DCFCE7"}
          />

          {/* ========================================================= */}
          {/* 3. BOTTOM-LEFT CORNER: Soft Blue Base + Curved Line Arc   */}
          {/* ========================================================= */}
          {/* Filled soft blue base contour */}
          <Path
            d="M 0 710
               C 55 720, 140 765, 140 844
               L 0 844
               Z"
            fill={SPLASH_COLORS.cornerBlue || "#DDF0FF"}
          />

          {/* Prominent circular arc line crossing the bottom-left corner */}
          <Path
            d="M 0 675
               A 170 170 0 0 1 145 844"
            stroke={SPLASH_COLORS.arcBlue || "#93C5FD"}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />

          {/* ========================================================= */}
          {/* 4. BOTTOM-RIGHT CORNER: Double Lavender Lobes + Arc Line  */}
          {/* ========================================================= */}
          {/* Lower lavender lobe */}
          <Ellipse
            cx={345}
            cy={820}
            rx={105}
            ry={80}
            fill={SPLASH_COLORS.cornerPurple || "#EDE9FE"}
          />

          {/* Upper right lavender lobe */}
          <Ellipse
            cx={390}
            cy={735}
            rx={95}
            ry={105}
            fill={SPLASH_COLORS.cornerPurple || "#EDE9FE"}
          />

          {/* Overlapping intersection enhancement */}
          <Path
            d="M 390 750
               C 335 770, 310 805, 310 844
               L 390 844
               Z"
            fill={SPLASH_COLORS.cornerPurpleDark || "rgba(221, 214, 254, 0.45)"}
          />

          {/* Distinct purple arc line crossing the bottom-right lobes */}
          <Path
            d="M 265 844
               C 290 770, 342 715, 390 690"
            stroke={SPLASH_COLORS.arcPurple || "#C084FC"}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>
    );
  },
);
