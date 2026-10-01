import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./constants";

interface Props {
  value: boolean;
  onToggle: (enabled: boolean) => void;
}

export const CourseworkLateSubmissionToggle: React.FC<Props> = ({
  value,
  onToggle,
}) => {
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.labelRow}>
        <View style={[styles.labelDot, value && styles.labelDotActive]} />
        <Text style={styles.fieldLabel}>LATE SUBMISSION POLICY</Text>
      </View>

      <TouchableOpacity
        style={[styles.toggleCard, value && styles.toggleCardActive]}
        activeOpacity={0.85}
        onPress={() => onToggle(!value)}
        accessible={true}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityLabel="Allow late submission toggle"
      >
        <View style={styles.cardHeaderRow}>
          <View
            style={[
              styles.iconCircle,
              value ? styles.iconCircleActive : styles.iconCircleInactive,
            ]}
          >
            <Feather
              name={value ? "clock" : "lock"}
              size={17}
              color={value ? "#0d9488" : BENTO.slate}
            />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleBadgeRow}>
              <Text style={styles.cardTitle}>
                {value ? "Allow Late Submissions" : "Close on Deadline"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  value ? styles.statusBadgeActive : styles.statusBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    value
                      ? styles.statusBadgeTextActive
                      : styles.statusBadgeTextInactive,
                  ]}
                >
                  {value ? "Late Allowed" : "Strict Deadline"}
                </Text>
              </View>
            </View>

            <Text style={styles.cardSubtitle}>
              {value
                ? "Students can submit work past the deadline. Their submissions will be clearly flagged as late."
                : "Submissions will automatically lock and close for students once the deadline passes."}
            </Text>
          </View>

          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{
              false: "#e2e8f0",
              true: "#99f6e4",
            }}
            thumbColor={value ? "#0d9488" : "#94a3b8"}
            ios_backgroundColor="#e2e8f0"
            style={Platform.OS === "ios" ? { transform: [{ scale: 0.85 }] } : undefined}
          />
        </View>
      </TouchableOpacity>
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
  labelDotActive: {
    backgroundColor: "#0d9488",
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  toggleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BENTO.border,
    padding: 14,
  },
  toggleCardActive: {
    borderColor: "#0d9488",
    backgroundColor: "#f0fdfa",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCircleInactive: {
    backgroundColor: BENTO.canvas,
  },
  iconCircleActive: {
    backgroundColor: "#ccfbf1",
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 3,
  },
  cardTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "800",
    color: BENTO.navy,
  },
  cardSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 15,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: "#ccfbf1",
  },
  statusBadgeInactive: {
    backgroundColor: "#f1f5f9",
  },
  statusBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  statusBadgeTextActive: {
    color: "#0f766e",
  },
  statusBadgeTextInactive: {
    color: "#64748b",
  },
});
