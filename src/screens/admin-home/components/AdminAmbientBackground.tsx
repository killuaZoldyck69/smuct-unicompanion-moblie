import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

interface AdminAmbientBackgroundProps {
  topInset: number;
}

/**
 * Decorative ambient gradient blobs positioned behind the content layer.
 * Uses absolute positioning so the main scroll content sits on top.
 * Consistent design language with AdminUsersScreen's AmbientBackground.
 */
export const AdminAmbientBackground = React.memo(
  function AdminAmbientBackground({ topInset }: AdminAmbientBackgroundProps) {
    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 0 }]}>
        {/* Top-left indigo blob */}
        <View
          style={[
            styles.blob,
            styles.blobTopLeft,
            { top: topInset + 10 },
          ]}
        />
        {/* Top-right teal blob */}
        <View style={[styles.blob, styles.blobTopRight, { top: topInset }]} />
        {/* Mid-left subtle rose blob */}
        <View style={[styles.blob, styles.blobMid]} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.06,
  },
  blobTopLeft: {
    width: 200,
    height: 200,
    backgroundColor: colors.semantic.indigo.solid,
    left: -60,
  },
  blobTopRight: {
    width: 160,
    height: 160,
    backgroundColor: colors.semantic.sky.solid,
    right: -40,
  },
  blobMid: {
    width: 260,
    height: 260,
    backgroundColor: colors.semantic.violet.solid,
    top: 340,
    left: -80,
    opacity: 0.04,
  },
});
