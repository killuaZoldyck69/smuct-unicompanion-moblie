import React, { useCallback, useEffect, useState } from "react";
import {
  Text,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { BENTO_COLORS, fontFamily } from "./constants";
import type { ForumResponseItem, ForumAuthor } from "./types";
import { useDiscussionDetail } from "./hooks/use-discussion-detail";
import { DiscussionHeader } from "./components/detail/discussion-header";
import { DiscussionQuestionCard } from "./components/detail/discussion-question-card";
import { DiscussionReplyItem } from "./components/detail/discussion-reply-item";
import { DiscussionEmptyReplies } from "./components/detail/discussion-empty-replies";
import { DiscussionComposer } from "./components/detail/discussion-composer";
import { DiscussionProfileModal } from "./components/detail/discussion-profile-modal";
import { DiscussionEditModal } from "./components/detail/discussion-edit-modal";
import { ForumOptionsModal } from "./components/forum-options-modal";
import { ForumConfirmModal } from "./components/forum-confirm-modal";

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
    refetch,
    isRefetching,
    isAuthor,
    canManage,
    currentUserId,
    isAdmin,
    composerText,
    setComposerText,
    isEditMode,
    isSubmittingComposer,
    handleComposerSubmit,
    handleEditResponseInline,
    handleCancelEdit,
    handleDeleteResponsePrompt,
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
    handleResolvePrompt,
    handleDeletePrompt,
    isDeleting,
    isResolving,
    isDeletingResponse,
  } = useDiscussionDetail();

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
        onEditPress={handleEditResponseInline}
        onDeletePress={handleDeleteResponsePrompt}
      />
    ),
    [
      thread?.authorId,
      thread?.isResolved,
      currentUserId,
      isAdmin,
      handleProfilePress,
      handleEditResponseInline,
      handleDeleteResponsePrompt,
    ],
  );

  const renderHeader = useCallback(() => {
    if (!thread) return null;
    return (
      <DiscussionQuestionCard
        thread={thread}
        isAuthor={isAuthor}
        onAuthorPress={handleProfilePress}
        onResolvePress={handleResolvePrompt}
      />
    );
  }, [thread, isAuthor, handleProfilePress, handleResolvePrompt]);

  const keyExtractor = useCallback((item: ForumResponseItem) => item.id, []);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centerBox]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={BENTO_COLORS.deepNavy} />
      </SafeAreaView>
    );
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
        />

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

      <DiscussionProfileModal
        visible={Boolean(selectedProfile)}
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  retryBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
});
