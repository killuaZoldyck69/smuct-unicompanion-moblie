import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

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

        {/* Phone Item */}
        <View style={styles.detailContactItemBox}>
          <View style={styles.detailContactItemLeft}>
            <View style={styles.detailContactItemIconBox}>
              <Feather name="phone" size={15} color="#64748B" />
            </View>
            <Text style={styles.detailContactItemLabel}>Phone</Text>
          </View>
          <Text style={styles.detailContactItemValue} numberOfLines={1}>
            {user.phoneNumber || "Not provided"}
          </Text>
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
        {Boolean(linkedInUrl) && (
          <View style={styles.detailLinkCardBox}>
            <View style={styles.detailLinkCardHeader}>
              <View style={styles.detailContactItemLeft}>
                <View style={styles.detailContactItemIconBox}>
                  <Feather name="linkedin" size={15} color="#0A66C2" />
                </View>
                <Text style={styles.detailContactItemLabel}>LinkedIn</Text>
              </View>
              <TouchableOpacity
                style={styles.detailRedirectBtn}
                onPress={() => handleOpenUrl(linkedInUrl)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Open LinkedIn link"
              >
                <Text style={styles.detailRedirectBtnText}>Open</Text>
                <Feather
                  name="external-link"
                  size={12}
                  color="#0284C7"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleOpenUrl(linkedInUrl)}
              style={styles.detailLinkUrlContainer}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`LinkedIn URL: ${linkedInUrl}`}
            >
              <Text style={styles.detailLinkFullText} selectable={true}>
                {linkedInUrl}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Personal Website (if provided) */}
        {Boolean(websiteUrl) && (
          <View style={styles.detailLinkCardBox}>
            <View style={styles.detailLinkCardHeader}>
              <View style={styles.detailContactItemLeft}>
                <View style={styles.detailContactItemIconBox}>
                  <Feather name="globe" size={15} color="#0284C7" />
                </View>
                <Text style={styles.detailContactItemLabel}>Website</Text>
              </View>
              <TouchableOpacity
                style={styles.detailRedirectBtn}
                onPress={() => handleOpenUrl(websiteUrl)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Open Website link"
              >
                <Text style={styles.detailRedirectBtnText}>Open</Text>
                <Feather
                  name="external-link"
                  size={12}
                  color="#0284C7"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleOpenUrl(websiteUrl)}
              style={styles.detailLinkUrlContainer}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Website URL: ${websiteUrl}`}
            >
              <Text style={styles.detailLinkFullText} selectable={true}>
                {websiteUrl}
              </Text>
            </TouchableOpacity>
          </View>
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
  detailLinkCardBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailLinkCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailRedirectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  detailRedirectBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0284C7",
  },
  detailLinkUrlContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailLinkFullText: {
    fontSize: 13,
    color: "#0284C7",
    fontWeight: "500",
    lineHeight: 18,
  },
});
