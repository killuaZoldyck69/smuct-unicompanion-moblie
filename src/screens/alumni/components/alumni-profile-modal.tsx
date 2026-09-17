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
import { fontFamily } from "../constants";
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
}

export const AlumniProfileModal: React.FC<AlumniProfileModalProps> = React.memo(
  ({ alumni, onClose }) => {
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
    if (batch) academicParts.push(String(batch));
    if (year) {
      const yearStr = String(year);
      academicParts.push(
        yearStr.toLowerCase().includes("class")
          ? yearStr
          : `Class of ${yearStr}`,
      );
    }
    if (alumni.department) academicParts.push(deptTheme.badge);
    const academicSummary =
      academicParts.length > 0 ? academicParts.join(" · ") : "SMUCT Graduate";

    // Combined batch/year for Academic Background section
    const batchYearText =
      [
        batch
          ? batch.toLowerCase().includes("batch")
            ? batch
            : `${batch} Batch`
          : null,
        year ? `Class of ${year}` : null,
      ]
        .filter(Boolean)
        .join(", ") || "Graduate";

    const handleCopyDetails = () => {
      const details = `${alumni.name}\n${role}${company ? " at " + company : ""}\n${academicSummary}\n${
        alumni.email ? "Email: " + alumni.email : ""
      }${linkedIn ? "\nLinkedIn: " + linkedIn : ""}`;
      copyToClipboard(details, "Alumni details");
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
          barStyle="light-content"
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
                  ios: Math.max(insets.bottom, 12),
                  android: 6,
                  default: 10,
                }),
              },
            ]}
          >
            {/* Top Bar: Drag Handle & Close Button */}
            <View style={styles.topBar}>
              <View style={styles.dragHandle} />
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close profile sheet"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={16} color="#6b7280" />
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
                    name="star"
                    size={13}
                    color="#6b7280"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.academicPillText}>{academicSummary}</Text>
                </View>
              </View>

              {/* Action Buttons Row: LinkedIn + Email + Copy + Share */}
              <View style={styles.actionRow}>
                {/* Primary Button: Connect on LinkedIn */}
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

                {/* Email Button */}
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() =>
                    alumni.email && openSafeLink(`mailto:${alumni.email}`)
                  }
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Email ${alumni.name}`}
                >
                  <Feather name="mail" size={17} color="#111827" />
                </TouchableOpacity>

                {/* Copy Button */}
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={handleCopyDetails}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Copy alumni details"
                >
                  <Feather name="copy" size={17} color="#111827" />
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => shareAlumniProfile(alumni)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Share alumni profile"
                >
                  <Feather name="share-2" size={17} color="#111827" />
                </TouchableOpacity>
              </View>

              {/* Section 1: CAREER & INDUSTRY */}
              {Boolean(company || role || alumni.personalWebsiteUrl) ? (
                <View style={styles.bentoCard}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.cardIconBox,
                        { backgroundColor: "#ede9fe" },
                      ]}
                    >
                      <Feather name="briefcase" size={14} color="#6366f1" />
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
                    <View
                      style={[
                        styles.infoRow,
                        !alumni.personalWebsiteUrl && { borderBottomWidth: 0 },
                      ]}
                    >
                      <Text style={styles.infoLabel}>Role</Text>
                      <Text style={styles.infoValue}>{role}</Text>
                    </View>
                  ) : null}

                  {Boolean(alumni.personalWebsiteUrl) ? (
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.infoLabel}>Website</Text>
                      <TouchableOpacity
                        onPress={() => openSafeLink(alumni.personalWebsiteUrl)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.linkText} numberOfLines={1}>
                          {alumni.personalWebsiteUrl}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Section 2: ACADEMIC BACKGROUND */}
              <View style={styles.bentoCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.cardIconBox, { backgroundColor: "#dcfce7" }]}
                  >
                    <Feather name="book-open" size={14} color="#16a34a" />
                  </View>
                  <Text style={styles.cardTitle}>ACADEMIC BACKGROUND</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Institution</Text>
                  <Text style={styles.infoValue}>SMUCT</Text>
                </View>

                {Boolean(alumni.department) ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Department</Text>
                    <Text style={styles.infoValue}>{alumni.department}</Text>
                  </View>
                ) : null}

                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>Batch</Text>
                  <Text style={styles.infoValue}>{batchYearText}</Text>
                </View>
              </View>

              {/* Optional Skills Section if Available */}
              {alumni.skills && alumni.skills.length > 0 ? (
                <View style={styles.bentoCard}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.cardIconBox,
                        { backgroundColor: "#fef3c7" },
                      ]}
                    >
                      <Feather name="award" size={14} color="#d97706" />
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
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: Platform.select({
      android: "92%",
      default: "88%",
    }),
    ...Platform.select({
      web: {
        maxWidth: 500,
        alignSelf: "center",
        width: "100%",
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.12)",
      } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  topBar: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 4,
    position: "relative",
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
  },
  closeBtn: {
    position: "absolute",
    right: 18,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
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
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  avatarBadgePill: {
    position: "absolute",
    bottom: -2,
    right: -4,
    paddingHorizontal: 7,
    paddingVertical: 2,
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
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
    textAlign: "center",
    marginTop: 4,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: "#4b5563",
    textAlign: "center",
    marginTop: 3,
  },
  academicPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
  },
  academicPillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    marginBottom: 16,
  },
  actionLinkedInBtn: {
    flex: 1,
    height: 48,
    backgroundColor: "#0066cc",
    borderRadius: 14,
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
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  iconActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
        cursor: "pointer" as const,
      } as any,
      default: {
        elevation: 1,
      },
    }),
  },
  bentoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
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
    color: "#64748b",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.04)",
  },
  infoLabel: {
    fontFamily,
    fontSize: 13,
    color: "#94a3b8",
  },
  infoValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  linkText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
    textAlign: "right",
    maxWidth: 200,
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
    borderColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  skillChipText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#334155",
  },
});
