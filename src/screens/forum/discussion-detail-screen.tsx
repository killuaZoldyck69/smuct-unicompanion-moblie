import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily } from "./constants";
import type { ForumResponseItem, ForumAuthor } from "./types";
import { useDiscussionDetail } from "./hooks/use-discussion-detail";
import { DiscussionHeader } from "./components/detail/discussion-header";
import { DiscussionQuestionCard } from "./components/detail/discussion-question-card";
import { DiscussionReplyItem } from "./components/detail/discussion-reply-item";
import { DiscussionEmptyReplies } from "./components/detail/discussion-empty-replies";
import { DiscussionComposer } from "./components/detail/discussion-composer";
import { DiscussionEditModal } from "./components/detail/discussion-edit-modal";
import { ForumOptionsModal } from "./components/forum-options-modal";
import { ForumConfirmModal } from "./components/forum-confirm-modal";
import { UgcGuidelinesModal } from "./components/ugc/ugc-guidelines-modal";
import { UgcReportModal } from "./components/ugc/ugc-report-modal";
import { AuthorDetailsModal } from "../campus-hub/shared/author-modal";
import { ForumDiscussionDetailSkeleton } from "../campus-hub/shared/skeleton-loaders";

export function DiscussionDetailScreen() {
  const [keyboardBehavior, setKeyboardBehavior] = useState<
    "height" | "padding" | undefined
  >(undefined);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardBehavior(Platform.OS === "ios" ? "padding" : "height");
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardBehavior(undefined);
      },
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const {
    thread,
    isLoading,
    isError,
    isOffline,
    refetch,
    isRefetching,
    isAuthor,
    canManage,
    currentUserId,
    isAdmin,
    composerText,
    setComposerText,
    isEditMode,
    replyTarget,
    handleStartReply,
    handleCancelReply,
    composerInputRef,
    isSubmittingComposer,
    handleComposerSubmit,
    handleEditResponseInline,
    handleCancelEdit,
    handleDeleteResponsePrompt,
    handleReactResponse,
    isOptionsModalVisible,
    setIsOptionsModalVisible,
    handleOverflowPress,
    isEditModalVisible,
    setIsEditModalVisible,
    editForm,
    setEditForm,
    handleOpenEdit,
    handleSaveEdit,
    isSavingEdit,
    selectedProfile,
    setSelectedProfile,
    confirmModal,
    setConfirmModal,
    isGuidelinesModalVisible,
    setIsGuidelinesModalVisible,
    isAcceptingGuidelines,
    handleAcceptGuidelines,
    reportTarget,
    setReportTarget,
    handleOpenReportPost,
    handleOpenReportResponse,
    handleSubmitReport,
    isSubmittingReport,
    handleShare,
    handleResolvePrompt,
    handleDeletePrompt,
    isDeleting,
    isResolving,
    isDeletingResponse,
  } = useDiscussionDetail();

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const backAction = () => {
      if (replyTarget) {
        handleCancelReply();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [replyTarget, handleCancelReply]);

  const handleProfilePress = useCallback(
    (profile: ForumAuthor) => {
      setSelectedProfile(profile);
    },
    [setSelectedProfile],
  );

  const renderReplyItem = useCallback(
    ({ item }: { item: ForumResponseItem }) => (
      <DiscussionReplyItem
        item={item}
        threadAuthorId={thread?.authorId}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        isResolved={thread?.isResolved}
        onResponderPress={handleProfilePress}
        onStartReply={handleStartReply}
        onEditPress={handleEditResponseInline}
        onDeletePress={handleDeleteResponsePrompt}
        onReactPress={handleReactResponse}
        onReportPress={handleOpenReportResponse}
      />
    ),
    [
      thread?.authorId,
      thread?.isResolved,
      currentUserId,
      isAdmin,
      handleProfilePress,
      handleStartReply,
      handleEditResponseInline,
      handleDeleteResponsePrompt,
      handleReactResponse,
      handleOpenReportResponse,
    ],
  );

  const renderHeader = useCallback(() => {
    if (!thread) return null;
    return (
      <DiscussionQuestionCard
        thread={thread}
        isAuthor={isAuthor}
        isAdmin={isAdmin}
        onAuthorPress={handleProfilePress}
        onResolvePress={handleResolvePrompt}
      />
    );
  }, [thread, isAuthor, isAdmin, handleProfilePress, handleResolvePrompt]);

  const keyExtractor = useCallback((item: ForumResponseItem) => item.id, []);

  if (isLoading) {
    return <ForumDiscussionDetailSkeleton />;
  }

  if (isError || !thread) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centerBox]}
        edges={["top"]}
      >
        <Feather
          name="alert-circle"
          size={32}
          color={BENTO_COLORS.subtleText}
        />
        <Text style={styles.errorTitle}>Could not load discussion</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => refetch()}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry loading discussion"
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={styles.flexOne} edges={["top"]}>
        <DiscussionHeader
          canManage={canManage}
          onOverflowPress={handleOverflowPress}
          onSharePress={handleShare}
        />

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Feather
              name="wifi-off"
              size={13}
              color={colors.semantic.amber.deep}
            />
            <Text style={styles.offlineText}>
              You&apos;re offline. Showing cached discussion.
            </Text>
          </View>
        )}

        <FlatList
          data={thread.responses || []}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          renderItem={renderReplyItem}
          ListEmptyComponent={DiscussionEmptyReplies}
          style={styles.flexOne}
          contentContainerStyle={[styles.listContainer, { paddingBottom: 16 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[BENTO_COLORS.deepNavy]}
              tintColor={BENTO_COLORS.deepNavy}
            />
          }
        />

        <DiscussionComposer
          isResolved={thread.isResolved}
          value={composerText}
          onChangeText={setComposerText}
          onSubmit={handleComposerSubmit}
          isSubmitting={isSubmittingComposer}
          isEditMode={isEditMode}
          onCancelEdit={handleCancelEdit}
          replyTarget={replyTarget}
          onCancelReply={handleCancelReply}
          inputRef={composerInputRef}
        />
      </SafeAreaView>

      <ForumOptionsModal
        visible={isOptionsModalVisible}
        onClose={() => setIsOptionsModalVisible(false)}
        isAuthor={isAuthor}
        isResolved={thread.isResolved}
        canManage={canManage}
        onEdit={handleOpenEdit}
        onResolve={handleResolvePrompt}
        onDelete={handleDeletePrompt}
        onShare={handleShare}
        onReport={handleOpenReportPost}
      />

      {confirmModal && (
        <ForumConfirmModal
          visible={Boolean(confirmModal)}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
          cancelLabel={confirmModal.cancelLabel}
          type={confirmModal.type}
          iconName={confirmModal.iconName}
          isLoading={
            confirmModal.type === "danger"
              ? isDeleting || isDeletingResponse
              : isResolving
          }
        />
      )}

      <AuthorDetailsModal
        visible={Boolean(selectedProfile)}
        author={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        isOwnProfile={Boolean(
          currentUserId && selectedProfile?.id === currentUserId,
        )}
        onReportAuthor={() => {
          setSelectedProfile(null);
          handleOpenReportPost();
        }}
      />

      <UgcGuidelinesModal
        visible={isGuidelinesModalVisible}
        onClose={() => setIsGuidelinesModalVisible(false)}
        onAccept={handleAcceptGuidelines}
        isSubmitting={isAcceptingGuidelines}
        isOffline={isOffline}
      />

      {reportTarget && (
        <UgcReportModal
          visible={Boolean(reportTarget)}
          targetType={reportTarget.targetType}
          targetTitle={reportTarget.targetTitle}
          onClose={() => setReportTarget(null)}
          onSubmit={handleSubmitReport}
          isSubmitting={isSubmittingReport}
        />
      )}

      <DiscussionEditModal
        visible={isEditModalVisible}
        form={editForm}
        onChangeTitle={(text) =>
          setEditForm((prev) => ({ ...prev, title: text }))
        }
        onChangeDescription={(text) =>
          setEditForm((prev) => ({ ...prev, description: text }))
        }
        onSave={handleSaveEdit}
        onClose={() => setIsEditModalVisible(false)}
        isSaving={isSavingEdit}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  centerBox: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginTop: 12,
    marginBottom: 16,
  },
  retryBtn: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.semantic.amber.soft,
    borderWidth: 1,
    borderColor: colors.semantic.amber.border,
    width: "90%",
    maxWidth: 680,
    alignSelf: "center",
  },
  offlineText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: colors.semantic.amber.darkText,
  },
});
