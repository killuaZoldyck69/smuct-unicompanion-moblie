import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, MARKS_PRESETS, fontFamily } from "./constants";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const CourseworkMarksInput: React.FC<Props> = ({
  value,
  onChangeText,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.fieldLabel}>TOTAL MARKS</Text>
      </View>
      <View style={styles.marksContainer}>
        <View style={styles.inputCard}>
          <Feather name="award" size={16} color={BENTO.navy} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor="#94a3b8"
            maxLength={4}
            accessible={true}
            accessibilityLabel="Total marks"
          />
          <Text style={styles.unitSuffix}>Points</Text>
        </View>

        {/* Marks Presets */}
        <View style={styles.marksChipsRow}>
          {MARKS_PRESETS.map((pts) => {
            const isSelected = value === pts;
            return (
              <TouchableOpacity
                key={pts}
                onPress={() => onChangeText(pts)}
                style={[
                  styles.marksChip,
                  isSelected && styles.marksChipSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.marksChipText,
                    isSelected && styles.marksChipTextSelected,
                  ]}
                >
                  {pts}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  marksContainer: {
    gap: 8,
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
  unitSuffix: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.slate,
    marginLeft: 8,
  },
  marksChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  marksChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingVertical: 6,
  },
  marksChipSelected: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  marksChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  marksChipTextSelected: {
    color: "#ffffff",
  },
});
