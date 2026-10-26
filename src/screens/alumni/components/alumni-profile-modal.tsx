import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ImageStyle,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";
import { AlumniItem } from "../types";
import {
  getDeptTheme,
  getInitials,
  openSafeLink,
  shareAlumniProfile,
  copyToClipboard,
} from "../utils";

interface AlumniProfileModalProps {
  alumni: AlumniItem | null;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (item: AlumniItem) => void;
  onDelete?: (item: AlumniItem) => void;
}

export const AlumniProfileModal: React.FC<AlumniProfileModalProps> = React.memo(
  ({ alumni, onClose, isAdmin = false, onEdit, onDelete }) => {
    const insets = useSafeAreaInsets();
    const [imageError, setImageError] = useState(false);

    if (!alumni) return null;

    const deptTheme = getDeptTheme(alumni.department);
    const imageUrl = alumni.image || alumni.imageUrl;
    const hasImage = Boolean(imageUrl) && !imageError;
    const linkedIn = alumni.linkedInUrl || alumni.linkedinUrl;

    const role =
      alumni.currentPosition ||
      alumni.designation ||
      alumni.currentRole ||
      "Graduate";
    const company = alumni.currentCompany;
    const batch = alumni.batch || alumni.graduationBatch;
    const year = alumni.graduationYear || alumni.passingYear;

    // Academic badge line: "19th Batch · Class of 2022 · CSE"
    const academicParts: string[] = [];
    if (batch) {
      const bStr = String(batch).trim();
      academicParts.push(
        bStr.toLowerCase().includes("batch") ? bStr : `${bStr} Batch`,
      );
    }
    if (year) {
      const yearStr = String(year).trim();
      academicParts.push(
        yearStr.toLowerCase().includes("class") ? yearStr : `Class of ${yearStr}`,
      );
    }
    if (alumni.department) academicParts.push(deptTheme.badge);
    const academicSummary =
      academicParts.length > 0 ? academicParts.join(" · ") : "SMUCT Graduate";

    // Combined batch/year for Academic Background section
    const batchYearText =
      [
        batch
          ? String(batch).toLowerCase().includes("batch")
            ? String(batch)
            : `${batch} Batch`
          : null,
        year ? `Class of ${year}` : null,
      ]
        .filter(Boolean)
        .join(", ") || "Graduate";

    const handleCopyDetails = () => {
      const parts: string[] = [
        alumni.name,
        `${role}${company ? " at " + company : ""}`,
        academicSummary,
      ];
      if (alumni.studentId) parts.push(`Student ID: ${alumni.studentId}`);
      if (alumni.email) parts.push(`Email: ${alumni.email}`);
      if (alumni.phone) parts.push(`Phone: ${alumni.phone}`);
      if (linkedIn) parts.push(`LinkedIn: ${linkedIn}`);
      if (alumni.personalWebsiteUrl) parts.push(`Website: ${alumni.personalWebsiteUrl}`);

      copyToClipboard(parts.join("\n"), "Alumni credentials");
    };

    return (
      <Modal
        visible={Boolean(alumni)}
        animationType="slide"
        onRequestClose={onClose}
        transparent={true}
        statusBarTranslucent={true}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.modalOverlay}>
          {/* Backdrop dismiss touchable */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
            accessible={false}
          />

          <View
            style={[
              styles.sheetContainer,
              {
                paddingBottom: Platform.select({
                  ios: Math.max(insets.bottom, 16),
                  android: Math.max(insets.bottom, 14),
                  default: 14,
                }),
              },
            ]}
          >
            {/* Top Bar: Drag Handle, Admin Actions & Close Button */}
            <View style={styles.topBar}>
              <View style={styles.dragHandle} />

              {isAdmin && alumni && (
                <View style={styles.adminTopActions}>
                  {onEdit && (
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onEdit(alumni);
                      }}
                      style={styles.adminActionIconBtn}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Edit alumni profile"
                      activeOpacity={0.7}
                    >
                      <Feather name="edit-2" size={13} color={BENTO.navy} />
                    </TouchableOpacity>
                  )}

                  {onDelete && (
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onDelete(alumni);
                      }}
                      style={[styles.adminActionIconBtn, styles.adminDeleteIconBtn]}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Delete alumni"
                      activeOpacity={0.7}
                    >
                      <Feather name="trash-2" size={13} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close profile sheet"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Feather name="x" size={16} color={BENTO.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Identity Section */}
              <View style={styles.heroSection}>
                {/* Avatar with Overlapping Department Badge */}
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
                      <Text
                        style={[
                          styles.avatarInitial,
                          { color: deptTheme.text },
                        ]}
                      >
                        {getInitials(alumni.name)}
                      </Text>
                    </View>
                  )}

                  {/* Overlapping Department Pill */}
                  <View
                    style={[
                      styles.avatarBadgePill,
                      { backgroundColor: deptTheme.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarBadgeText,
                        { color: deptTheme.text },
                      ]}
                    >
                      {deptTheme.badge}
                    </Text>
                  </View>
                </View>

                {/* Name */}
                <Text style={styles.heroName}>{alumni.name}</Text>

                {/* Role at Company */}
                <Text style={styles.heroSubtitle}>
                  {role}
                  {company ? ` at ${company}` : ""}
                </Text>

                {/* Academic Pill with Star Icon */}
                <View style={styles.academicPill}>
                  <Feather
                    name="award"
                    size={12}
                    color={deptTheme.text}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.academicPillText}>{academicSummary}</Text>
                </View>
              </View>

              {/* Action Buttons Row: LinkedIn + Phone + Email + Copy + Share */}
              <View style={styles.actionRow}>
                {/* Primary Button: Connect on LinkedIn or Contact */}
                {Boolean(linkedIn) ? (
                  <TouchableOpacity
                    style={styles.actionLinkedInBtn}
                    onPress={() => openSafeLink(linkedIn)}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Connect with ${alumni.name} on LinkedIn`}
                  >
                    <View style={styles.inBadge}>
                      <Text style={styles.inBadgeText}>in</Text>
                    </View>
                    <Text style={styles.actionLinkedInText}>
                      Connect on LinkedIn
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionPrimaryBtn}
                    onPress={handleCopyDetails}
                    activeOpacity={0.8}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Copy alumni credentials"
                  >
                    <Feather
                      name="copy"
                      size={15}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.actionPrimaryText}>Copy Profile</Text>
                  </TouchableOpacity>
                )}

                {/* Phone Call Button */}
                {Boolean(alumni.phone) && (
                  <TouchableOpacity
                    style={styles.iconActionBtn}
                    onPress={() => openSafeLink(`tel:${alumni.phone}`)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${alumni.name}`}
                  >
                    <Feather name="phone" size={16} color="#059669" />
                  </TouchableOpacity>
                )}

                {/* Email Button */}
                {Boolean(alumni.email) && (
                  <TouchableOpacity
                    style={styles.iconActionBtn}
                    onPress={() => openSafeLink(`mailto:${alumni.email}`)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Email ${alumni.name}`}
                  >
                    <Feather name="mail" size={16} color="#2563eb" />
                  </TouchableOpacity>
                )}

                {/* Copy Button (if LinkedIn took primary slot) */}
                {Boolean(linkedIn) && (
                  <TouchableOpacity
                    style={styles.iconActionBtn}
                    onPress={handleCopyDetails}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Copy alumni credentials"
                  >
                    <Feather name="copy" size={16} color={BENTO.navy} />
                  </TouchableOpacity>
                )}

                {/* Share Button */}
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => shareAlumniProfile(alumni)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Share alumni profile"
                >
                  <Feather name="share-2" size={16} color={BENTO.navy} />
                </TouchableOpacity>
              </View>

              {/* ======================================= */}
              {/* SECTION 1: ACADEMIC CREDENTIALS CARD */}
              {/* ======================================= */}
              <View style={styles.bentoCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.cardIconBox, { backgroundColor: "#eff6ff" }]}
                  >
                    <Feather name="award" size={14} color="#2563eb" />
                  </View>
                  <Text style={styles.cardTitle}>ACADEMIC CREDENTIALS</Text>
                </View>

                {Boolean(alumni.studentId) ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Student ID</Text>
                    <Text style={[styles.infoValue, styles.monoValue]}>
                      {alumni.studentId}
                    </Text>
                  </View>
                ) : null}

                {Boolean(alumni.degree) ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Degree Program</Text>
                    <Text style={styles.infoValue}>{alumni.degree}</Text>
                  </View>
                ) : null}

                {Boolean(alumni.department) ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Department</Text>
                    <Text style={styles.infoValue}>{alumni.department}</Text>
                  </View>
                ) : null}

                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Batch & Year</Text>
                  <Text style={styles.infoValue}>{batchYearText}</Text>
                </View>
              </View>

              {/* ======================================= */}
              {/* SECTION 2: CAREER & INDUSTRY CARD */}
              {/* ======================================= */}
              {Boolean(company || role) ? (
                <View style={styles.bentoCard}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.cardIconBox,
                        { backgroundColor: "#fef3c7" },
                      ]}
                    >
                      <Feather name="briefcase" size={14} color="#d97706" />
                    </View>
                    <Text style={styles.cardTitle}>CAREER & INDUSTRY</Text>
                  </View>

                  {Boolean(company) ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Company</Text>
                      <Text style={styles.infoValue}>{company}</Text>
                    </View>
                  ) : null}

                  {Boolean(role) ? (
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.infoLabel}>Designation / Role</Text>
                      <Text style={styles.infoValue}>{role}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* ======================================= */}
              {/* SECTION 3: CONTACT & CONNECTIVITY CARD */}
              {/* ======================================= */}
              {Boolean(
                alumni.email ||
                  alumni.phone ||
                  linkedIn ||
                  alumni.personalWebsiteUrl,
              ) ? (
                <View style={styles.bentoCard}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.cardIconBox,
                        { backgroundColor: "#f0fdf4" },
                      ]}
                    >
                      <Feather name="globe" size={14} color="#16a34a" />
                    </View>
                    <Text style={styles.cardTitle}>CONTACT & CONNECTIVITY</Text>
                  </View>

                  {Boolean(alumni.phone) ? (
                    <TouchableOpacity
                      style={styles.infoInteractiveRow}
                      onPress={() => openSafeLink(`tel:${alumni.phone}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.interactiveLabelGroup}>
                        <Feather
                          name="phone"
                          size={13}
                          color="#059669"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.infoLabel}>Phone</Text>
                      </View>
                      <View style={styles.interactiveValueGroup}>
                        <Text style={styles.interactiveLinkText}>
                          {alumni.phone}
                        </Text>
                        <Feather
                          name="arrow-up-right"
                          size={13}
                          color="#059669"
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {Boolean(alumni.email) ? (
                    <TouchableOpacity
                      style={styles.infoInteractiveRow}
                      onPress={() => openSafeLink(`mailto:${alumni.email}`)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.interactiveLabelGroup}>
                        <Feather
                          name="mail"
                          size={13}
                          color="#2563eb"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.infoLabel}>Email</Text>
                      </View>
                      <View style={styles.interactiveValueGroup}>
                        <Text
                          style={[styles.interactiveLinkText, { color: "#2563eb" }]}
                          numberOfLines={1}
                        >
                          {alumni.email}
                        </Text>
                        <Feather
                          name="arrow-up-right"
                          size={13}
                          color="#2563eb"
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {Boolean(linkedIn) ? (
                    <TouchableOpacity
                      style={styles.infoInteractiveRow}
                      onPress={() => openSafeLink(linkedIn)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.interactiveLabelGroup}>
                        <Feather
                          name="share-2"
                          size={13}
                          color="#0066cc"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.infoLabel}>LinkedIn</Text>
                      </View>
                      <View style={styles.interactiveValueGroup}>
                        <Text
                          style={[styles.interactiveLinkText, { color: "#0066cc" }]}
                          numberOfLines={1}
                        >
                          View Profile
                        </Text>
                        <Feather
                          name="external-link"
                          size={13}
                          color="#0066cc"
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {Boolean(alumni.personalWebsiteUrl) ? (
                    <TouchableOpacity
                      style={[styles.infoInteractiveRow, { borderBottomWidth: 0 }]}
                      onPress={() => openSafeLink(alumni.personalWebsiteUrl)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.interactiveLabelGroup}>
                        <Feather
                          name="link"
                          size={13}
                          color="#7c3aed"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.infoLabel}>Website</Text>
                      </View>
                      <View style={styles.interactiveValueGroup}>
                        <Text
                          style={[styles.interactiveLinkText, { color: "#7c3aed" }]}
                          numberOfLines={1}
                        >
                          {alumni.personalWebsiteUrl}
                        </Text>
                        <Feather
                          name="external-link"
                          size={13}
                          color="#7c3aed"
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}

              {/* ======================================= */}
              {/* SECTION 4: SKILLS & EXPERTISE */}
              {/* ======================================= */}
              {alumni.skills && alumni.skills.length > 0 ? (
                <View style={styles.bentoCard}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.cardIconBox,
                        { backgroundColor: "#fdf2f8" },
                      ]}
                    >
                      <Feather name="tag" size={14} color="#db2777" />
                    </View>
                    <Text style={styles.cardTitle}>SKILLS & EXPERTISE</Text>
                  </View>

                  <View style={styles.skillsWrapper}>
                    {alumni.skills.map((skill, index) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={{ height: 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: Platform.select({
      android: "92%",
      default: "88%",
    }),
    ...Platform.select({
      web: {
        maxWidth: 520,
        alignSelf: "center",
        width: "100%",
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.12)",
      } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
      },
    }),
  },
  topBar: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 6,
    position: "relative",
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
  },
  closeBtn: {
    position: "absolute",
    right: 18,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminTopActions: {
    position: "absolute",
    left: 18,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminActionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminDeleteIconBtn: {
    backgroundColor: "#fef2f2",
    borderColor: "rgba(220, 38, 38, 0.15)",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 10,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 8,
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  avatarBadgePill: {
    position: "absolute",
    bottom: -2,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
  },
  heroName: {
    fontFamily,
    fontSize: 21,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.4,
    textAlign: "center",
    marginTop: 4,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: BENTO.slate,
    textAlign: "center",
    marginTop: 3,
  },
  academicPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 8,
  },
  academicPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  actionLinkedInBtn: {
    flex: 1,
    height: 44,
    backgroundColor: "#0066cc",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  inBadge: {
    marginRight: 6,
  },
  inBadgeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  actionLinkedInText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionPrimaryBtn: {
    flex: 1,
    height: 44,
    backgroundColor: BENTO.navy,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  actionPrimaryText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  bentoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.05)",
  },
  infoInteractiveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.05)",
  },
  interactiveLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  interactiveValueGroup: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "68%",
  },
  infoLabel: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    color: BENTO.slate,
  },
  infoValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  monoValue: {
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.5,
  },
  interactiveLinkText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
    textAlign: "right",
  },
  skillsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  skillChip: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  skillChipText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: BENTO.navy,
  },
});
