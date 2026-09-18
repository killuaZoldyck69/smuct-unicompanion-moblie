import React, { memo, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily, MAX_RESPONSE_LENGTH } from "../../constants";

interface DiscussionComposerProps {
  isResolved: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
  onCancelEdit?: () => void;
}

export const DiscussionComposer = memo(function DiscussionComposer({
  isResolved,
  value,
  onChangeText,
  onSubmit,
  isSubmitting,
  isEditMode = false,
  onCancelEdit,
}: DiscussionComposerProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditMode) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isEditMode]);

  const canSend = value.trim().length > 0 && !isSubmitting;
  const bottomPadding = isKeyboardVisible ? 6 : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.composerBar, { paddingBottom: bottomPadding }]}>
      {isResolved ? (
        <View style={styles.resolvedBanner}>
          <Feather
            name="check-circle"
            size={14}
            color={BENTO_COLORS.emerald}
            style={styles.bannerIcon}
          />
          <Text style={styles.resolvedBannerText}>
            This discussion has been marked as resolved.
          </Text>
        </View>
      ) : (
        <View>
          {isEditMode && (
            <View style={styles.editBanner}>
              <Feather name="edit-2" size={12} color="#92400e" style={styles.editBannerIcon} />
              <Text style={styles.editBannerText}>Editing response</Text>
              <TouchableOpacity
                onPress={onCancelEdit}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel edit"
              >
                <Text style={styles.editCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.composerRow}>
            <TextInput
              ref={inputRef}
              style={styles.composerInput}
              placeholder={isEditMode ? "Edit your response..." : "Write a response..."}
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={value}
              onChangeText={onChangeText}
              multiline={true}
              maxLength={MAX_RESPONSE_LENGTH}
              accessible={true}
              accessibilityLabel={isEditMode ? "Edit response field" : "Response input field"}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                isEditMode && styles.sendBtnEdit,
                !canSend && styles.sendBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={!canSend}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isEditMode ? "Save edit" : "Send reply"}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color={canSend ? "#ffffff" : BENTO_COLORS.subtleText}
                />
              ) : (
                <Feather
                  name={isEditMode ? "check" : "send"}
                  size={18}
                  color={canSend ? "#ffffff" : BENTO_COLORS.subtleText}
                  style={!isEditMode ? styles.sendIcon : undefined}
                />
              )}
            </TouchableOpacity>
          </View>

          {value.length > 50 && (
            <Text style={styles.charCountText}>
              {value.length}/{MAX_RESPONSE_LENGTH}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  composerBar: {
    backgroundColor: BENTO_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 12,
    paddingTop: 8,
    ...BENTO_COLORS.shadow,
  },
  resolvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.emeraldBg,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bannerIcon: {
    marginRight: 6,
  },
  resolvedBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.emerald,
  },
  editBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  editBannerIcon: {
    marginRight: 5,
  },
  editBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
    flex: 1,
  },
  editCancelText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.danger,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  composerInput: {
    flex: 1,
    fontFamily,
    fontSize: 15,
    fontWeight: "400",
    color: BENTO_COLORS.neutralText,
    backgroundColor: BENTO_COLORS.slateBg,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 12,
    paddingBottom: Platform.OS === "android" ? 10 : 12,
    minHeight: 46,
    maxHeight: 120,
    marginRight: 8,
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BENTO_COLORS.deepNavy,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnEdit: {
    backgroundColor: BENTO_COLORS.emerald,
  },
  sendBtnDisabled: {
    backgroundColor: BENTO_COLORS.slateBg,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  sendIcon: {
    marginLeft: 2,
  },
  charCountText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "right",
    marginTop: 4,
    marginRight: 52,
  },
});
