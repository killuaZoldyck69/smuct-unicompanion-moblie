import React from "react";
import { Modal, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FacultyDirectoryView } from "./FacultyDirectoryView";
import { DIRECTORY_COLORS } from "./constants";

export interface FacultyDirectoryModalProps {
  visible: boolean;
  onClose: () => void;
  initialDepartment?: string | null;
}

export const FacultyDirectoryModal: React.FC<FacultyDirectoryModalProps> = React.memo(
  ({ visible, onClose, initialDepartment }) => {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
          <FacultyDirectoryView
            onClose={onClose}
            isModal={true}
            initialDepartment={initialDepartment}
          />
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DIRECTORY_COLORS.background,
  },
});
