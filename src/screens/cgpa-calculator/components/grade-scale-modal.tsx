import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SMUCT Grading Policy</Text>
              <Text style={styles.subtitle}>UGC standard 4.00 grading scale</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close grading scale modal"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {GRADE_SCALE.map((g) => (
              <View key={g.grade} style={styles.row}>
                <Text style={[styles.gradeText, { color: g.color }]}>
                  {g.grade}
                </Text>
                <Text style={styles.pointText}>{g.point.toFixed(2)} GP</Text>
                <Text style={styles.marksText}>{g.marks}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    ...BENTO_COLORS.shadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
  list: {
    maxHeight: 380,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  gradeText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    width: 40,
  },
  pointText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    width: 70,
  },
  marksText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    flex: 1,
    textAlign: "right",
  },
});
