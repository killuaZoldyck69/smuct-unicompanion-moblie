import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import api from "../src/services/api";
import { colors } from "../src/theme/colors";
import { typography } from "../src/theme/typography";
import { spacing, rounded, shadows } from "../src/theme/layout";

// --- Date Formatter ---
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function NoticeboardScreen() {
  const router = useRouter();
  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  // Fetch Notices Data
  const {
    data: notices,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const response = await api.get("/notices");
      return response.data?.data || [];
    },
  });

  // --- Render Individual Notice Card (Feed) ---
  const renderNoticeCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => setSelectedNotice(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Feather
            name="calendar"
            size={14}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.dateText}>
            {formatDate(item.issueDate || item.createdAt)}
          </Text>
        </View>
        {item.referenceNo && (
          <Text style={styles.refText} numberOfLines={1}>
            Ref: {item.referenceNo}
          </Text>
        )}
      </View>

      <Text style={styles.noticeTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.issuerRow}>
          <View style={styles.issuerAvatar}>
            <Feather name="user" size={14} color={colors.onPrimary} />
          </View>
          <Text style={styles.issuerText}>
            {item.issuerName} • {item.issuerDesignation}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.outline} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Noticeboard</Text>
          <Text style={styles.headerSubtitle}>
            Official University Announcements
          </Text>
        </View>
      </View>

      {/* Feed Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
          <Text style={styles.loadingText}>Fetching Notices...</Text>
        </View>
      ) : isError || !notices || notices.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="bell-off"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Notices Found</Text>
          <Text style={styles.emptyDesc}>
            There are currently no active announcements to display.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id}
          renderItem={renderNoticeCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Official Detail Modal */}
      <Modal
        visible={!!selectedNotice}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedNotice(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Official Document</Text>
            <TouchableOpacity
              onPress={() => setSelectedNotice(null)}
              style={styles.closeBtn}
            >
              <Feather name="x" size={24} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {selectedNotice && (
            <ScrollView
              contentContainerStyle={styles.documentContent}
              showsVerticalScrollIndicator={false}
            >
              {/* University Letterhead Header */}
              <View style={styles.letterhead}>
                <Text style={styles.universityTitle}>SHANTO-MARIAM</Text>
                <Text style={styles.universitySubtitle}>
                  UNIVERSITY OF CREATIVE TECHNOLOGY
                </Text>
              </View>

              {/* Meta Info (Ref & Date) */}
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {selectedNotice.referenceNo || "N/A"}
                </Text>
                <Text style={styles.metaText}>
                  Dated:{" "}
                  {formatDate(
                    selectedNotice.issueDate || selectedNotice.createdAt,
                  )}
                </Text>
              </View>

              {/* Notice Title */}
              <View style={styles.noticeHeaderContainer}>
                <Text style={styles.noticeWord}>NOTICE</Text>
                <Text style={styles.documentTitle}>{selectedNotice.title}</Text>
              </View>

              {/* Body Text */}
              <Text style={styles.documentBody}>{selectedNotice.body}</Text>

              {/* Signature Block */}
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureName}>
                  ({selectedNotice.issuerName})
                </Text>
                <Text style={styles.signatureDesig}>
                  {selectedNotice.issuerDesignation}
                </Text>
              </View>

              {/* Copy To (CC) Section */}
              {selectedNotice.copyTo && selectedNotice.copyTo.length > 0 && (
                <View style={styles.ccContainer}>
                  <Text style={styles.ccHeader}>Copy to:</Text>
                  {selectedNotice.copyTo.map((ccItem: string, idx: number) => (
                    <Text key={idx} style={styles.ccItem}>
                      {idx + 1}. {ccItem}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackLg,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backButton: { marginRight: spacing.stackMd, padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },
  headerSubtitle: { ...typography.bodyMd, color: colors.outline, marginTop: 2 },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  loadingText: {
    ...typography.labelMd,
    color: colors.outline,
    marginTop: spacing.stackMd,
  },
  emptyTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackSm,
  },
  emptyDesc: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    paddingHorizontal: spacing.stackLg,
  },

  listContent: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 2,
  },

  // Notice Card Styles
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackLg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackSm,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: rounded.full,
  },
  dateText: { ...typography.labelSm, color: colors.primary, fontWeight: "600" },
  refText: {
    ...typography.labelSm,
    color: colors.outline,
    flex: 1,
    textAlign: "right",
    marginLeft: spacing.stackSm,
  },
  noticeTitle: {
    ...typography.titleLg,
    color: colors.onSurface,
    marginBottom: spacing.stackLg,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    paddingTop: spacing.stackMd,
  },
  issuerRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  issuerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  issuerText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  modalHeaderTitle: { ...typography.titleLg, color: colors.onSurface },
  closeBtn: {
    padding: spacing.stackSm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
  },

  // Document Formatting (Letterhead Style)
  documentContent: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.sectionBreak * 3,
  },
  letterhead: {
    alignItems: "center",
    marginBottom: spacing.sectionBreak,
    borderBottomWidth: 2,
    borderBottomColor: colors.onSurface,
    paddingBottom: spacing.stackLg,
  },
  universityTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: "800",
    letterSpacing: 1,
  },
  universitySubtitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "600",
  },

  documentTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },

  signatureName: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sectionBreak,
  },
  metaText: { ...typography.labelMd, color: colors.onSurfaceVariant, flex: 1 },

  noticeHeaderContainer: {
    alignItems: "center",
    marginBottom: spacing.sectionBreak,
  },
  noticeWord: {
    ...typography.titleLg,
    color: colors.onSurface,
    fontWeight: "800",
    textDecorationLine: "underline",
    marginBottom: spacing.stackSm,
  },

  documentBody: {
    ...typography.bodyLg,
    color: colors.onSurface,
    lineHeight: 28,
    textAlign: "justify",
    marginBottom: spacing.sectionBreak,
  },

  signatureBlock: {
    alignSelf: "flex-start",
    marginTop: spacing.sectionBreak,
    marginBottom: spacing.sectionBreak,
  },

  signatureDesig: { ...typography.bodyMd, color: colors.onSurfaceVariant },

  ccContainer: {
    marginTop: spacing.sectionBreak,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHigh,
    paddingTop: spacing.stackLg,
  },
  ccHeader: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackSm,
  },
  ccItem: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
    paddingLeft: spacing.stackMd,
  },
});
