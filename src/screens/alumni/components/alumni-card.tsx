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
import { BENTO, fontFamily } from "../constants";
import { AlumniItem } from "../types";
import { getDeptTheme, getInitials } from "../utils";

interface AlumniCardProps {
  item: AlumniItem;
  onSelect: (item: AlumniItem) => void;
  isAdmin?: boolean;
  onEdit?: (item: AlumniItem) => void;
  onDelete?: (item: AlumniItem) => void;
}

export const AlumniCard: React.FC<AlumniCardProps> = React.memo(
  ({ item, onSelect, isAdmin = false, onEdit, onDelete }) => {
    const [imageError, setImageError] = useState(false);

    const role =
      item.currentPosition || item.designation || item.currentRole || "Alumni";
    const company = item.currentCompany;
    const year = item.graduationYear || item.passingYear;
    const batch = item.batch || item.graduationBatch;
    const deptTheme = getDeptTheme(item.department);
    const imageUrl = item.image || item.imageUrl;
    const hasImage = Boolean(imageUrl) && !imageError;

    const handleSelect = useCallback(() => {
      onSelect(item);
    }, [item, onSelect]);

    // Secondary line: "Role · Company" matching Screenshot 1
    const roleCompany = [role, company].filter(Boolean).join(" · ");

    // Tertiary line: Batch + optional Student ID
    const rawBatch = batch ? String(batch).trim() : null;
    const batchDisplay = rawBatch
      ? rawBatch.toLowerCase().includes("batch")
        ? rawBatch
        : `${rawBatch} Batch`
      : year
      ? `Class of ${year}`
      : "SMUCT Graduate";
    const tertiaryDisplay = item.studentId
      ? `${batchDisplay} · ID: ${item.studentId}`
      : batchDisplay;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={handleSelect}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Alumni: ${item.name}, ${roleCompany}. ${batchDisplay}. Tap to view profile.`}
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
                  backgroundColor: deptTheme.bg,
                  borderColor: deptTheme.border,
                },
              ]}
            >
              <Text style={[styles.avatarInitial, { color: deptTheme.text }]}>
                {getInitials(item.name)}
              </Text>
            </View>
          )}
        </View>

        {/* Center Info Details */}
        <View style={styles.infoCol}>
          {/* Line 1: Name + Department Badge Pill */}
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View
              style={[
                styles.deptBadge,
                { backgroundColor: deptTheme.bg },
              ]}
            >
              <Text style={[styles.deptBadgeText, { color: deptTheme.text }]}>
                {deptTheme.badge}
              </Text>
            </View>
          </View>

          {/* Line 2: Role · Company */}
          <Text style={styles.roleCompany} numberOfLines={1}>
            {roleCompany}
          </Text>

          {/* Line 3: Bottom Row with Batch on Left & Admin Actions on Bottom Right */}
          <View style={styles.bottomRow}>
            <Text style={styles.batchText} numberOfLines={1}>
              {tertiaryDisplay}
            </Text>

            {isAdmin ? (
              <View style={styles.adminActionGroup}>
                {onEdit && (
                  <TouchableOpacity
                    style={styles.adminEditBtn}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      onEdit(item);
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${item.name}`}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={12} color={BENTO.navy} />
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    style={styles.adminDeleteBtn}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      onDelete(item);
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.name}`}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={12} color={BENTO.rose} />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.chevronWrap}>
                <Feather name="chevron-right" size={15} color="#9ca3af" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
        cursor: "pointer" as const,
      } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  avatarWrap: {
    marginRight: 14,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  infoCol: {
    flex: 1,
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  name: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 8,
  },
  deptBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  deptBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  roleCompany: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
    lineHeight: 18,
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  batchText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "400",
    color: "#9ca3af",
    flex: 1,
    marginRight: 8,
  },
  chevronWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  adminActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  adminDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BENTO.roseBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
});


