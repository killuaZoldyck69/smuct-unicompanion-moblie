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
      {/* Instructor Avatar */}
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

      {/* Subtle Vertical Divider */}
      <View style={styles.verticalDivider} />

      {/* Text Info */}
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
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.04)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#1e293b",
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 12,
  },
  textColumn: {
    flex: 1,
  },
  label: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  name: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 19,
  },
});
