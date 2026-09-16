import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageStyle,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../constants";
import { AlumniItem } from "../types";
import { getDeptTheme, getAvatarTheme, getInitials, openSafeLink } from "../utils";

interface AlumniCardProps {
  item: AlumniItem;
  onSelect: (item: AlumniItem) => void;
}

export const AlumniCard: React.FC<AlumniCardProps> = React.memo(
  ({ item, onSelect }) => {
    const [imageError, setImageError] = useState(false);

    const role =
      item.currentPosition || item.designation || item.currentRole || "Alumni";
    const company = item.currentCompany;
    const year = item.graduationYear || item.passingYear;
    const batch = item.batch || item.graduationBatch;
    const deptTheme = getDeptTheme(item.department);
    const avatarTheme = getAvatarTheme(item.name, item.department);
    const imageUrl = item.image || item.imageUrl;
    const linkedIn = item.linkedInUrl || item.linkedinUrl;
    const hasImage = Boolean(imageUrl) && !imageError;

    const handleSelect = useCallback(() => {
      onSelect(item);
    }, [item, onSelect]);

    const handleLinkedIn = useCallback(() => {
      openSafeLink(linkedIn);
    }, [linkedIn]);

    const handleEmail = useCallback(() => {
      openSafeLink(`mailto:${item.email}`);
    }, [item.email]);

    return (
      <View style={styles.card}>
        {/* Main Pressable Area */}
        <TouchableOpacity
          style={styles.mainTouch}
          activeOpacity={0.7}
          onPress={handleSelect}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Alumni: ${item.name}, ${role}${company ? " at " + company : ""}`}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {hasImage ? (
              <Image
                source={{ uri: imageUrl! }}
                style={styles.avatarImg as ImageStyle}
                onError={() => setImageError(true)}
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  {
                    backgroundColor: avatarTheme.bg,
                    borderColor: avatarTheme.border,
                  },
                ]}
              >
                <Text style={[styles.avatarInitial, { color: avatarTheme.text }]}>
                  {getInitials(item.name)}
                </Text>
              </View>
            )}
          </View>

          {/* Info Details */}
          <View style={styles.infoCol}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <View
                style={[
                  styles.deptBadge,
                  { backgroundColor: deptTheme.bg, borderColor: deptTheme.border },
                ]}
              >
                <Text style={[styles.deptBadgeText, { color: deptTheme.text }]}>
                  {deptTheme.badge}
                </Text>
              </View>
            </View>

            {/* Role & Company */}
            <View style={styles.roleRow}>
              <Feather
                name="briefcase"
                size={12}
                color={company ? BENTO.indigo : BENTO.slate}
                style={styles.roleIcon}
              />
              <Text style={styles.roleText} numberOfLines={2}>
                <Text style={styles.roleTitle}>{role}</Text>
                {company ? (
                  <Text style={styles.roleCompany}> at {company}</Text>
                ) : null}
              </Text>
            </View>

            {/* Batch & Graduation */}
            <View style={styles.academicRow}>
              <Feather
                name="award"
                size={12}
                color={BENTO.slateLight}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.academicText} numberOfLines={1}>
                {batch ? `${batch}` : "Graduate"}
                {year ? ` • Class of ${year}` : ""}
              </Text>
            </View>

            {/* Skills */}
            {item.skills && item.skills.length > 0 ? (
              <View style={styles.skillsRow}>
                {item.skills.slice(0, 3).map((skill, index) => (
                  <View key={index} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {item.skills.length > 3 ? (
                  <View style={styles.morePill}>
                    <Text style={styles.moreText}>
                      +{item.skills.length - 3}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Action Controls (Sibling Elements) */}
        <View style={styles.actionCol}>
          {linkedIn ? (
            <TouchableOpacity
              style={styles.linkedInBtn}
              onPress={handleLinkedIn}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}'s LinkedIn profile`}
            >
              <Feather name="linkedin" size={15} color="#0a66c2" />
            </TouchableOpacity>
          ) : item.email ? (
            <TouchableOpacity
              style={styles.emailBtn}
              onPress={handleEmail}
              activeOpacity={0.75}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Email ${item.name}`}
            >
              <Feather name="mail" size={14} color={BENTO.slate} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.chevronBtn}
            onPress={handleSelect}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`View full profile of ${item.name}`}
          >
            <Feather name="chevron-right" size={16} color={BENTO.slateLight} />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)" }
      : { elevation: 1 }),
  },
  mainTouch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: BENTO.border,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  infoCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
    fontFamily: BENTO.fontHeading,
    flex: 1,
    marginRight: 6,
  },
  deptBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  deptBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  roleIcon: {
    marginRight: 5,
    marginTop: 2,
  },
  roleText: {
    fontSize: 12,
    color: BENTO.slate,
    fontFamily: BENTO.fontBody,
    flex: 1,
    lineHeight: 17,
  },
  roleTitle: {
    fontWeight: "700",
    color: BENTO.navy,
  },
  roleCompany: {
    color: BENTO.slate,
  },
  academicRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  academicText: {
    fontSize: 11,
    color: BENTO.slateLight,
    fontWeight: "500",
  },
  skillsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  skillPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillText: {
    fontSize: 10,
    color: BENTO.slate,
    fontWeight: "600",
  },
  morePill: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  moreText: {
    fontSize: 10,
    color: BENTO.slateLight,
    fontWeight: "600",
  },
  actionCol: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkedInBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8f2fa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c2dcfa",
    ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
  },
  emailBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
    ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
  },
  chevronBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? { cursor: "pointer" as const } : {}),
  },
});
