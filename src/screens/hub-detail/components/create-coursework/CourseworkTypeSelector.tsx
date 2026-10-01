import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AssessmentType } from "./types";
import { BENTO, ASSESSMENT_TYPES, fontFamily } from "./constants";

interface Props {
  selectedType: AssessmentType;
  onSelectType: (type: AssessmentType) => void;
}

export const CourseworkTypeSelector: React.FC<Props> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.fieldLabel}>ASSESSMENT TYPE</Text>
      </View>
      <View style={styles.typeTabsContainer}>
        {ASSESSMENT_TYPES.map((t) => {
          const isActive = selectedType === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => onSelectType(t.id)}
              style={[
                styles.typeTab,
                isActive && {
                  backgroundColor: t.activeBg,
                  borderColor: t.activeBorder,
                },
              ]}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Select ${t.label}`}
            >
              <Feather
                name={t.icon}
                size={13}
                color={isActive ? t.activeText : BENTO.slate}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.typeTabText,
                  isActive && { color: t.activeText, fontWeight: "700" },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BENTO.navy,
    marginRight: 6,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  typeTabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  typeTabText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
});
