import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { CAMPUS_HUB_COLORS, fontFamily } from "./design-tokens";

interface AvatarChipProps {
  name: string;
  image?: string | null;
  subtitle?: string;
  size?: number;
}

export const AvatarChip = React.memo(function AvatarChip({
  name,
  image,
  subtitle,
  size = 36,
}: AvatarChipProps) {
  const initial = (name ?? "U").charAt(0).toUpperCase();
  const halfSize = size / 2;

  return (
    <View style={styles.row}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={[styles.avatar, { width: size, height: size, borderRadius: halfSize }]}
          accessible={true}
          accessibilityLabel={`${name}'s avatar`}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: halfSize },
          ]}
        >
          <Text style={[styles.fallbackText, { fontSize: size * 0.38 }]}>
            {initial}
          </Text>
        </View>
      )}
      <View style={styles.textCol}>
        <Text style={styles.name} numberOfLines={1}>
          {name ?? "University Member"}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    resizeMode: "cover",
  },
  fallback: {
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  textCol: {
    flex: 1,
  },
  name: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  subtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },
});
