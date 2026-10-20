import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressRingProps {
  currentWeek: number;
  totalWeeks: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  currentWeek = 1,
  totalWeeks = 15,
  size = 68,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(currentWeek / Math.max(totalWeeks, 1), 0.05), 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e0f2fe"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#0284c7"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Label */}
      <View style={styles.centerTextContainer}>
        <Text style={styles.currentWeekText}>
          W. {String(currentWeek).padStart(2, "0")}
        </Text>
        <Text style={styles.totalWeeksText}>of {totalWeeks}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  currentWeekText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  totalWeeksText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#64748b",
    marginTop: -1,
  },
});
