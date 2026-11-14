import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface MemeOptionsModalProps {
  visible: boolean;
  isAuthor?: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport?: () => void;
}

export const MemeOptionsModal = React.memo(function MemeOptionsModal({
  visible,
  isAuthor = false,
  isAdmin = false,
  onClose,
  onEdit,
  onDelete,
  onReport,
}: MemeOptionsModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Math.max(insets.bottom, 20) + (Platform.OS === "android" ? 12 : 8);

  if (!visible) return null;

  const canDelete = isAuthor || isAdmin;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
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

        <View style={[styles.sheetContainer, { paddingBottom: bottomPadding }]}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Meme Options</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close meme options"
            >
              <Feather
                name="x"
                size={18}
                color={CAMPUS_HUB_COLORS.subtleText}
              />
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
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Edit caption"
              >
                <View style={[styles.iconBox, styles.iconBoxAccent]}>
                  <Feather
                    name="edit-2"
                    size={16}
                    color={CAMPUS_HUB_COLORS.memeAccent}
                  />
                </View>
                <View style={styles.actionTextCol}>
                  <Text style={styles.actionTitle}>Edit Caption</Text>
                  <Text style={styles.actionSubtitle}>
                    Update the caption of your meme
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.slate300}
                />
              </TouchableOpacity>
            )}

            {!isAuthor && onReport && (
              <TouchableOpacity
                style={[styles.actionRow, styles.actionRowReport]}
                onPress={() => {
                  onClose();
                  onReport();
                }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Report Meme"
              >
                <View style={[styles.iconBox, styles.iconBoxReport]}>
                  <Feather
                    name="flag"
                    size={16}
                    color={colors.semantic.amber.deep}
                  />
                </View>
                <View style={styles.actionTextCol}>
                  <Text style={styles.actionTitle}>Report Meme</Text>
                  <Text style={styles.actionSubtitle}>
                    Flag inappropriate or offensive content
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.semantic.amber.border}
                />
              </TouchableOpacity>
            )}

            {canDelete && (
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
                  <Feather
                    name="trash-2"
                    size={16}
                    color={CAMPUS_HUB_COLORS.dangerText}
                  />
                </View>
                <View style={styles.actionTextCol}>
                  <Text style={[styles.actionTitle, styles.actionTitleDanger]}>
                    Delete Meme
                  </Text>
                  <Text style={styles.actionSubtitle}>
                    Permanently remove this meme from feed
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.semantic.red.borderStrong}
                />
              </TouchableOpacity>
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
    backgroundColor: CAMPUS_HUB_COLORS.memeSheetScrim,
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
    backgroundColor: colors.slate300,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
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
    minHeight: 58,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  actionRowReport: {
    backgroundColor: colors.semantic.amber.tint,
    borderColor: colors.semantic.amber.border,
  },
  actionRowDanger: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderColor: CAMPUS_HUB_COLORS.memeDangerActionBorder,
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
  iconBoxReport: {
    backgroundColor: colors.semantic.amber.soft,
  },
  iconBoxDanger: {
    backgroundColor: colors.semantic.red.softBorder,
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
    fontSize: 11.5,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
});
