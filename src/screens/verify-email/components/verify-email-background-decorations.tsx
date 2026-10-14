import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Circle, G, Ellipse } from "react-native-svg";

/**
 * Renders the top and bottom pastel blobs, dots, and green sprout motif
 * perfectly matching the reference design.
 */
export const VerifyEmailBackgroundDecorations = React.memo(
  function VerifyEmailBackgroundDecorations() {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          fill="none"
          preserveAspectRatio="none"
        >
          {/* 1. TOP-LEFT PASTEL SKY BLUE CURVE */}
          <Path
            d="M 0 0
               L 160 0
               C 170 60, 110 130, 0 155
               Z"
            fill="#DCEBFE"
            opacity={0.85}
          />

          {/* 2. TOP-RIGHT PASTEL LAVENDER / PURPLE SHAPE */}
          <Path
            d="M 255 0
               C 255 70, 310 120, 390 130
               L 390 0
               Z"
            fill="#EDE9FE"
            opacity={0.7}
          />

          {/* 3. TOP-RIGHT PASTEL YELLOW SUN CIRCLE */}
          <Circle
            cx={350}
            cy={95}
            r={38}
            fill="#FEF08A"
            opacity={0.75}
          />

          {/* 4. FLOATING PASTEL DOTS (Matching reference image) */}
          {/* Green dot near top-left */}
          <Circle cx={100} cy={110} r={6} fill="#86EFAC" />
          {/* Small blue dot */}
          <Circle cx={165} cy={108} r={4.5} fill="#93C5FD" />
          {/* Purple dot near right */}
          <Circle cx={350} cy={140} r={5.5} fill="#C084FC" />

          {/* 5. BOTTOM-LEFT MINT GREEN CURVE */}
          <Path
            d="M 0 720
               C 50 735, 130 770, 140 844
               L 0 844
               Z"
            fill="#DCFCE7"
            opacity={0.8}
          />

          {/* 6. SPROUT / LEAF MOTIF (Bottom-Left) */}
          <G transform="translate(28, 715)">
            {/* Stem */}
            <Path
              d="M 16 34 C 16 24, 17 18, 18 14"
              stroke="#15803D"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            {/* Left Leaf */}
            <Path
              d="M 18 18 C 10 16, 4 10, 6 2 C 14 2, 18 10, 18 18 Z"
              fill="#22C55E"
            />
            {/* Right Leaf */}
            <Path
              d="M 18 14 C 24 10, 30 12, 32 4 C 24 4, 20 10, 18 14 Z"
              fill="#4ADE80"
            />
          </G>

          {/* 7. BOTTOM-RIGHT PASTEL LAVENDER SHAPE */}
          <Path
            d="M 390 715
               C 335 735, 275 780, 270 844
               L 390 844
               Z"
            fill="#F3E8FF"
            opacity={0.8}
          />
        </Svg>
      </View>
    );
  },
);
