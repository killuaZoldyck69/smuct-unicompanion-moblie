import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Path,
  G,
  Circle,
  Polygon,
} from "react-native-svg";
import { CampusLogoSvgProps } from "../types";

/**
 * Pixel-accurate SVG reproduction of the CampusHub 3D graduation cap and book emblem.
 */
export const CampusLogoSvg = React.memo(function CampusLogoSvg({
  size = 84,
}: CampusLogoSvgProps) {
  const width = size;
  const height = size * 0.9;

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 120 108"
      fill="none"
      accessibilityLabel="CampusHub Graduation Cap and Book Emblem"
    >
      <Defs>
        {/* Cap diamond gradient */}
        <LinearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E3A8A" />
          <Stop offset="60%" stopColor="#172554" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>

        {/* Cap underside left edge */}
        <LinearGradient id="capRimLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0B132B" />
          <Stop offset="100%" stopColor="#070D1E" />
        </LinearGradient>

        {/* Cap underside right edge */}
        <LinearGradient id="capRimRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E293B" />
          <Stop offset="100%" stopColor="#0F172A" />
        </LinearGradient>

        {/* Emerald green book base gradient */}
        <LinearGradient id="greenBookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#34D399" />
          <Stop offset="50%" stopColor="#10B981" />
          <Stop offset="100%" stopColor="#059669" />
        </LinearGradient>

        {/* Soft shadow for depth */}
        <LinearGradient id="innerShadow" x1="50%" y1="0%" x2="50%" y2="100%">
          <Stop offset="0%" stopColor="#000000" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <G id="CampusEmblem">
        {/* 1. MINT / EMERALD GREEN BOOK BASE (Lowest Layer) */}
        {/* Outer green contour with 3D bevel and rounded corners */}
        <Path
          d="M 60 78
             L 28 61
             C 24 59, 20 62, 20 67
             L 20 73
             C 20 77, 24 80, 28 82
             L 60 98
             L 92 82
             C 96 80, 100 77, 100 73
             L 100 67
             C 100 62, 96 59, 92 61
             Z"
          fill="url(#greenBookGrad)"
        />

        {/* 2. INNER WHITE BOOK PAGES LAYER */}
        <Path
          d="M 60 67
             L 30 51
             C 27 49, 24 51, 24 55
             L 24 61
             C 24 64, 27 67, 30 68
             L 60 84
             L 90 68
             C 93 67, 96 64, 96 61
             L 96 55
             C 96 51, 93 49, 90 51
             Z"
          fill="#FFFFFF"
        />

        {/* Center fold divider line for the open book pages */}
        <Path
          d="M 60 67 L 60 84"
          stroke="#CBD5E1"
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {/* 3. CAP HEADBAND / BASE (Between book and mortarboard) */}
        <Path
          d="M 38 43
             C 38 43, 46 54, 60 54
             C 74 54, 82 43, 82 43
             L 82 49
             C 82 56, 73 61, 60 61
             C 47 61, 38 56, 38 49
             Z"
          fill="#0B132B"
        />

        {/* 4. MORTARBOARD 3D RIM (Thickness below the diamond) */}
        {/* Left rim */}
        <Polygon
          points="14,31 14,35 60,54 60,50"
          fill="url(#capRimLeft)"
        />
        {/* Right rim */}
        <Polygon
          points="60,50 60,54 106,35 106,31"
          fill="url(#capRimRight)"
        />

        {/* 5. TOP MORTARBOARD DIAMOND */}
        <Polygon
          points="60,10 106,31 60,50 14,31"
          fill="url(#capTopGrad)"
        />

        {/* Highlight sheen along top ridge */}
        <Path
          d="M 17 31 L 60 12 L 103 31"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />

        {/* 6. TASSEL */}
        {/* Center Button */}
        <Circle cx={60} cy={30} r={3} fill="#38BDF8" />
        <Circle cx={60} cy={30} r={1.8} fill="#0F172A" />

        {/* Tassel cord curving down right edge */}
        <Path
          d="M 60 30
             C 74 32, 90 35, 96 42
             L 96 52"
          stroke="#38BDF8"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Tassel bobble / head */}
        <Circle cx={96} cy={53} r={3} fill="#0284C7" />

        {/* Tassel fringe */}
        <Path
          d="M 94.5 54 L 94 62
             M 96 54 L 96 63
             M 97.5 54 L 98 62"
          stroke="#38BDF8"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
});
