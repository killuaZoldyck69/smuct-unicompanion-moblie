// src/screens/notices/components/notice-detail-view.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";
import { NormalizedNotice } from "../types";
import { resolveNoticeVisualTheme } from "../theme/notice-visual-theme-resolver";
import { OfficialIdentityBlock } from "./official-identity-block";
import { CampusWatermarkSvg } from "./illustrations/campus-watermark-svg";
import { copyNoticeContent, shareNoticeContent } from "../utils";

interface Props {
  notice: NormalizedNotice | null;
  onClose: () => void;
}

export const NoticeDetailView = React.memo(function NoticeDetailView({
  notice,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  if (!notice) return null;

  const theme = resolveNoticeVisualTheme(notice.category);

  return (
    <Modal
      visible={!!notice}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.circleBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close official notice"
            activeOpacity={0.75}
          >
            <Feather name="x" size={20} color={NOTICE_COLORS.deepNavy} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Official Notice</Text>

          <TouchableOpacity
            onPress={() => shareNoticeContent(notice)}
            style={styles.circleBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Share official notice"
            activeOpacity={0.75}
          >
            <Feather name="share-2" size={18} color={NOTICE_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Category Tag + Date Row */}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.badgeBorder,
                },
              ]}
            >
              <Feather
                name={theme.icon}
                size={12}
                color={theme.badgeText}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: theme.badgeText },
                ]}
              >
                {theme.label.toUpperCase()}
              </Text>
            </View>

            <View style={styles.dateGroup}>
              <Feather
                name="calendar"
                size={13}
                color={NOTICE_COLORS.subtleText}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.dateText}>{notice.formattedDate}</Text>
            </View>
          </View>

          {/* 2. Official Institutional Letterhead Block */}
          <OfficialIdentityBlock />

          {/* 3. Official Notice Title */}
          <Text style={styles.noticeTitle}>{notice.title}</Text>

          {/* 4. Memo / Reference Block */}
          {notice.referenceNo ? (
            <View style={styles.refBox}>
              <Text style={styles.refText}>
                Memo / Ref: {notice.referenceNo}
              </Text>
            </View>
          ) : null}

          {/* 5. Official Notice Body Paragraphs */}
          <View style={styles.bodyWrapper}>
            {notice.bodyParagraphs.map((paragraph, idx) => (
              <Text key={idx} style={styles.bodyParagraph}>
                {paragraph}
              </Text>
            ))}
          </View>

          {/* 6. Issuer Signatory Block */}
          <View style={styles.signatoryCard}>
            <View style={styles.signatoryAvatar}>
              <Feather name="user" size={16} color={NOTICE_COLORS.deepNavy} />
            </View>
            <View style={styles.signatoryTextCol}>
              <Text style={styles.signatoryName}>{notice.issuerName}</Text>
              <Text style={styles.signatoryDesignation}>
                {notice.issuerDesignation}
              </Text>
            </View>
          </View>

          {/* 7. Copy-To (CC) if present */}
          {notice.copyTo.length > 0 && (
            <View style={styles.ccBox}>
              <Text style={styles.ccHeader}>Copy forwarded for information to:</Text>
              {notice.copyTo.map((recipient, i) => (
                <View key={i} style={styles.ccRow}>
                  <Text style={styles.ccBullet}>{i + 1}.</Text>
                  <Text style={styles.ccText}>{recipient}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 8. Copy Content Action Button */}
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() => copyNoticeContent(notice)}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Copy notice text"
          >
            <Feather
              name="copy"
              size={15}
              color={NOTICE_COLORS.deepNavy}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.copyBtnText}>Copy Notice Text</Text>
          </TouchableOpacity>

          {/* 9. Bottom Campus Watermark Illustration */}
          <View style={styles.watermarkWrap} pointerEvents="none">
            <CampusWatermarkSvg width="100%" height={80} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOTICE_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: NOTICE_COLORS.divider,
    backgroundColor: NOTICE_COLORS.background,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: NOTICE_COLORS.white,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    alignItems: "center",
    justifyContent: "center",
    ...NOTICE_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    maxWidth: 780,
    alignSelf: "center",
    width: "100%",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dateGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: NOTICE_COLORS.subtleText,
  },
  noticeTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    lineHeight: 35,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  refBox: {
    backgroundColor: "rgba(241, 245, 249, 0.9)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.4)",
  },
  refText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: NOTICE_COLORS.subtleText,
    lineHeight: 18,
  },
  bodyWrapper: {
    marginBottom: 24,
  },
  bodyParagraph: {
    fontFamily,
    fontSize: 15.5,
    color: NOTICE_COLORS.bodyText,
    lineHeight: 26,
    marginBottom: 14,
    letterSpacing: 0.1,
  },
  signatoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    marginBottom: 20,
    ...NOTICE_COLORS.shadow,
  },
  signatoryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  signatoryTextCol: {
    flex: 1,
  },
  signatoryName: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
  },
  signatoryDesignation: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: NOTICE_COLORS.subtleText,
    marginTop: 2,
  },
  ccBox: {
    backgroundColor: "rgba(248, 250, 252, 0.9)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
  },
  ccHeader: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: NOTICE_COLORS.subtleText,
    marginBottom: 8,
  },
  ccRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  ccBullet: {
    fontFamily,
    fontSize: 12,
    color: NOTICE_COLORS.subtleText,
    width: 20,
  },
  ccText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: NOTICE_COLORS.neutralText,
    lineHeight: 18,
  },
  copyBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.white,
    paddingVertical: 13,
    borderRadius: NOTICE_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    marginBottom: 28,
    ...NOTICE_COLORS.shadow,
  },
  copyBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
  },
  watermarkWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 10,
  },
});
