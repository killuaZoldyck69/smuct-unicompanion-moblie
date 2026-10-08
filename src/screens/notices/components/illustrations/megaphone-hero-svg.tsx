// src/screens/notices/components/illustrations/megaphone-hero-svg.tsx
import React from "react";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from "react-native-svg";

interface Props {
  width?: number;
  height?: number;
}

export const MegaphoneHeroSvg = React.memo(function MegaphoneHeroSvg({
  width = 96,
  height = 80,
}: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 100" fill="none">
      <Defs>
        <LinearGradient
          id="cloudGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#bae6fd" stopOpacity="0.35" />
        </LinearGradient>
        <LinearGradient
          id="coneGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop offset="0%" stopColor="#60a5fa" />
          <Stop offset="100%" stopColor="#38bdf8" />
        </LinearGradient>
        <LinearGradient
          id="handleGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <Stop offset="0%" stopColor="#93c5fd" />
          <Stop offset="100%" stopColor="#60a5fa" />
        </LinearGradient>
      </Defs>

      {/* Soft Background Cloud Bubble */}
      <Path
        d="M30 65 C15 65 10 50 20 38 C15 25 30 15 45 20 C55 10 75 10 85 20 C100 15 110 28 105 42 C115 52 110 68 95 68 C85 75 40 75 30 65 Z"
        fill="url(#cloudGrad)"
      />

      <G transform="translate(10, 5)">
        {/* Megaphone Handle */}
        <Path
          d="M48 52 L42 68 C41 71 43 74 46 74 C49 74 51 72 52 69 L56 54 Z"
          fill="url(#handleGrad)"
        />

        {/* Back cap of Megaphone */}
        <Path
          d="M36 34 C33 34 30 37 30 42 C30 47 33 50 36 50 Z"
          fill="#3b82f6"
        />

        {/* Main Cone */}
        <Path
          d="M36 37 L72 24 C74 23 76 25 76 28 L76 56 C76 59 74 61 72 60 L36 47 Z"
          fill="url(#coneGrad)"
        />

        {/* Front Opening Rim */}
        <Path
          d="M72 24 C75 23 78 30 78 42 C78 54 75 61 72 60 C69 59 66 52 66 42 C66 32 69 25 72 24 Z"
          fill="#93c5fd"
        />

        {/* Inner shadow rim */}
        <Path
          d="M72 28 C74 28 75 34 75 42 C75 50 74 56 72 56 C70 56 69 50 69 42 C69 34 70 28 72 28 Z"
          fill="#2563eb"
        />

        {/* Dynamic sound waves */}
        <Path
          d="M84 32 C88 36 88 48 84 52"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M91 26 C98 33 98 51 91 58"
          stroke="#60a5fa"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Accent Sparkles */}
        <Circle cx="86" cy="18" r="2" fill="#38bdf8" />
        <Circle cx="98" cy="22" r="1.5" fill="#60a5fa" />
        <Circle cx="94" cy="64" r="2" fill="#38bdf8" />
      </G>
    </Svg>
  );
});
