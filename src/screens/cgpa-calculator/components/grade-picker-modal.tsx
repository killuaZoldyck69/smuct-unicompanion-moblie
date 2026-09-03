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

interface GradePickerModalProps {
  visible: boolean;
  onSelectGrade: (grade: string) => void;
  onClose: () => void;
}

export const GradePickerModal = React.memo(function GradePickerModal({
  visible,
  onSelectGrade,
  onClose,
}: GradePickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Expected Grade</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close grade selector"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.gradesList} showsVerticalScrollIndicator={false}>
            {GRADE_SCALE.map((item) => (
              <TouchableOpacity
                key={item.grade}
                style={styles.gradeRow}
                onPress={() => {
                  onSelectGrade(item.grade);
                  onClose();
                }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Grade ${item.grade}, ${item.point.toFixed(2)} grade points, ${item.marks}`}
              >
                <View style={[styles.badge, { backgroundColor: item.color + "15" }]}>
                  <Text style={[styles.badgeText, { color: item.color }]}>
                    {item.grade}
                  </Text>
                </View>

                <View style={styles.details}>
                  <Text style={styles.pointsText}>
                    Grade Point: {item.point.toFixed(2)}
                  </Text>
                  <Text style={styles.marksText}>{item.marks}</Text>
                </View>

                <Feather
                  name="check"
                  size={16}
                  color={item.color}
                  style={{ opacity: 0.8 }}
                />
              </TouchableOpacity>
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
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "75%",
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  gradesList: {
    maxHeight: 400,
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: "#f8fafc",
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  badgeText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
  },
  details: {
    flex: 1,
  },
  pointsText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  marksText: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
});
