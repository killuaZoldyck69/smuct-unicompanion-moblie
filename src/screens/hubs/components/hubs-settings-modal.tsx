import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const BENTO = {
  card: "#ffffff",
  navy: "#131b2e",
  slate: "#475569",
  slateMuted: "#64748b",
  border: "rgba(19, 27, 46, 0.08)",
  borderSubtle: "rgba(19, 27, 46, 0.05)",
  neutralSoft: "#f1f5f9",
  pillRadius: 9999,
  cardRadius: 20,

  // Soft Accents
  blueSoft: "#eff6ff",
  blueIcon: "#2563eb",
  mintSoft: "#f0fdf4",
  mintIcon: "#16a34a",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

interface HubsSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
  canCreateHub: boolean;
  onJoinHub: () => void;
  onCreateHub: () => void;
}

export const HubsSettingsModal = React.memo(function HubsSettingsModal({
  isVisible,
  onClose,
  canCreateHub,
  onJoinHub,
  onCreateHub,
}: HubsSettingsModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
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
            paddingTop: Math.max(insets.top + 20, 28),
            paddingBottom: Math.max(insets.bottom + 20, 28),
          },
        ]}
        accessibilityViewIsModal={true}
      >
        {/* Backdrop tap to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeftGroup}>
              <View style={styles.pillTag}>
                <Text style={styles.pillTagText}>COURSE HUBS</Text>
              </View>
              <Text style={styles.headerTitle}>Hub Options</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close Options"
            >
              <Feather name="x" size={16} color={BENTO.slateMuted} />
            </TouchableOpacity>
          </View>

          {/* Action Tiles */}
          <View style={styles.bentoStack}>
            {/* 1. Join Hub */}
            <TouchableOpacity
              style={styles.bentoTile}
              onPress={() => {
                onClose();
                onJoinHub();
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join a Course Hub"
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: BENTO.blueSoft },
                ]}
              >
                <Feather name="plus" size={18} color={BENTO.blueIcon} />
              </View>
              <View style={styles.tileTextCol}>
                <Text style={styles.tileTitle}>Join a Course Hub</Text>
                <Text style={styles.tileSubtitle}>
                  Enroll with a 6-character class code
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={BENTO.slateMuted}
              />
            </TouchableOpacity>

            {/* 2. Create Hub (if allowed) */}
            {canCreateHub && (
              <TouchableOpacity
                style={styles.bentoTile}
                onPress={() => {
                  onClose();
                  onCreateHub();
                }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Create New Hub"
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: BENTO.mintSoft },
                  ]}
                >
                  <Feather
                    name="edit-3"
                    size={17}
                    color={BENTO.mintIcon}
                  />
                </View>
                <View style={styles.tileTextCol}>
                  <Text style={styles.tileTitle}>Create New Hub</Text>
                  <Text style={styles.tileSubtitle}>
                    Set up a new course, cohort & routine
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={BENTO.slateMuted}
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
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: BENTO.card,
    borderRadius: BENTO.cardRadius,
    padding: 18,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.borderSubtle,
  },
  headerLeftGroup: {
    flex: 1,
  },
  pillTag: {
    alignSelf: "flex-start",
    backgroundColor: BENTO.neutralSoft,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BENTO.pillRadius,
    marginBottom: 3,
  },
  pillTagText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: BENTO.slateMuted,
    letterSpacing: 0.7,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bentoStack: {
    gap: 10,
  },
  bentoTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tileTextCol: {
    flex: 1,
  },
  tileTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    letterSpacing: -0.1,
  },
  tileSubtitle: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO.slateMuted,
    marginTop: 1,
    lineHeight: 15,
  },
});
