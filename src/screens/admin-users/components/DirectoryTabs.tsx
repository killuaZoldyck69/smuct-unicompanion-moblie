import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { THEME } from "../constants";
import { TabType } from "../types";

interface DirectoryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const DirectoryTabs = React.memo(
  ({ activeTab, onTabChange }: DirectoryTabsProps) => {
    const isStudentTab = activeTab === "STUDENT";

    return (
      <View style={styles.tabsRow}>
        <View style={styles.tabsContainer}>
          {/* Teachers Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => onTabChange("TEACHER")}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: !isStudentTab }}
            accessibilityLabel="View teachers"
          >
            <View
              style={[
                styles.tabInner,
                !isStudentTab && {
                  backgroundColor: THEME.teacherPrimary,
                },
              ]}
            >
              <Feather
                name="briefcase"
                size={16}
                color={!isStudentTab ? "#FFFFFF" : THEME.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabLabel,
                  !isStudentTab && {
                    color: "#FFFFFF",
                    fontWeight: "700",
                  },
                ]}
              >
                Teachers
              </Text>
            </View>
          </TouchableOpacity>

          {/* Students Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => onTabChange("STUDENT")}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: isStudentTab }}
            accessibilityLabel="View students"
          >
            <View
              style={[
                styles.tabInner,
                isStudentTab && {
                  backgroundColor: THEME.studentPrimary,
                },
              ]}
            >
              <Feather
                name="user"
                size={16}
                color={isStudentTab ? "#FFFFFF" : THEME.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isStudentTab && {
                    color: "#FFFFFF",
                    fontWeight: "700",
                  },
                ]}
              >
                Students
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  tabsRow: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  tabsContainer: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 44,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textSecondary,
  },
});
