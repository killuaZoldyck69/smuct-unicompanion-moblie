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
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
        {/* Backdrop Press Area to Dismiss */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Dismiss grade selector"
        />

        {/* Bottom Sheet Card */}
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
            },
          ]}
        >
          {/* Top Sheet Drag Handle Indicator */}
          <View style={styles.sheetHandle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Expected Grade</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close grade selector"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Grades List (Expands Naturally Without Giant Blank Gap) */}
          <ScrollView
            style={styles.gradesList}
            contentContainerStyle={styles.gradesListContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
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
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
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
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "82%",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: BENTO_COLORS.borderColor,
    ...BENTO_COLORS.shadow,
  },
  sheetHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
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
    flexGrow: 0,
  },
  gradesListContent: {
    paddingBottom: 6,
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
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
    fontSize: 17,
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
