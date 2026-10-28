import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HubConfirmView, {
  HubConfirmAction,
  HubConfirmViewProps,
} from "./hub-confirm-view";

export type { HubConfirmAction };

export interface HubConfirmModalProps {
  isVisible: boolean;
  action: HubConfirmAction;
  hubDetails?: any;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function HubConfirmModal({
  isVisible,
  action,
  hubDetails,
  isPending = false,
  onClose,
  onConfirm,
}: HubConfirmModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={isPending ? undefined : onClose}
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
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 16, 24),
            paddingLeft: Math.max(insets.left + 16, 16),
            paddingRight: Math.max(insets.right + 16, 16),
          },
        ]}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isPending ? undefined : onClose}
          accessible={false}
        />
        <View style={styles.modalContent}>
          <HubConfirmView
            action={action}
            hubDetails={hubDetails}
            isPending={isPending}
            onCancel={onClose}
            onConfirm={onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    maxWidth: 360,
    width: "100%",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 10,
    overflow: "hidden",
  },
});

