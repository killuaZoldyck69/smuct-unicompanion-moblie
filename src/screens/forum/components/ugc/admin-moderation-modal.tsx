import React, { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";
import {
  useAdminForumReports,
  useReviewAdminForumReport,
} from "@/features/ugc/useUgcModeration";
import { useCurrentUser } from "@/hooks/use-current-user";
import { extractApiErrorInfo } from "@/features/forum/forum-logic";
import {
  resolveMemePreviewFromReport,
  type ResolvedMemePreview,
} from "@/features/campus-hub/meme-logic";
import type { ForumAuthor } from "@/features/forum/types";
import type {
  AdminForumReportItem,
  AdminModerationAction,
  AdminReportStatusFilter,
  UgcReportTargetType,
} from "@/services/ugc-service";
import { AuthorDetailsModal } from "@/screens/campus-hub/shared/author-modal";
import { MemeImageModal } from "@/screens/campus-hub/memes/components/meme-image-modal";
import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily, titleFontFamily } from "../../constants";
import { ModerationReportCard } from "./moderation-report-card";

interface AdminModerationModalProps {
  visible: boolean;
  onClose: () => void;
}

const STATUS_TABS: Array<{ key: AdminReportStatusFilter; label: string }> = [
  { key: "PENDING", label: "Pending" },
  { key: "ACTIONED", label: "Actioned" },
  { key: "DISMISSED", label: "Dismissed" },
  { key: "ALL", label: "All" },
];

export const AdminModerationModal = memo(function AdminModerationModal({
  visible,
  onClose,
}: AdminModerationModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  const [statusFilter, setStatusFilter] =
    useState<AdminReportStatusFilter>("PENDING");
  const [page, setPage] = useState(1);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [selectedAuthor, setSelectedAuthor] = useState<ForumAuthor | null>(
    null,
  );
  const [previewMeme, setPreviewMeme] = useState<ResolvedMemePreview | null>(
    null,
  );

  const { data, isLoading, isError, refetch, isRefetching } =
    useAdminForumReports({ status: statusFilter, page, limit: 25 }, visible);
  const reviewMutation = useReviewAdminForumReport();

  const reports = data?.reports ?? [];
  const pendingCount = data?.meta?.pendingCount ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleOpenPost = useCallback(
    (
      postId: string,
      targetType: UgcReportTargetType,
      report?: AdminForumReportItem,
    ) => {
      if (targetType === "MEME_POST") {
        const preview = resolveMemePreviewFromReport(report);
        if (preview) {
          setPreviewMeme(preview);
        }
        return;
      }
      onClose();
      if (targetType === "LOST_FOUND_POST") {
        router.push(`/campus-hub/lost-found/${postId}`);
        return;
      }
      if (
        targetType === "MARKETPLACE_POST" ||
        targetType === "MARKETPLACE_COMMENT"
      ) {
        router.push(`/campus-hub/marketplace/${postId}`);
        return;
      }
      router.push(`/(tabs)/forum/${postId}`);
    },
    [onClose, router],
  );

  const handleChangeNote = useCallback((reportId: string, note: string) => {
    setAdminNotes((prev) => ({ ...prev, [reportId]: note }));
  }, []);

  const executeAction = useCallback(
    (
      report: AdminForumReportItem,
      action: AdminModerationAction,
      confirmTitle: string,
      confirmMessage: string,
    ) => {
      const run = () => {
        const note = (adminNotes[report.id] || "").trim();
        reviewMutation.mutate(
          {
            reportId: report.id,
            input: {
              action,
              ...(note ? { adminNote: note } : {}),
            },
          },
          {
            onSuccess: () => {
              Toast.show({
                type: "success",
                text1: "Moderation Applied",
                text2: `Action ${action.replace(/_/g, " ").toLowerCase()} completed.`,
              });
            },
            onError: (err) => {
              const info = extractApiErrorInfo(
                err,
                "Moderation action failed.",
              );
              if (info.status === 409) {
                void refetch();
              }
              Toast.show({
                type: "error",
                text1:
                  info.status === 409 ? "Already Reviewed" : "Action Failed",
                text2: info.message,
              });
            },
          },
        );
      };

      if (action === "DISMISS") {
        run();
        return;
      }

      Alert.alert(confirmTitle, confirmMessage, [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", style: "destructive", onPress: run },
      ]);
    },
    [adminNotes, reviewMutation, refetch],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BENTO_COLORS.background}
        translucent={true}
      />
      <SafeAreaView style={styles.fullScreen} edges={["top", "bottom"]}>
        <View style={[styles.topHeader, styles.centeredWidth]}>
          <View style={styles.titleRow}>
            <View style={styles.shieldBox}>
              <Feather
                name="shield"
                size={18}
                color={colors.semantic.violet.accent}
              />
            </View>
            <View style={styles.titleTextCol}>
              <Text style={styles.title} numberOfLines={1}>
                Moderation Queue
              </Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={1.3}>
                {pendingCount} pending{" "}
                {pendingCount === 1 ? "report" : "reports"}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && Platform.OS === "ios" && { opacity: 0.7 },
            ]}
            android_ripple={{ color: colors.navyAlpha08 }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close moderation queue"
          >
            <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
          </Pressable>
        </View>

        <View style={[styles.tabsRow, styles.centeredWidth]}>
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={({ pressed }) => [
                  styles.tabPill,
                  active && styles.tabPillActive,
                  pressed && Platform.OS === "ios" && { opacity: 0.8 },
                ]}
                android_ripple={{
                  color: active ? colors.whiteAlpha20 : colors.navyAlpha08,
                }}
                hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                onPress={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                accessible={true}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${tab.label} reports`}
              >
                <Text
                  style={[styles.tabText, active && styles.tabTextActive]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.25}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <KeyboardAvoidingView behavior="padding" style={styles.flexOne}>
          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator
                size="small"
                color={BENTO_COLORS.primaryBlue}
              />
              <Text style={styles.centerText}>Loading reports...</Text>
            </View>
          ) : isError ? (
            <View style={styles.centerBox}>
              <Feather
                name="alert-circle"
                size={24}
                color={BENTO_COLORS.danger}
              />
              <Text style={styles.centerText}>Failed to load reports.</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.retryBtn,
                  pressed && Platform.OS === "ios" && { opacity: 0.85 },
                ]}
                android_ripple={{ color: colors.whiteAlpha20 }}
                onPress={() => refetch()}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Retry loading reports"
              >
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => item.id}
              onRefresh={refetch}
              refreshing={isRefetching}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.listContent, styles.centeredWidth]}
              ListEmptyComponent={
                <View style={styles.centerBox}>
                  <Feather
                    name="check-circle"
                    size={28}
                    color={BENTO_COLORS.emerald}
                  />
                  <Text style={styles.emptyTitle}>Queue Clear</Text>
                  <Text style={styles.centerText}>
                    No reports in {statusFilter.toLowerCase()} status.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <ModerationReportCard
                  report={item}
                  currentUserId={currentUser?.id}
                  adminNote={adminNotes[item.id] ?? ""}
                  isSubmitting={reviewMutation.isPending}
                  onChangeNote={handleChangeNote}
                  onSelectAuthor={setSelectedAuthor}
                  onOpenPost={handleOpenPost}
                  onExecuteAction={executeAction}
                />
              )}
              ListFooterComponent={
                totalPages > 1 ? (
                  <View style={styles.paginationRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.pageBtn,
                        page <= 1 && styles.modBtnDisabled,
                        pressed && Platform.OS === "ios" && { opacity: 0.75 },
                      ]}
                      android_ripple={{ color: colors.navyAlpha08 }}
                      disabled={page <= 1 || isRefetching}
                      onPress={() => setPage((p) => Math.max(1, p - 1))}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: page <= 1 || isRefetching,
                      }}
                      accessibilityLabel="Previous page"
                    >
                      <Text style={styles.pageBtnText}>Previous</Text>
                    </Pressable>
                    <Text style={styles.pageInfo}>
                      Page {page} of {totalPages}
                    </Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.pageBtn,
                        page >= totalPages && styles.modBtnDisabled,
                        pressed && Platform.OS === "ios" && { opacity: 0.75 },
                      ]}
                      android_ripple={{ color: colors.navyAlpha08 }}
                      disabled={page >= totalPages || isRefetching}
                      onPress={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: page >= totalPages || isRefetching,
                      }}
                      accessibilityLabel="Next page"
                    >
                      <Text style={styles.pageBtnText}>Next</Text>
                    </Pressable>
                  </View>
                ) : null
              }
            />
          )}
        </KeyboardAvoidingView>

        <Toast config={toastConfig} topOffset={Math.max(insets.top + 8, 44)} />
      </SafeAreaView>

      <AuthorDetailsModal
        visible={Boolean(selectedAuthor)}
        author={selectedAuthor}
        isOwnProfile={Boolean(
          selectedAuthor && currentUser?.id === selectedAuthor.id,
        )}
        onClose={() => setSelectedAuthor(null)}
        renderInline={true}
      />

      <MemeImageModal
        visible={Boolean(previewMeme)}
        meme={previewMeme}
        onClose={() => setPreviewMeme(null)}
        renderInline={true}
      />
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  flexOne: {
    flex: 1,
  },
  centeredWidth: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  titleTextCol: {
    flex: 1,
  },
  shieldBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.semantic.violet.tint,
    borderWidth: 1,
    borderColor: colors.semantic.violet.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: titleFontFamily,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tabPill: {
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  tabPillActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  tabText: {
    fontFamily,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
  },
  tabTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 28,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  centerText: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
  },
  retryBtn: {
    marginTop: 4,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: BENTO_COLORS.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  modBtnDisabled: {
    opacity: 0.45,
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 10,
  },
  pageBtn: {
    minHeight: 48,
    minWidth: 96,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pageBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    includeFontPadding: false,
  },
  pageInfo: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    fontVariant: ["tabular-nums"],
  },
});
