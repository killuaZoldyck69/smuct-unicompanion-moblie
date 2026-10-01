import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./constants";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const CourseworkTitleInput: React.FC<Props> = ({
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.fieldLabel}>COURSEWORK TITLE</Text>
      </View>
      <View style={styles.inputCard}>
        <Feather name="edit-3" size={16} color={BENTO.slate} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="e.g. Midterm Project, Lab Task 4, CT-2"
          placeholderTextColor="#94a3b8"
          accessible={true}
          accessibilityLabel="Coursework Title"
        />
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
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
  },
});
