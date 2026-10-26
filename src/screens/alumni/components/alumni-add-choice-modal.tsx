import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";

export interface AlumniAddChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCsv: () => void;
  onSelectManualForm: () => void;
}

export const AlumniAddChoiceModal: React.FC<AlumniAddChoiceModalProps> =
  React.memo(({ visible, onClose, onSelectCsv, onSelectManualForm }) => {
    const insets = useSafeAreaInsets();

    const bottomPadding =
      Math.max(insets.bottom, 16) + (Platform.OS === "android" ? 14 : 8);

    return (
      <Modal
        visible={visible}
        transparent={true}
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.backdrop}>
          {/* Backdrop tap to dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close add options modal"
          />

          {/* Bottom Sheet Container */}
          <View
            style={[styles.sheetContainer, { paddingBottom: bottomPadding }]}
          >
            {/* Grab Handle */}
            <View style={styles.dragHandle} />

            {/* Modal Header */}
            <View style={styles.header}>
              <View style={styles.headerTextCol}>
                <Text style={styles.title}>Add to Alumni Network</Text>
                <Text style={styles.subtitle}>
                  Select how you want to add alumni records
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Feather name="x" size={20} color={BENTO.navy} />
              </TouchableOpacity>
            </View>

            {/* Option Cards */}
            <View style={styles.optionsWrap}>
              {/* Option 1: CSV Upload (Single or Multiple) */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onClose();
                  onSelectCsv();
                }}
                activeOpacity={0.78}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Upload CSV file. Supports single or multiple alumni data upload at once."
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: "#ecfdf5",
                      borderColor: "#a7f3d0",
                    },
                  ]}
                >
                  <Feather name="upload-cloud" size={22} color="#059669" />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>CSV Upload</Text>
                    <View style={styles.badgeCsv}>
                      <Text style={styles.badgeCsvText}>
                        SINGLE OR MULTIPLE
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardDesc}>
                    Import single or multiple alumni records at once via CSV
                    with live preview & validation.
                  </Text>
                </View>

                <Feather name="chevron-right" size={18} color="#94a3b8" />
              </TouchableOpacity>

              {/* Option 2: Add Single Alumnus with Form */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => {
                  onClose();
                  onSelectManualForm();
                }}
                activeOpacity={0.78}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add a single new alumnus with manual form."
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: "#eff6ff",
                      borderColor: "#bfdbfe",
                    },
                  ]}
                >
                  <Feather name="user-plus" size={22} color="#2563eb" />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>Single Alumnus</Text>
                    <View style={styles.badgeForm}>
                      <Text style={styles.badgeFormText}>MANUAL ENTRY</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDesc}>
                    Add a single new alumnus by filling in contact, academic,
                    and employment details.
                  </Text>
                </View>

                <Feather name="chevron-right" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  });

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO.navy,
  },
  badgeCsv: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeCsvText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#065f46",
    letterSpacing: 0.3,
  },
  badgeForm: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeFormText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: "#1e40af",
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    lineHeight: 17,
  },
});
