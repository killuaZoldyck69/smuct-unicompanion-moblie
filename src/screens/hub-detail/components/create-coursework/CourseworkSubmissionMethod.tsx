import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SubmissionType } from "./types";
import { BENTO, fontFamily } from "./constants";

interface Props {
  selectedMethod: SubmissionType;
  onSelectMethod: (method: SubmissionType) => void;
}

export const CourseworkSubmissionMethod: React.FC<Props> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.labelRow}>
        <View style={styles.labelDot} />
        <Text style={styles.fieldLabel}>SUBMISSION METHOD</Text>
      </View>
      <View style={styles.submissionGrid}>
        {/* Option 1: Online Submission */}
        <TouchableOpacity
          style={[
            styles.submissionCard,
            selectedMethod === "ONLINE" && styles.submissionCardActive,
          ]}
          onPress={() => onSelectMethod("ONLINE")}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Online digital link submission"
        >
          <View style={styles.submissionCardHeader}>
            <View
              style={[
                styles.submissionIconCircle,
                selectedMethod === "ONLINE" && styles.submissionIconCircleActive,
              ]}
            >
              <Feather
                name="globe"
                size={15}
                color={selectedMethod === "ONLINE" ? "#ffffff" : BENTO.slate}
              />
            </View>
            {selectedMethod === "ONLINE" && (
              <View style={styles.activeCheckPill}>
                <Feather name="check" size={11} color={BENTO.mintText} />
              </View>
            )}
          </View>
          <Text style={styles.submissionTitle}>Online Link</Text>
          <Text style={styles.submissionSubtitle}>
            Google Drive, GitHub or Docs
          </Text>
        </TouchableOpacity>

        {/* Option 2: In-Hand / Physical Submission */}
        <TouchableOpacity
          style={[
            styles.submissionCard,
            selectedMethod === "HAND" && styles.submissionCardActive,
          ]}
          onPress={() => onSelectMethod("HAND")}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Offline in-hand physical submission"
        >
          <View style={styles.submissionCardHeader}>
            <View
              style={[
                styles.submissionIconCircle,
                selectedMethod === "HAND" && styles.submissionIconCircleActive,
              ]}
            >
              <Feather
                name="clipboard"
                size={15}
                color={selectedMethod === "HAND" ? "#ffffff" : BENTO.slate}
              />
            </View>
            {selectedMethod === "HAND" && (
              <View style={styles.activeCheckPill}>
                <Feather name="check" size={11} color={BENTO.mintText} />
              </View>
            )}
          </View>
          <Text style={styles.submissionTitle}>In-Hand / Physical</Text>
          <Text style={styles.submissionSubtitle}>
            Hardcopy in classroom
          </Text>
        </TouchableOpacity>
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
  submissionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  submissionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BENTO.border,
    padding: 13,
  },
  submissionCardActive: {
    borderColor: BENTO.navy,
    backgroundColor: "#fcfdfe",
  },
  submissionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  submissionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BENTO.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  submissionIconCircleActive: {
    backgroundColor: BENTO.navy,
  },
  activeCheckPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BENTO.mintSoft,
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  submissionTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 2,
  },
  submissionSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 14,
  },
});
