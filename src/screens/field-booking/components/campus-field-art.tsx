import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

export const CampusFieldArt = React.memo(function CampusFieldArt() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={140} height={88} viewBox="0 0 140 88" fill="none">
        <Defs>
          <LinearGradient id="fieldGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.6" />
          </LinearGradient>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#f0fdf4" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Soft Background Cloud/Hills */}
        <Path
          d="M10 50 C25 25, 60 20, 85 35 C105 20, 135 30, 140 55 L140 88 L10 88 Z"
          fill="url(#skyGrad)"
        />

        {/* Campus Building Silhouette */}
        <Rect x="78" y="24" width="28" height="24" rx="2" fill="#cbd5e1" opacity="0.6" />
        <Rect x="83" y="18" width="18" height="8" rx="1" fill="#94a3b8" opacity="0.5" />
        <Rect x="90" y="14" width="4" height="5" fill="#64748b" opacity="0.5" />
        {/* Windows */}
        <Rect x="82" y="28" width="4" height="5" rx="1" fill="#f8fafc" opacity="0.8" />
        <Rect x="90" y="28" width="4" height="5" rx="1" fill="#f8fafc" opacity="0.8" />
        <Rect x="98" y="28" width="4" height="5" rx="1" fill="#f8fafc" opacity="0.8" />
        <Rect x="82" y="36" width="4" height="5" rx="1" fill="#f8fafc" opacity="0.8" />
        <Rect x="90" y="36" width="4" height="5" rx="1" fill="#f8fafc" opacity="0.8" />
        <Rect x="98" y="36" width="4" height="5" rx="1" fill="#f8fafc" opacity="0.8" />

        {/* Trees */}
        <Circle cx="64" cy="46" r="12" fill="#86efac" opacity="0.5" />
        <Circle cx="72" cy="42" r="10" fill="#4ade80" opacity="0.5" />
        <Circle cx="114" cy="45" r="11" fill="#86efac" opacity="0.5" />
        <Circle cx="124" cy="48" r="9" fill="#4ade80" opacity="0.4" />

        {/* Stadium Floodlight Tower */}
        <G opacity="0.6">
          <Path d="M42 22 L45 52 M46 22 L43 52 M40 32 L48 32 M41 42 L47 42" stroke="#64748b" strokeWidth="1" />
          <Rect x="38" y="18" width="12" height="5" rx="1" fill="#475569" />
          <Circle cx="40" cy="20.5" r="1.2" fill="#fef08a" />
          <Circle cx="44" cy="20.5" r="1.2" fill="#fef08a" />
          <Circle cx="48" cy="20.5" r="1.2" fill="#fef08a" />
        </G>

        {/* Perspective Sports Field Turf */}
        <Path
          d="M18 56 L130 52 L138 82 L6 86 Z"
          fill="url(#fieldGrad)"
        />
        {/* Field White Markings */}
        <Path
          d="M24 58 L124 54 L132 80 L12 84 Z"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.85"
        />
        {/* Center Line & Circle */}
        <Path d="M74 56 L72 82" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
        <Circle cx="73" cy="69" r="7" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
        {/* Penalty Box */}
        <Path d="M26 66 L42 65 L40 76 L22 78" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
        <Path d="M122 62 L106 63 L108 73 L126 71" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 88,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
});
