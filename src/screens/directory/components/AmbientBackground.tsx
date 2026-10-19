import React from "react";
import { View, StyleSheet } from "react-native";

interface AmbientBackgroundProps {
  topInset: number;
}

export const AmbientBackground = React.memo(
  ({ topInset }: AmbientBackgroundProps) => {
    return (
      <>
        {/* Soft Lavender ambient blur on top left */}
        <View pointerEvents="none" style={styles.ambientTopLeft} />

        {/* Soft Amber ambient blur on top right */}
        <View
          pointerEvents="none"
          style={[styles.ambientTopRight, { top: topInset + 4 }]}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  ambientTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 145,
    height: 120,
    borderBottomRightRadius: 85,
    borderBottomLeftRadius: 15,
    backgroundColor: "#EDE9FE",
    opacity: 0.85,
  },
  ambientTopRight: {
    position: "absolute",
    right: -25,
    width: 125,
    height: 125,
    borderRadius: 62.5,
    backgroundColor: "#FEF3C7",
    opacity: 0.85,
  },
});
