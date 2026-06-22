import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { rounded, spacing } from "../../../theme/layout";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  canManage: boolean;
  onEditHub: () => void;
  onArchiveHub: () => void;
  onDeleteHub: () => void;
  onLeaveHub: () => void;
  onViewMembers: () => void;
}

export default function HubOptionsModal({
  isVisible,
  onClose,
  canManage,
  onEditHub,
  onArchiveHub,
  onDeleteHub,
  onLeaveHub,
  onViewMembers,
}: Props) {
  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Hub Options</Text>

          <TouchableOpacity style={styles.optionBtn} onPress={onViewMembers}>
            <Feather
              name="users"
              size={20}
              color={colors.onSurface}
              style={styles.icon}
            />
            <Text style={styles.optionText}>See All Members</Text>
          </TouchableOpacity>

          {canManage && (
            <>
              <TouchableOpacity style={styles.optionBtn} onPress={onEditHub}>
                <Feather
                  name="edit"
                  size={20}
                  color={colors.onSurface}
                  style={styles.icon}
                />
                <Text style={styles.optionText}>Update Course Hub Info</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionBtn} onPress={onArchiveHub}>
                <Feather
                  name="archive"
                  size={20}
                  color={colors.onSurface}
                  style={styles.icon}
                />
                <Text style={styles.optionText}>Archive Course Hub</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionBtn} onPress={onDeleteHub}>
                <Feather
                  name="trash-2"
                  size={20}
                  color={colors.error}
                  style={styles.icon}
                />
                <Text style={[styles.optionText, { color: colors.error }]}>
                  Delete Course Hub
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.optionBtn} onPress={onLeaveHub}>
            <Feather
              name="log-out"
              size={20}
              color={colors.error}
              style={styles.icon}
            />
            <Text style={[styles.optionText, { color: colors.error }]}>
              Leave Hub
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: spacing.marginMobile,
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.xl,
  },
  modalTitle: {
    ...typography.titleLg,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.stackLg,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  icon: { marginRight: 16 },
  optionText: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "600",
  },
});
