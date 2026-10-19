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
          <View style={styles.tabInner}>
            <Feather
              name="user"
              size={16}
              color={isStudentTab ? THEME.studentPrimary : THEME.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabLabel,
                isStudentTab && {
                  color: THEME.studentPrimary,
                  fontWeight: "700",
                },
              ]}
            >
              Students
            </Text>
          </View>
          {isStudentTab && (
            <View
              style={[
                styles.activeTabUnderline,
                { backgroundColor: THEME.studentPrimary },
              ]}
            />
          )}
        </TouchableOpacity>

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
          <View style={styles.tabInner}>
            <Feather
              name="briefcase"
              size={16}
              color={!isStudentTab ? THEME.teacherPrimary : THEME.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabLabel,
                !isStudentTab && {
                  color: THEME.teacherPrimary,
                  fontWeight: "700",
                },
              ]}
            >
              Teachers
            </Text>
          </View>
          {!isStudentTab && (
            <View
              style={[
                styles.activeTabUnderline,
                { backgroundColor: THEME.teacherPrimary },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.textSecondary,
  },
  activeTabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 20,
    right: 20,
    height: 3,
    borderRadius: 3,
  },
});
