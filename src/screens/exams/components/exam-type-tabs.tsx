// src/screens/exams/components/exam-type-tabs.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ExamTabType } from "../types";
import { ExamTheme, fontFamily } from "../theme";

interface TabsProps {
  selectedTab: ExamTabType;
  onSelectTab: (tab: ExamTabType) => void;
  midtermCount: number;
  finalCount: number;
  theme: ExamTheme;
}

export const ExamTypeTabs = React.memo(function ExamTypeTabs({
  selectedTab,
  onSelectTab,
  midtermCount,
  finalCount,
  theme,
}: TabsProps) {
  return (
    <View style={[styles.container, { backgroundColor: theme.tabBarBg }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === "Midterms" && [
            styles.tabActive,
            { backgroundColor: theme.tabActiveBg },
          ],
        ]}
        onPress={() => onSelectTab("Midterms")}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: selectedTab === "Midterms" }}
        accessibilityLabel={`Midterms tab, ${midtermCount} exams`}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                selectedTab === "Midterms"
                  ? theme.tabActiveText
                  : theme.tabInactiveText,
            },
          ]}
        >
          Midterms {midtermCount > 0 ? `(${midtermCount})` : ""}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === "Finals" && [
            styles.tabActive,
            { backgroundColor: theme.tabActiveBg },
          ],
        ]}
        onPress={() => onSelectTab("Finals")}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: selectedTab === "Finals" }}
        accessibilityLabel={`Finals tab, ${finalCount} exams`}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                selectedTab === "Finals"
                  ? theme.tabActiveText
                  : theme.tabInactiveText,
            },
          ]}
        >
          Finals {finalCount > 0 ? `(${finalCount})` : ""}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
