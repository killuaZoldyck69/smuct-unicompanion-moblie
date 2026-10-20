import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

import { AdminUser } from "../../types";
import { formatBloodGroup, handleOpenUrl } from "../../utils";

interface ContactPersonalCardProps {
  user: AdminUser;
}

export const ContactPersonalCard = React.memo(
  ({ user }: ContactPersonalCardProps) => {
    const isStudent = user.role === "STUDENT";
    const linkedInUrl = isStudent
      ? user.studentProfile?.linkedInUrl
      : user.teacherProfile?.linkedInUrl;

    const websiteUrl = isStudent
      ? user.studentProfile?.personalWebsiteUrl
      : user.teacherProfile?.personalWebsiteUrl;

    const phoneNumber = user.phoneNumber?.trim() || null;

    const handleCall = useCallback(() => {
      if (!phoneNumber) return;
      const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");
      Linking.openURL(`tel:${cleanNumber}`).catch(() => {
        Toast.show({
          type: "error",
          text1: "Cannot place call",
          text2: "Unable to dial phone number on this device.",
        });
      });
    }, [phoneNumber]);

    const handleCopy = useCallback(async () => {
      if (!phoneNumber) return;
      await Clipboard.setStringAsync(phoneNumber);
      Toast.show({
        type: "success",
        text1: "Phone number copied",
        text2: phoneNumber,
      });
    }, [phoneNumber]);

    const linkedInTarget = linkedInUrl?.trim() || "";
    const websiteTarget = websiteUrl?.trim() || "";

    return (
      <View style={styles.detailSectionCard}>
        <View style={styles.detailSectionHeader}>
          <View style={styles.detailSectionHeaderLeft}>
            <View style={styles.detailSectionIconBoxBlue}>
              <Ionicons name="person" size={13} color="#0284C7" />
            </View>
            <Text style={styles.detailSectionTitle}>CONTACT & PERSONAL</Text>
          </View>
        </View>

        {/* Phone Item with Copy & Call options */}
        <View style={styles.phoneCardBox}>
          <View style={styles.phoneLeft}>
            <View style={styles.phoneIconBox}>
              <Feather name="phone" size={14} color="#16A34A" />
            </View>
            <View style={styles.phoneTextContainer}>
              <Text style={styles.phoneLabel}>PHONE NUMBER</Text>
              <Text
                style={[
                  styles.phoneValue,
                  !phoneNumber && styles.phoneValuePlaceholder,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {phoneNumber || "Not provided"}
              </Text>
            </View>
          </View>

          {Boolean(phoneNumber) && (
            <View style={styles.phoneActionsRow}>
              <TouchableOpacity
                style={styles.phoneActionBtnCopy}
                onPress={handleCopy}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Copy phone number"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="copy" size={12} color="#15803D" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.phoneActionBtnCall}
                onPress={handleCall}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Call phone number"
              >
                <Feather name="phone-call" size={11} color="#FFFFFF" />
                <Text style={styles.phoneActionBtnCallText}>Call</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Blood Group (if provided) */}
        {user.bloodGroup && (
          <View style={styles.detailContactItemBox}>
            <View style={styles.detailContactItemLeft}>
              <View style={styles.detailContactItemIconBox}>
                <Feather name="droplet" size={15} color="#E11D48" />
              </View>
              <Text style={styles.detailContactItemLabel}>Blood Group</Text>
            </View>
            <Text style={styles.detailContactItemValue} numberOfLines={1}>
              {formatBloodGroup(user.bloodGroup)}
            </Text>
          </View>
        )}

        {/* LinkedIn (if provided) */}
        {Boolean(linkedInTarget) && (
          <TouchableOpacity
            style={styles.linkCard}
            activeOpacity={0.8}
            onPress={() => handleOpenUrl(linkedInTarget)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open LinkedIn Profile"
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIconCircleLinkedIn}>
                <Feather name="linkedin" size={15} color="#0A66C2" />
              </View>
              <Text style={styles.linkLabel}>LinkedIn Profile</Text>
            </View>
            <Feather name="external-link" size={15} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Personal Website (if provided) */}
        {Boolean(websiteTarget) && (
          <TouchableOpacity
            style={styles.linkCard}
            activeOpacity={0.8}
            onPress={() => handleOpenUrl(websiteTarget)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Open Personal Website"
          >
            <View style={styles.linkLeft}>
              <View style={styles.linkIconCirclePortfolio}>
                <Feather name="globe" size={15} color="#0D9488" />
              </View>
              <Text style={styles.linkLabel}>
                {isStudent ? "Personal Website" : "Academic Portfolio"}
              </Text>
            </View>
            <Feather name="external-link" size={15} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  detailSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  detailSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  detailSectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailSectionIconBoxBlue: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    letterSpacing: 0.8,
  },
  phoneCardBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  phoneLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  phoneIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  phoneTextContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  phoneLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  phoneValue: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 1,
  },
  phoneValuePlaceholder: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#94A3B8",
  },
  phoneActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  phoneActionBtnCopy: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  phoneActionBtnCall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 3.5,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.18,
    shadowRadius: 2.5,
    elevation: 2,
  },
  phoneActionBtnCallText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  detailContactItemBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailContactItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    marginRight: 10,
  },
  detailContactItemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailContactItemLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  detailContactItemValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    textAlign: "right",
  },
  linkCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIconCircleLinkedIn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  linkIconCirclePortfolio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  linkLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
});
