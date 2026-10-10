import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialSectionTab } from "./types";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface MaterialsFilterTabsProps {
  activeTab: MaterialSectionTab;
  onTabChange: (tab: MaterialSectionTab) => void;
  officialCount?: number;
  studentNotesCount?: number;
}

export const MaterialsFilterTabs: React.FC<MaterialsFilterTabsProps> = React.memo(
  ({ activeTab, onTabChange }) => {
    return (
      <View style={styles.container}>
        <View style={styles.tabsTrack}>
          {/* Tab 1: Course Material */}
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "OFFICIAL" && styles.tabBtnActive,
            ]}
            onPress={() => onTabChange("OFFICIAL")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Course Material tab"
            accessibilityState={{ selected: activeTab === "OFFICIAL" }}
          >
            <Feather
              name="book-open"
              size={14}
              color={activeTab === "OFFICIAL" ? "#0f172a" : "#64748b"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "OFFICIAL" && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              Course Material
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Student Resources */}
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "STUDENT_NOTES" && styles.tabBtnActive,
            ]}
            onPress={() => onTabChange("STUDENT_NOTES")}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Student Resources tab"
            accessibilityState={{ selected: activeTab === "STUDENT_NOTES" }}
          >
            <Feather
              name="users"
              size={14}
              color={activeTab === "STUDENT_NOTES" ? "#0f172a" : "#64748b"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "STUDENT_NOTES" && styles.tabTextActive,
              ]}
              numberOfLines={1}
            >
              Student Resources
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  tabsTrack: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.05)",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#0f172a",
    fontWeight: "800",
  },
});
