/**
 * CampusIllustration
 *
 * Minimal geometric university campus scene.
 * Used as a watermark in the Academic Record card.
 *
 * Design: flat, editorial, geometric, no cartoon characters.
 * Reuse: scale, flip, crop, adjust opacity per card.
 */
import React from "react";
import Svg, {
  Rect,
  Polygon,
  Circle,
  Line,
  Path,
  G,
  Ellipse,
} from "react-native-svg";

interface CampusIllustrationProps {
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
}

export const CampusIllustration = React.memo(function CampusIllustration({
  width = 120,
  height = 110,
  opacity = 0.13,
  color = "#2563eb",
}: CampusIllustrationProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 120 110"
      accessible={false}
      aria-hidden={true}
    >
      <G opacity={opacity}>
        {/* Ground line */}
        <Line x1="4" y1="96" x2="116" y2="96" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

        {/* === LEFT TREE === */}
        {/* trunk */}
        <Rect x="10" y="80" width="4" height="16" rx="2" fill={color} />
        {/* canopy circles — layered */}
        <Circle cx="12" cy="74" r="9" fill={color} />
        <Circle cx="9" cy="80" r="6" fill={color} />
        <Circle cx="15" cy="79" r="6" fill={color} />

        {/* === RIGHT TREE === */}
        <Rect x="104" y="80" width="4" height="16" rx="2" fill={color} />
        <Circle cx="106" cy="73" r="9" fill={color} />
        <Circle cx="103" cy="79" r="6" fill={color} />
        <Circle cx="109" cy="78" r="6" fill={color} />

        {/* === MAIN BUILDING BODY === */}
        <Rect x="28" y="62" width="64" height="34" rx="3" fill={color} />

        {/* Building windows — left wing */}
        <Rect x="32" y="70" width="10" height="10" rx="2" fill={color} opacity={0.35} />
        <Rect x="32" y="84" width="10" height="8" rx="2" fill={color} opacity={0.35} />

        {/* Building windows — right wing */}
        <Rect x="78" y="70" width="10" height="10" rx="2" fill={color} opacity={0.35} />
        <Rect x="78" y="84" width="10" height="8" rx="2" fill={color} opacity={0.35} />

        {/* === CENTRAL ARCH TOWER === */}
        {/* Tower body */}
        <Rect x="48" y="38" width="24" height="40" rx="3" fill={color} />

        {/* Arch entrance */}
        <Path
          d="M54 96 L54 78 Q60 70 66 78 L66 96 Z"
          fill="white"
          opacity={0.7}
        />

        {/* Tower windows */}
        <Rect x="52" y="44" width="7" height="8" rx="2" fill={color} opacity={0.30} />
        <Rect x="61" y="44" width="7" height="8" rx="2" fill={color} opacity={0.30} />

        {/* === CLOCK TOWER PEAK === */}
        {/* Belfry */}
        <Rect x="51" y="24" width="18" height="16" rx="2" fill={color} />
        {/* Clock face */}
        <Circle cx="60" cy="31" r="5" fill="white" opacity={0.6} />
        {/* Clock hands */}
        <Line x1="60" y1="31" x2="60" y2="27.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <Line x1="60" y1="31" x2="63" y2="33" stroke={color} strokeWidth="1" strokeLinecap="round" />

        {/* === SPIRE === */}
        <Polygon points="60,6 55,24 65,24" fill={color} />

        {/* === FLAG === */}
        <Line x1="60" y1="6" x2="60" y2="2" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <Polygon points="60,2 68,5 60,8" fill={color} />

        {/* === STEPS === */}
        <Rect x="44" y="90" width="32" height="4" rx="1.5" fill={color} opacity={0.5} />
        <Rect x="40" y="93" width="40" height="3" rx="1.5" fill={color} opacity={0.5} />

        {/* === SUBTLE PATH / GROUND DETAIL === */}
        <Ellipse cx="60" cy="97" rx="18" ry="2" fill={color} opacity={0.12} />
      </G>
    </Svg>
  );
});
