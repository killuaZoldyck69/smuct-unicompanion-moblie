import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { fontFamily } from "../constants";

interface InstructorBlockProps {
  name: string;
  image?: string | null;
}

export const InstructorBlock = React.memo(function InstructorBlock({
  name,
  image,
}: InstructorBlockProps) {
  // Compute clean initials for fallback
  const initials = React.useMemo(() => {
    if (!name || name.trim().length === 0) return "F";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }, [name]);

  return (
    <View style={styles.container}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.fallbackText}>{initials}</Text>
        </View>
      )}

      <View style={styles.textColumn}>
        <Text style={styles.label}>INSTRUCTOR</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name || "Faculty Member"}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
  },
  fallbackText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#1e293b",
  },
  textColumn: {
    marginLeft: 10,
    flex: 1,
  },
  label: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 1,
  },
  name: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
});
