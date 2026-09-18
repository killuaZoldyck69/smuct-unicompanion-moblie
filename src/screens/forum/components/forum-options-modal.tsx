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
import { BENTO_COLORS, fontFamily } from "../constants";

interface ForumOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  isAuthor: boolean;
  isResolved: boolean;
  canManage: boolean;
  onEdit: () => void;
  onResolve: () => void;
  onDelete: () => void;
}

export const ForumOptionsModal = memo(function ForumOptionsModal({
  visible,
  onClose,
  isAuthor,
  isResolved,
  canManage,
  onEdit,
  onResolve,
  onDelete,
}: ForumOptionsModalProps) {
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
            <Text style={styles.headerTitle}>Discussion Options</Text>
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
            {isAuthor && (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => {
                  onClose();
                  onEdit();
                }}
                activeOpacity={0.65}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Edit Question"
              >
                <View style={[styles.iconBox, styles.iconBoxNavy]}>
                  <Feather
                    name="edit-2"
                    size={16}
                    color={BENTO_COLORS.primaryBlue}
                  />
                </View>
                <Text style={styles.actionText}>Edit Question</Text>
                <Feather name="chevron-right" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            )}

            {!isResolved && canManage && (
              <>
                {isAuthor && <View style={styles.rowDivider} />}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => {
                    onClose();
                    onResolve();
                  }}
                  activeOpacity={0.65}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Mark as Resolved"
                >
                  <View style={[styles.iconBox, styles.iconBoxEmerald]}>
                    <Feather
                      name="check-circle"
                      size={16}
                      color={BENTO_COLORS.emerald}
                    />
                  </View>
                  <Text style={styles.actionText}>Mark as Resolved</Text>
                  <Feather name="chevron-right" size={16} color="#cbd5e1" />
                </TouchableOpacity>
              </>
            )}

            {canManage && (
              <>
                {(isAuthor || !isResolved) && <View style={styles.rowDivider} />}
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => {
                    onClose();
                    onDelete();
                  }}
                  activeOpacity={0.65}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete Discussion"
                >
                  <View style={[styles.iconBox, styles.iconBoxDanger]}>
                    <Feather
                      name="trash-2"
                      size={16}
                      color={BENTO_COLORS.danger}
                    />
                  </View>
                  <Text style={[styles.actionText, styles.actionTextDanger]}>
                    Delete Discussion
                  </Text>
                  <Feather name="chevron-right" size={16} color="#fca5a5" />
                </TouchableOpacity>
              </>
            )}
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
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 20,
    paddingTop: 8,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 10,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
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
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#f8fafc",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BENTO_COLORS.subtleBorder,
    marginLeft: 50,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconBoxNavy: {
    backgroundColor: "rgba(30, 58, 138, 0.08)",
  },
  iconBoxEmerald: {
    backgroundColor: BENTO_COLORS.emeraldBg,
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
