import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useUpdateMeme } from "@/features/campus-hub/useMemes";
import type { Meme } from "@/services/meme-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

interface MemeEditModalProps {
  visible: boolean;
  meme: Meme | null;
  onClose: () => void;
}

export const MemeEditModal = React.memo(function MemeEditModal({
  visible,
  meme,
  onClose,
}: MemeEditModalProps) {
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const updateMemeMutation = useUpdateMeme();

  useEffect(() => {
    if (meme) {
      setCaption(meme.caption ?? "");
    }
  }, [meme]);

  const handleModalClose = useCallback(() => {
    if (updateMemeMutation.isPending) return;
    Keyboard.dismiss();
    onClose();
  }, [updateMemeMutation.isPending, onClose]);

  const handleSubmit = useCallback(() => {
    if (!meme) return;

    updateMemeMutation.mutate(
      {
        memeId: meme.id,
        data: {
          caption: caption.trim() || null,
        },
      },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Meme Updated! ✨",
            text2: "Your changes have been saved.",
          });
          handleModalClose();
        },
        onError: (err: any) => {
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: err?.message || "Could not update meme.",
          });
        },
      },
    );
  }, [meme, caption, updateMemeMutation, handleModalClose]);

  if (!visible || !meme) return null;

  const isSaving = updateMemeMutation.isPending;

  return (
    <Modal
      visible={visible}
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      animationType="slide"
      onRequestClose={handleModalClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={true}
      />
      <SafeAreaView
        style={styles.fullScreenContainer}
        edges={["top", "bottom"]}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Edit Meme</Text>
            <View style={styles.hubBadge}>
              <Text style={styles.hubBadgeText}>CAMPUS HUB</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleModalClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            disabled={isSaving}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close edit modal"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          {/* Scrollable Form Content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Meme Image Thumbnail Preview Card */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionLabel}>MEME IMAGE</Text>
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: meme.imageUrl }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Caption Input Section */}
            <View style={styles.formGroup}>
              <View style={styles.captionHeaderRow}>
                <Text style={styles.sectionLabel}>CAPTION (OPTIONAL)</Text>
                <Text style={styles.charCount}>{caption.length}/280</Text>
              </View>

              <TextInput
                style={styles.captionInput}
                placeholder="Write a witty or relatable caption..."
                placeholderTextColor={CAMPUS_HUB_COLORS.subtleText}
                value={caption}
                onChangeText={setCaption}
                maxLength={280}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isSaving}
                accessible={true}
                accessibilityLabel="Edit meme caption"
              />
            </View>

            {/* University Guidelines hint */}
            <View style={styles.guidelinesBox}>
              <Feather
                name="info"
                size={14}
                color={CAMPUS_HUB_COLORS.subtleText}
                style={{ marginTop: 2 }}
              />
              <Text style={styles.guidelinesText}>
                Keep memes respectful and university-friendly. Inappropriate
                content will be removed.
              </Text>
            </View>
          </ScrollView>

          {/* Pinned Bottom Footer Action Buttons */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 14) },
            ]}
          >
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleModalClose}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.btnContentRow}>
                  <Feather name="check" size={16} color="#ffffff" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(19, 27, 46, 0.06)",
    backgroundColor: "#ffffff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  hubBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccentLight,
  },
  hubBadgeText: {
    fontSize: 9.5,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.memeAccentText,
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  formGroup: {
    gap: 6,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  previewContainer: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  captionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  charCount: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  captionInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 110,
  },
  guidelinesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  guidelinesText: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(19, 27, 46, 0.06)",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.memeAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#fbcfe8",
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveBtnText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#ffffff",
  },
});
