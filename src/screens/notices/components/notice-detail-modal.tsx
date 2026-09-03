import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NoticeItem } from "@/services/notice-service";
import { formatDate } from "@/utils/date-formatter";
import { BENTO_COLORS, CATEGORY_THEMES, fontFamily } from "../constants";
import {
  getNoticeCategory,
  copyNoticeContent,
  shareNoticeContent,
} from "../utils";

interface NoticeDetailModalProps {
  notice: NoticeItem | null;
  onClose: () => void;
}

export const NoticeDetailModal = React.memo(function NoticeDetailModal({
  notice,
  onClose,
}: NoticeDetailModalProps) {
  if (!notice) return null;

  const categoryKey = getNoticeCategory(notice);
  const theme = CATEGORY_THEMES[categoryKey] || CATEGORY_THEMES.ADMIN;
  const formattedDate = formatDate(notice.issueDate || notice.createdAt);

  return (
    <Modal
      visible={!!notice}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={styles.container}
        edges={["top", "bottom"]}
        accessibilityViewIsModal={true}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.iconBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close notice"
          >
            <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Official Notice</Text>

          <TouchableOpacity
            onPress={() => shareNoticeContent(notice)}
            style={styles.iconBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Share notice"
          >
            <Feather name="share-2" size={18} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryPill,
                { backgroundColor: theme.pillBg },
              ]}
            >
              <Feather
                name={theme.icon}
                size={11}
                color={theme.pillText}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  { color: theme.pillText },
                ]}
              >
                {theme.label.toUpperCase()}
              </Text>
            </View>

            <View style={styles.datePill}>
              <Feather
                name="calendar"
                size={11}
                color={BENTO_COLORS.subtleText}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.datePillText}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.letterhead}>
            <Text style={styles.univTitle}>SHANTO-MARIAM</Text>
            <Text style={styles.univSubtitle}>
              UNIVERSITY OF CREATIVE TECHNOLOGY
            </Text>
            <Text style={styles.univBranch}>
              Office of the Registrar • Dhaka, Bangladesh
            </Text>
          </View>

          <Text style={styles.title}>{notice.title}</Text>

          {notice.referenceNo ? (
            <View style={styles.refBox}>
              <Text style={styles.refText}>Memo / Ref: {notice.referenceNo}</Text>
            </View>
          ) : null}

          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{notice.body}</Text>
          </View>

          <View style={styles.issuerCard}>
            <Text style={styles.issuerSectionLabel}>ISSUED BY AUTHORITY</Text>
            <Text style={styles.issuerName}>
              {notice.issuerName || "University Authority"}
            </Text>
            <Text style={styles.issuerDesignation}>
              {notice.issuerDesignation || "Registrar"}
            </Text>
            <Text style={styles.issuerUniv}>
              Shanto-Mariam University of Creative Technology
            </Text>
          </View>

          {Array.isArray(notice.copyTo) && notice.copyTo.length > 0 && (
            <View style={styles.ccContainer}>
              <Text style={styles.ccHeader}>Copy forwarded to:</Text>
              {notice.copyTo.map((item: string, idx: number) => (
                <View key={idx} style={styles.ccRow}>
                  <Text style={styles.ccBullet}>{idx + 1}.</Text>
                  <Text style={styles.ccText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => copyNoticeContent(notice)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Copy notice text"
            >
              <Feather
                name="copy"
                size={15}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.copyBtnText}>Copy Notice Content</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: BENTO_COLORS.white,
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  categoryPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  datePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  letterhead: {
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  univTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: 1.5,
  },
  univSubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 1,
    marginTop: 2,
  },
  univBranch: {
    fontFamily,
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 4,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    lineHeight: 28,
    marginBottom: 12,
  },
  refBox: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  refText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  bodyCard: {
    backgroundColor: BENTO_COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  bodyText: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.neutralText,
    lineHeight: 24,
  },
  issuerCard: {
    backgroundColor: BENTO_COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  issuerSectionLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 1,
    marginBottom: 8,
  },
  issuerName: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  issuerDesignation: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
    marginTop: 2,
  },
  issuerUniv: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  ccContainer: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  ccHeader: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginBottom: 8,
  },
  ccRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  ccBullet: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    width: 20,
  },
  ccText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.neutralText,
    lineHeight: 18,
  },
  bottomActions: {
    marginTop: 8,
    marginBottom: 20,
  },
  copyBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.shadow,
  },
  copyBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
