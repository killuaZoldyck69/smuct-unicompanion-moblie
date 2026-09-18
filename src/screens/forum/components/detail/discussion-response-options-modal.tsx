import React, { memo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../../constants";

interface DiscussionResponseOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const DiscussionResponseOptionsModal = memo(
  function DiscussionResponseOptionsModal({
    visible,
    onClose,
    canEdit,
    canDelete,
    onEdit,
    onDelete,
  }: DiscussionResponseOptionsModalProps) {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 20) + 12;

    return (
      <Modal
        visible={visible}
        transparent={true}
        statusBarTranslucent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
            accessible={false}
          />

          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: bottomPadding },
            ]}
          >
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Response Options</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={18} color={BENTO_COLORS.subtleText} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionGroup}>
              {canEdit && (
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => {
                    onClose();
                    onEdit();
                  }}
                  activeOpacity={0.65}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Edit Response"
                >
                  <View style={[styles.iconBox, styles.iconBoxNavy]}>
                    <Feather
                      name="edit-2"
                      size={16}
                      color={BENTO_COLORS.primaryBlue}
                    />
                  </View>
                  <Text style={styles.actionText}>Edit Response</Text>
                  <Feather name="chevron-right" size={16} color="#cbd5e1" />
                </TouchableOpacity>
              )}

              {canDelete && (
                <TouchableOpacity
                  style={[styles.actionRow, styles.actionRowDanger]}
                  onPress={() => {
                    onClose();
                    onDelete();
                  }}
                  activeOpacity={0.65}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete Response"
                >
                  <View style={[styles.iconBox, styles.iconBoxDanger]}>
                    <Feather
                      name="trash-2"
                      size={16}
                      color={BENTO_COLORS.danger}
                    />
                  </View>
                  <Text style={[styles.actionText, styles.actionTextDanger]}>
                    Delete Response
                  </Text>
                  <Feather name="chevron-right" size={16} color="#fca5a5" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 6,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.slateBg,
    justifyContent: "center",
    alignItems: "center",
  },
  actionGroup: {
    paddingTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  actionRowDanger: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconBoxNavy: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  iconBoxDanger: {
    backgroundColor: BENTO_COLORS.dangerBg,
  },
  actionText: {
    flex: 1,
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  actionTextDanger: {
    color: BENTO_COLORS.danger,
  },
});
