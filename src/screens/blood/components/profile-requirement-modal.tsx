import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

export interface ProfileRequirementModalProps {
  visible: boolean;
  missingPhone: boolean;
  missingBloodGroup: boolean;
  onCompleteProfile: () => void;
  onClose: () => void;
}

export const ProfileRequirementModal = memo(function ProfileRequirementModal({
  visible,
  missingPhone,
  missingBloodGroup,
  onCompleteProfile,
  onClose,
}: ProfileRequirementModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.card}>
          {/* Top Badge Icon */}
          <View style={styles.iconBox}>
            <Feather name="shield" size={26} color={BENTO_COLORS.crimson} />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Profile Requirements Needed</Text>
          <Text style={styles.subtitle}>
            To protect campus safety and ensure volunteers can coordinate immediately during
            emergencies, you must complete the following items in your profile before posting a
            blood request.
          </Text>

          {/* Checklist */}
          <View style={styles.checklistContainer}>
            {/* Phone Number Requirement */}
            <View
              style={[
                styles.checklistItem,
                missingPhone ? styles.itemMissing : styles.itemComplete,
              ]}
            >
              <View
                style={[
                  styles.itemIconCircle,
                  missingPhone ? styles.iconMissing : styles.iconComplete,
                ]}
              >
                <Feather
                  name={missingPhone ? "alert-circle" : "check"}
                  size={15}
                  color={missingPhone ? BENTO_COLORS.crimson : "#059669"}
                />
              </View>
              <View style={styles.itemTextContainer}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>Phone Number</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      missingPhone
                        ? styles.statusBadgeMissing
                        : styles.statusBadgeComplete,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        missingPhone
                          ? styles.statusBadgeTextMissing
                          : styles.statusBadgeTextComplete,
                      ]}
                    >
                      {missingPhone ? "MISSING" : "PROVIDED"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemDescription}>
                  {missingPhone
                    ? "Add an emergency contact number so donors can reach you."
                    : "Verified contact number already in profile."}
                </Text>
              </View>
            </View>

            {/* Blood Group Requirement */}
            <View
              style={[
                styles.checklistItem,
                missingBloodGroup ? styles.itemMissing : styles.itemComplete,
              ]}
            >
              <View
                style={[
                  styles.itemIconCircle,
                  missingBloodGroup ? styles.iconMissing : styles.iconComplete,
                ]}
              >
                <Feather
                  name={missingBloodGroup ? "alert-circle" : "check"}
                  size={15}
                  color={missingBloodGroup ? BENTO_COLORS.crimson : "#059669"}
                />
              </View>
              <View style={styles.itemTextContainer}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>Blood Group</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      missingBloodGroup
                        ? styles.statusBadgeMissing
                        : styles.statusBadgeComplete,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        missingBloodGroup
                          ? styles.statusBadgeTextMissing
                          : styles.statusBadgeTextComplete,
                      ]}
                    >
                      {missingBloodGroup ? "MISSING" : "PROVIDED"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemDescription}>
                  {missingBloodGroup
                    ? "Select your verified blood group in your campus profile."
                    : "Blood group recorded in campus profile."}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onCompleteProfile}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Complete profile now"
            >
              <Feather
                name="user"
                size={16}
                color="#ffffff"
                style={{ marginRight: 7 }}
              />
              <Text style={styles.primaryBtnText}>Complete Profile</Text>
              <Feather
                name="arrow-right"
                size={15}
                color="#ffffff"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onClose}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Dismiss modal"
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
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
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: BENTO_COLORS.roseBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.12)",
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  checklistContainer: {
    width: "100%",
    gap: 10,
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  itemMissing: {
    backgroundColor: "#fff5f5",
    borderColor: "rgba(225, 29, 72, 0.18)",
  },
  itemComplete: {
    backgroundColor: "#f0fdf4",
    borderColor: "rgba(34, 197, 94, 0.18)",
  },
  itemIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  iconMissing: {
    backgroundColor: BENTO_COLORS.roseBg,
  },
  iconComplete: {
    backgroundColor: "#dcfce7",
  },
  itemTextContainer: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  itemTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeMissing: {
    backgroundColor: "rgba(190, 18, 60, 0.1)",
  },
  statusBadgeComplete: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
  },
  statusBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  statusBadgeTextMissing: {
    color: BENTO_COLORS.crimson,
  },
  statusBadgeTextComplete: {
    color: "#059669",
  },
  itemDescription: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    lineHeight: 16,
  },
  actionsContainer: {
    width: "100%",
    gap: 8,
  },
  primaryBtn: {
    flexDirection: "row",
    width: "100%",
    height: 46,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.crimson,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
  primaryBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryBtn: {
    width: "100%",
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  secondaryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
});
