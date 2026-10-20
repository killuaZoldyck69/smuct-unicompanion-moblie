import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ActionTilesRowProps {
  onAddEvent: () => void;
  onImport: () => void;
  onPreview: () => void;
  onArchive: () => void;
}

export const ActionTilesRow: React.FC<ActionTilesRowProps> = ({
  onAddEvent,
  onImport,
  onPreview,
  onArchive,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Add Event (Green) */}
      <TouchableOpacity
        style={[styles.tile, styles.addTile]}
        onPress={onAddEvent}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Add Event"
      >
        <View style={styles.iconCircleGreen}>
          <Feather name="plus-circle" size={17} color="#059669" />
        </View>
        <Text style={[styles.tileText, { color: "#047857" }]}>Add Event</Text>
      </TouchableOpacity>

      {/* 2. Import (Purple) */}
      <TouchableOpacity
        style={[styles.tile, styles.importTile]}
        onPress={onImport}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Import CSV"
      >
        <View style={styles.iconCirclePurple}>
          <Feather name="file-text" size={17} color="#7c3aed" />
        </View>
        <Text style={[styles.tileText, { color: "#7c3aed" }]}>Import</Text>
      </TouchableOpacity>

      {/* 3. Preview (Blue) */}
      <TouchableOpacity
        style={[styles.tile, styles.previewTile]}
        onPress={onPreview}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Preview student view"
      >
        <View style={styles.iconCircleBlue}>
          <Feather name="eye" size={17} color="#0284c7" />
        </View>
        <Text style={[styles.tileText, { color: "#0284c7" }]}>Preview</Text>
      </TouchableOpacity>

      {/* 4. Archive (Slate) */}
      <TouchableOpacity
        style={[styles.tile, styles.archiveTile]}
        onPress={onArchive}
        activeOpacity={0.75}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Archive calendar"
      >
        <View style={styles.iconCircleSlate}>
          <Feather name="archive" size={17} color="#475569" />
        </View>
        <Text style={[styles.tileText, { color: "#475569" }]}>Archive</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  addTile: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  importTile: {
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },
  previewTile: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  archiveTile: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  iconCircleGreen: {
    marginBottom: 4,
  },
  iconCirclePurple: {
    marginBottom: 4,
  },
  iconCircleBlue: {
    marginBottom: 4,
  },
  iconCircleSlate: {
    marginBottom: 4,
  },
  tileText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
