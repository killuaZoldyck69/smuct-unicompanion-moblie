import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RichTextEditor } from "@/components/rich-text-editor";
import { BENTO, fontFamily } from "./constants";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const CourseworkInstructionsInput: React.FC<Props> = ({
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.fieldLabel}>INSTRUCTIONS & RUBRIC (OPTIONAL)</Text>
      </View>
      <View style={styles.textAreaCard}>
        <RichTextEditor
          initialValue={value}
          onChange={(html) => onChangeText(html)}
          placeholder="Provide clear guidelines, problem statements, rubric criteria, or submission format for students..."
          minHeight={150}
          accentColor={BENTO.blueText}
          showJustify={false}
          showHelperText={false}
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
  textAreaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 8,
  },
});
