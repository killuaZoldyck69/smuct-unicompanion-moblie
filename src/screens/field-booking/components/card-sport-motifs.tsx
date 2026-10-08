import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { SportType } from "../types";

interface SportMotifProps {
  type: SportType;
}

export const CardSportMotif = React.memo(function CardSportMotif({
  type,
}: SportMotifProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {type === "cricket" && (
        <Svg width={92} height={82} viewBox="0 0 92 82" fill="none">
          <Defs>
            <LinearGradient id="cricketTurf" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#ccfbf1" stopOpacity="0.75" />
            </LinearGradient>
          </Defs>
          {/* Turf blob */}
          <Path
            d="M20 54 C10 32, 45 16, 68 22 C88 28, 92 56, 76 68 C58 80, 28 72, 20 54 Z"
            fill="url(#cricketTurf)"
          />
          {/* Cricket Stumps / Wickets */}
          <G opacity="0.6">
            <Rect x="60" y="38" width="2" height="20" rx="1" fill="#94a3b8" />
            <Rect x="64" y="38" width="2" height="20" rx="1" fill="#94a3b8" />
            <Rect x="68" y="38" width="2" height="20" rx="1" fill="#94a3b8" />
            <Rect x="59" y="37" width="11" height="1.6" rx="0.8" fill="#64748b" />
          </G>
          {/* Cricket Bat */}
          <G transform="rotate(-36 38 42)">
            <Rect x="36" y="16" width="9" height="34" rx="3" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
            <Rect x="39" y="4" width="3" height="14" rx="1.5" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" />
            <Path d="M38 22 L44 22 M38 27 L44 27" stroke="#60a5fa" strokeWidth="1" strokeLinecap="round" />
          </G>
          {/* Cricket Ball */}
          <Circle cx="72" cy="28" r="5" fill="#fecdd3" stroke="#fda4af" strokeWidth="1" />
          <Path d="M69 26 C72 27, 73 29, 74 31" stroke="#ffffff" strokeWidth="0.8" />
        </Svg>
      )}

      {type === "football" && (
        <Svg width={92} height={82} viewBox="0 0 92 82" fill="none">
          <Defs>
            <LinearGradient id="footballTurf" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#dcfce7" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.7" />
            </LinearGradient>
          </Defs>
          {/* Turf blob */}
          <Path
            d="M18 50 C12 30, 48 18, 70 24 C90 30, 88 58, 72 68 C54 78, 24 70, 18 50 Z"
            fill="url(#footballTurf)"
          />
          {/* Soccer Ball */}
          <Circle cx="54" cy="46" r="16" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          {/* Ball pentagons */}
          <Path
            d="M54 36 L59 40 L57 45 L51 45 L49 40 Z"
            fill="#334155"
          />
          <Path
            d="M59 40 L67 39 M57 45 L62 52 M51 45 L46 52 M49 40 L41 39 M54 36 L54 31"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <Circle cx="54" cy="46" r="15" stroke="#e2e8f0" strokeWidth="0.8" />
        </Svg>
      )}

      {type !== "cricket" && type !== "football" && (
        <Svg width={92} height={82} viewBox="0 0 92 82" fill="none">
          <Defs>
            <LinearGradient id="fieldTurf" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#d1fae5" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.65" />
            </LinearGradient>
          </Defs>
          {/* Turf blob */}
          <Path
            d="M16 52 C8 34, 42 20, 68 25 C88 30, 88 58, 72 68 C52 78, 24 70, 16 52 Z"
            fill="url(#fieldTurf)"
          />
          {/* Ground Flag */}
          <Path d="M55 25 L55 58" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M55 25 L73 34 L55 42 Z" fill="#93c5fd" stroke="#60a5fa" strokeWidth="1" />
          <Circle cx="55" cy="58" r="3" fill="#cbd5e1" />
        </Svg>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 4,
    bottom: 2,
    opacity: 0.85,
  },
});
