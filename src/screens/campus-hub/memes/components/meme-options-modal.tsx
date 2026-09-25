import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface MemeOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const MemeOptionsModal = React.memo(function MemeOptionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
}: MemeOptionsModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 20) + (Platform.OS === "android" ? 12 : 8);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={[styles.sheetContainer, { paddingBottom: bottomPadding }]}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Meme Options</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close meme options"
            >
              <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.subtleText} />
            </TouchableOpacity>
          </View>

          {/* Action List */}
          <View style={styles.actionGroup}>
            {/* Edit Option */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                onClose();
                onEdit();
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit Meme"
            >
              <View style={[styles.iconBox, styles.iconBoxAccent]}>
                <Feather name="edit-2" size={16} color={CAMPUS_HUB_COLORS.memeAccent} />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>Edit Caption</Text>
                <Text style={styles.actionSubtitle}>Update the caption of your meme</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#cbd5e1" />
            </TouchableOpacity>

            {/* Delete Option */}
            <TouchableOpacity
              style={[styles.actionRow, styles.actionRowDanger]}
              onPress={() => {
                onClose();
                onDelete();
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete Meme"
            >
              <View style={[styles.iconBox, styles.iconBoxDanger]}>
                <Feather name="trash-2" size={16} color={CAMPUS_HUB_COLORS.dangerText} />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={[styles.actionTitle, styles.actionTitleDanger]}>Delete Meme</Text>
                <Text style={styles.actionSubtitle}>Permanently remove this meme from feed</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#fca5a5" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 6,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  actionGroup: {
    marginTop: 12,
    gap: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  actionRowDanger: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderColor: "rgba(190, 18, 60, 0.12)",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxAccent: {
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
  },
  iconBoxDanger: {
    backgroundColor: "#fee2e2",
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  actionTitleDanger: {
    color: CAMPUS_HUB_COLORS.dangerText,
  },
  actionSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
});
