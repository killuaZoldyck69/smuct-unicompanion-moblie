import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { FacultyDirectoryView } from "./FacultyDirectoryView";
import { THEME } from "./constants";

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
        <View style={styles.container}>
          <FacultyDirectoryView
            onClose={onClose}
            isModal={true}
            initialDepartment={initialDepartment}
          />
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
});
