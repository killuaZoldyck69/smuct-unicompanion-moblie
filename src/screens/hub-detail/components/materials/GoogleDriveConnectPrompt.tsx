import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface GoogleDriveConnectPromptProps {
  isConnected: boolean;
  userEmail?: string;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  hasClientIdConfigured: boolean;
}

export const GoogleDriveConnectPrompt: React.FC<GoogleDriveConnectPromptProps> = React.memo(
  ({
    isConnected,
    userEmail,
    isConnecting,
    onConnect,
    onDisconnect,
    hasClientIdConfigured,
  }) => {
    if (!hasClientIdConfigured) {
      return (
        <View style={styles.configNoticeContainer}>
          <Feather name="info" size={16} color="#d97706" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.configNoticeTitle}>Google Drive Setup</Text>
            <Text style={styles.configNoticeText}>
              Add <Text style={{ fontWeight: "700" }}>EXPO_PUBLIC_GOOGLE_CLIENT_ID</Text> to your .env file to enable 1-tap Google Drive uploads.
            </Text>
          </View>
        </View>
      );
    }

    if (isConnected) {
      return (
        <View style={styles.connectedContainer}>
          <View style={styles.iconCircleConnected}>
            <Feather name="check" size={14} color="#059669" />
          </View>
          <View style={styles.textWrap}>
            <View style={styles.statusRow}>
              <Text style={styles.connectedTitle}>Connected to Google Drive</Text>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>15 GB Free</Text>
              </View>
            </View>
            <Text style={styles.connectedSubText} numberOfLines={1}>
              {userEmail || "Personal Google Account"} • Folder: SMUCT UniCompanion
            </Text>
          </View>
          <TouchableOpacity
            style={styles.disconnectBtn}
            onPress={onDisconnect}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Disconnect Google Drive"
          >
            <Text style={styles.disconnectBtnText}>Switch</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.connectPromptContainer}>
        <View style={styles.promptHeaderRow}>
          <View style={styles.driveIconWrap}>
            <Feather name="hard-drive" size={16} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.promptTitle}>Host on your Google Drive</Text>
            <Text style={styles.promptSubTitle}>
              Store student notes in your personal 15 GB Drive space. Your files will be securely shared with classmates.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.connectButton, isConnecting && { opacity: 0.8 }]}
          onPress={onConnect}
          disabled={isConnecting}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Connect Google Drive"
        >
          {isConnecting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather
                name="link-2"
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.connectButtonText}>Connect Google Drive</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  connectPromptContainer: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: 13,
    marginBottom: 14,
  },
  promptHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  driveIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 2,
  },
  promptSubTitle: {
    fontSize: 11.5,
    color: "#3b82f6",
    lineHeight: 16,
  },
  connectButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },
  connectButtonText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  connectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 10,
  },
  iconCircleConnected: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 1,
  },
  connectedTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#166534",
  },
  freeBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  freeBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#15803d",
  },
  connectedSubText: {
    fontSize: 11,
    color: "#16a34a",
  },
  disconnectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  disconnectBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
  },
  configNoticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fef3c7",
    padding: 10,
    marginBottom: 14,
  },
  configNoticeTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 1,
  },
  configNoticeText: {
    fontSize: 11,
    color: "#b45309",
    lineHeight: 15,
  },
});
