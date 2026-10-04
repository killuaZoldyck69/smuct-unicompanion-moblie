import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, GRADE_SCALE, fontFamily } from "../constants";

interface GradeScaleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GradeScaleModal = React.memo(function GradeScaleModal({
  visible,
  onClose,
}: GradeScaleModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 16, 24),
          },
        ]}
        accessibilityViewIsModal={true}
      >
        {/* Backdrop Dismiss Area */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Dismiss modal backdrop"
        />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>SMUCT Grading Policy</Text>
              <Text style={styles.subtitle}>UGC standard 4.00 grading scale</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close grading scale modal"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          {/* Table Column Headers */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { width: 52 }]}>GRADE</Text>
            <Text style={[styles.colHeader, { width: 80 }]}>POINT</Text>
            <Text style={[styles.colHeader, { flex: 1, textAlign: "right" }]}>
              MARKS RANGE
            </Text>
          </View>

          {/* Scrollable Grade Rows */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {GRADE_SCALE.map((g) => (
              <View key={g.grade} style={styles.row}>
                <View
                  style={[
                    styles.gradeBadge,
                    { backgroundColor: `${g.color}15` },
                  ]}
                >
                  <Text style={[styles.gradeText, { color: g.color }]}>
                    {g.grade}
                  </Text>
                </View>

                <Text style={styles.pointText}>{g.point.toFixed(2)} GP</Text>
                <Text style={styles.marksText}>{g.marks}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Confirmation Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close grading policy"
          >
            <Text style={styles.doneBtnText}>Understood</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 390,
    maxHeight: "100%",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: BENTO_COLORS.borderColor,
    ...BENTO_COLORS.shadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 4,
  },
  colHeader: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.mutedText,
    letterSpacing: 0.8,
  },
  list: {
    maxHeight: 340,
  },
  listContent: {
    paddingVertical: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  gradeBadge: {
    width: 40,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  gradeText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
  },
  pointText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
    width: 76,
  },
  marksText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    flex: 1,
    textAlign: "right",
  },
  doneBtn: {
    backgroundColor: BENTO_COLORS.primaryBlue,
    borderRadius: 14,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  doneBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
