// src/screens/notices/components/illustrations/campus-watermark-svg.tsx
import React from "react";
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

interface Props {
  width?: number | string;
  height?: number;
  viewBox?: string;
  variant?: "watermark" | "colored";
}

export const CampusWatermarkSvg = React.memo(function CampusWatermarkSvg({
  width = "100%",
  height = 90,
  viewBox = "0 0 380 90",
  variant = "watermark",
}: Props) {
  const isColored = variant === "colored";

  return (
    <Svg width={width} height={height} viewBox={viewBox} fill="none">
      <Defs>
        <LinearGradient id="watermarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#94a3b8" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.08" />
        </LinearGradient>

        <LinearGradient id="coloredBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
        </LinearGradient>

        <LinearGradient id="coloredRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#38bdf8" />
          <Stop offset="100%" stopColor="#0284c7" />
        </LinearGradient>
      </Defs>

      {/* Sun glow when colored */}
      {isColored && (
        <Circle cx="190" cy="20" r="16" fill="#fde047" fillOpacity="0.65" />
      )}

      <G opacity={isColored ? 1 : 0.75}>
        {/* Ground line */}
        <Path
          d="M0 88 L380 88"
          stroke={isColored ? "#38bdf8" : "#cbd5e1"}
          strokeWidth="1.5"
          strokeOpacity={isColored ? 0.4 : 0.3}
        />

        {/* Left Tree clusters */}
        <Circle cx="45" cy="74" r="14" fill={isColored ? "#16a34a" : "#cbd5e1"} fillOpacity={isColored ? 0.75 : 0.25} />
        <Circle cx="62" cy="76" r="11" fill={isColored ? "#22c55e" : "#cbd5e1"} fillOpacity={isColored ? 0.85 : 0.3} />
        <Circle cx="80" cy="72" r="16" fill={isColored ? "#15803d" : "#cbd5e1"} fillOpacity={isColored ? 0.8 : 0.22} />
        <Circle cx="98" cy="78" r="10" fill={isColored ? "#22c55e" : "#cbd5e1"} fillOpacity={isColored ? 0.9 : 0.28} />

        {/* Right Tree clusters */}
        <Circle cx="295" cy="76" r="12" fill={isColored ? "#22c55e" : "#cbd5e1"} fillOpacity={isColored ? 0.85 : 0.25} />
        <Circle cx="312" cy="72" r="15" fill={isColored ? "#15803d" : "#cbd5e1"} fillOpacity={isColored ? 0.8 : 0.22} />
        <Circle cx="330" cy="76" r="11" fill={isColored ? "#16a34a" : "#cbd5e1"} fillOpacity={isColored ? 0.85 : 0.3} />
        <Circle cx="348" cy="74" r="14" fill={isColored ? "#22c55e" : "#cbd5e1"} fillOpacity={isColored ? 0.75 : 0.2} />

        {/* University Main Hall Base */}
        <Rect
          x="120"
          y="48"
          width="140"
          height="40"
          rx="3"
          fill={isColored ? "url(#coloredBuildingGrad)" : "url(#watermarkGrad)"}
        />

        {/* Main Hall Pillars / Windows */}
        <Rect x="132" y="58" width="8" height="22" rx="2" fill="#ffffff" fillOpacity={isColored ? 0.95 : 0.6} />
        <Rect x="148" y="58" width="8" height="22" rx="2" fill="#ffffff" fillOpacity={isColored ? 0.95 : 0.6} />
        <Rect x="164" y="58" width="8" height="22" rx="2" fill="#ffffff" fillOpacity={isColored ? 0.95 : 0.6} />
        <Rect x="208" y="58" width="8" height="22" rx="2" fill="#ffffff" fillOpacity={isColored ? 0.95 : 0.6} />
        <Rect x="224" y="58" width="8" height="22" rx="2" fill="#ffffff" fillOpacity={isColored ? 0.95 : 0.6} />
        <Rect x="240" y="58" width="8" height="22" rx="2" fill="#ffffff" fillOpacity={isColored ? 0.95 : 0.6} />

        {/* Central Entrance Portal */}
        <Path
          d="M182 88 L182 66 C182 61 198 61 198 66 L198 88 Z"
          fill="#ffffff"
          fillOpacity={isColored ? 0.95 : 0.75}
        />

        {/* Central Tower Body */}
        <Rect
          x="174"
          y="24"
          width="32"
          height="28"
          rx="2"
          fill={isColored ? "url(#coloredBuildingGrad)" : "url(#watermarkGrad)"}
        />

        {/* Clock in Central Tower */}
        <Circle cx="190" cy="38" r="6" fill="#ffffff" fillOpacity={0.95} />
        <Circle cx="190" cy="38" r="1.2" fill={isColored ? "#0369a1" : "#64748b"} />
        <Path
          d="M190 38 L190 35 M190 38 L193 38"
          stroke={isColored ? "#0369a1" : "#64748b"}
          strokeWidth="0.9"
        />

        {/* Clock Tower Dome / Roof */}
        <Path
          d="M172 24 L190 8 L208 24 Z"
          fill={isColored ? "url(#coloredRoofGrad)" : "#94a3b8"}
          fillOpacity={isColored ? 1 : 0.4}
        />

        {/* Spire */}
        <Path
          d="M190 8 L190 1"
          stroke={isColored ? "#0284c7" : "#94a3b8"}
          strokeWidth="1.5"
          strokeOpacity={isColored ? 0.9 : 0.5}
        />
        <Circle
          cx="190"
          cy="1"
          r="1.5"
          fill={isColored ? "#38bdf8" : "#94a3b8"}
          fillOpacity={isColored ? 1 : 0.6}
        />
      </G>
    </Svg>
  );
});
