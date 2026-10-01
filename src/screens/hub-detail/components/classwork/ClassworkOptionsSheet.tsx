import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AssessmentData } from "./types";
import { getAssessmentTypeConfig } from "./utils";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface ClassworkOptionsSheetProps {
  item: AssessmentData | null;
  isVisible: boolean;
  onClose: () => void;
  onEdit: (item: AssessmentData) => void;
  onDelete: (id: string, title: string) => void;
}

export const ClassworkOptionsSheet: React.FC<ClassworkOptionsSheetProps> = ({
  item,
  isVisible,
  onClose,
  onEdit,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();

  if (!item) return null;

  const typeConfig = getAssessmentTypeConfig(item.type);

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Classwork",
      `Are you sure you want to delete "${item.title}"? All student submissions will also be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onClose();
            onDelete(item.id, item.title);
          },
        },
      ]
    );
  };

  const handleEditPress = () => {
    onClose();
    onEdit(item);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top, 20),
          },
        ]}
      >
        {/* Backdrop tap to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              paddingBottom: Math.max(insets.bottom + 16, 28),
              paddingLeft: Math.max(insets.left + 20, 20),
              paddingRight: Math.max(insets.right + 20, 20),
            },
          ]}
        >
          {/* Sheet Handle */}
          <View style={styles.sheetHandle} />

          {/* Assessment Header Info */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.subtitle}>
              {typeConfig.label} • Max Marks: {item.totalMarks ?? 0}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Action 1: Edit Classwork */}
          <TouchableOpacity
            style={styles.optionItem}
            activeOpacity={0.7}
            onPress={handleEditPress}
          >
            <View style={[styles.optionIconBox, { backgroundColor: "#f1f5f9" }]}>
              <Feather name="edit-2" size={17} color="#0f172a" />
            </View>
            <View style={styles.optionTextBox}>
              <Text style={styles.optionLabel}>Edit Classwork</Text>
              <Text style={styles.optionSublabel}>
                Modify title, deadline, marks or attachments
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#94a3b8" />
          </TouchableOpacity>

          {/* Action 2: Delete Classwork */}
          <TouchableOpacity
            style={[styles.optionItem, styles.optionItemDelete]}
            activeOpacity={0.7}
            onPress={handleDeletePress}
          >
            <View style={[styles.optionIconBox, { backgroundColor: "#fef2f2" }]}>
              <Feather name="trash-2" size={17} color="#ef4444" />
            </View>
            <View style={styles.optionTextBox}>
              <Text style={[styles.optionLabel, { color: "#ef4444" }]}>
                Delete Classwork
              </Text>
              <Text style={styles.optionSublabel}>
                Permanently remove this coursework and records
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#ef4444" />
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(15, 23, 42, 0.06)",
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: "#ffffff",
  },
  optionItemDelete: {
    backgroundColor: "#fffafa",
  },
  optionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionTextBox: {
    flex: 1,
  },
  optionLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  optionSublabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
});
