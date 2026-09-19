import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import type { LostFoundAuthor } from "@/services/lost-found-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface HandoverCardProps {
  counterpart: LostFoundAuthor;
  role: "AUTHOR" | "CLAIMANT";
  onViewProfile?: () => void;
}

export const HandoverCard = React.memo(function HandoverCard({
  counterpart,
  role,
  onViewProfile,
}: HandoverCardProps) {
  const isAuthor = role === "AUTHOR";

  const counterpartRoleLabel = isAuthor ? "Verified Owner" : "Finder / Post Author";
  const studentInfo = counterpart?.studentProfile
    ? `${counterpart.studentProfile.department || ""} • ID: ${
        counterpart.studentProfile.studentId || ""
      }`
    : counterpart?.teacherProfile
    ? `${counterpart.teacherProfile.designation || ""} • ${
        counterpart.teacherProfile.department || ""
      }`
    : "SMUCT Community Member";

  const handleEmail = () => {
    if (!counterpart.email) return;
    Linking.openURL(`mailto:${counterpart.email}`).catch(() =>
      Toast.show({ type: "error", text1: "Could not open mail app." })
    );
  };

  const handleCall = () => {
    if (!counterpart.phoneNumber) return;
    Linking.openURL(`tel:${counterpart.phoneNumber}`).catch(() =>
      Toast.show({ type: "error", text1: "Could not initiate call." })
    );
  };

  return (
    <View style={styles.card}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Feather name="shield" size={18} color="#047857" />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Item Handover Ready</Text>
          <Text style={styles.headerSubtitle}>
            {isAuthor
              ? "You accepted this claim. Reach out to coordinate handover on campus."
              : "Your claim was accepted! Contact the finder to collect your item."}
          </Text>
        </View>
      </View>

      {/* Counterpart Contact Card */}
      <View style={styles.contactBox}>
        <View style={styles.personRow}>
          <TouchableOpacity
            style={styles.personLeft}
            onPress={onViewProfile}
            activeOpacity={0.8}
          >
            {counterpart?.image ? (
              <Image source={{ uri: counterpart.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {counterpart?.name ? counterpart.name.charAt(0).toUpperCase() : "?"}
                </Text>
              </View>
            )}
            <View style={styles.nameCol}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{counterpartRoleLabel}</Text>
              </View>
              <Text style={styles.personName} numberOfLines={1}>
                {counterpart.name}
              </Text>
              <Text style={styles.personSub} numberOfLines={1}>
                {studentInfo}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact Actions */}
        <View style={styles.contactActions}>
          {!!counterpart.email && (
            <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
              <Feather name="mail" size={14} color="#0284c7" />
              <Text style={styles.contactBtnText} numberOfLines={1}>
                {counterpart.email}
              </Text>
            </TouchableOpacity>
          )}

          {!!counterpart.phoneNumber && (
            <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
              <Feather name="phone" size={14} color="#10b981" />
              <Text style={styles.contactBtnText} numberOfLines={1}>
                {counterpart.phoneNumber}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Safety Protocol Reminder */}
      <View style={styles.safetyBox}>
        <View style={styles.safetyHeader}>
          <Feather name="alert-triangle" size={13} color="#b45309" />
          <Text style={styles.safetyTitle}>SAFE CAMPUS HANDOVER TIPS</Text>
        </View>
        <Text style={styles.safetyItem}>
          • Meet in open campus areas (e.g. SMUCT Central Library or Dept Office).
        </Text>
        <Text style={styles.safetyItem}>
          • Inspect the item in person before completing the exchange.
        </Text>
        <Text style={styles.safetyItem}>
          • Never share banking credentials, cards, or verification OTPs.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f0fdf4",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    ...CAMPUS_HUB_COLORS.shadow,
    gap: 14,
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#065f46",
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#047857",
    marginTop: 2,
    lineHeight: 17,
  },
  contactBox: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    gap: 12,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  personLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  nameCol: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.4,
  },
  personName: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  personSub: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  contactActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    maxWidth: "100%",
  },
  contactBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  safetyBox: {
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    gap: 4,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  safetyTitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#b45309",
    letterSpacing: 0.5,
  },
  safetyItem: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#92400e",
    lineHeight: 16,
  },
});
