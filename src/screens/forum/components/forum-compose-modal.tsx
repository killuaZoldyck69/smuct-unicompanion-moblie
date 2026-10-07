import React, { memo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  StyleSheet,
  StatusBar,
  Dimensions,
  Keyboard,
  LayoutAnimation,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  BENTO_COLORS,
  fontFamily,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from "../constants";
import { useComposePostForm } from "../hooks/use-compose-post-form";

interface ForumComposeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("screen").height;

export const ForumComposeModal = memo(function ForumComposeModal({
  visible,
  onClose,
  onSuccess,
}: ForumComposeModalProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (Platform.OS === "android") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setIsKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (Platform.OS === "android") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const defaultHeight = Math.round(SCREEN_HEIGHT * 0.6);
  const maxAvailableHeight =
    SCREEN_HEIGHT - keyboardHeight - Math.max(insets.top, 24) - 16;
  const sheetHeight = Math.min(defaultHeight, maxAvailableHeight);

  const {
    title,
    setTitle,
    description,
    setDescription,
    isSubmitting,
    handleSubmit,
  } = useComposePostForm({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const renderSheetContent = () => (
    <View
      style={[
        styles.sheet,
        {
          height: sheetHeight,
          marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
        },
      ]}
    >
      {/* Drag Handle */}
      <View style={styles.dragHandle} />

      {/* Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.modalCloseBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close compose modal"
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <Text style={styles.modalHeaderTitle}>Ask a Question</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Form Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.modalScrollContent,
          { paddingBottom: isKeyboardVisible ? 120 : 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        {/* Title Field */}
        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.formLabel}>QUESTION TITLE</Text>
            <Text
              style={[
                styles.counterText,
                title.length > MAX_TITLE_LENGTH * 0.9 && styles.counterWarning,
              ]}
            >
              {title.length}/{MAX_TITLE_LENGTH}
            </Text>
          </View>
          <TextInput
            style={styles.formInput}
            placeholder="What do you need help with?"
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={title}
            onChangeText={setTitle}
            maxLength={MAX_TITLE_LENGTH}
            accessible={true}
            accessibilityLabel="Question Title"
            returnKeyType="next"
          />
        </View>

        {/* Description Field */}
        <View style={styles.formGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.formLabel}>DETAILS & CONTEXT</Text>
            <View style={styles.labelRightGroup}>
              {description.length > 0 && (
                <TouchableOpacity
                  onPress={() => setDescription("")}
                  style={styles.clearBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear description text"
                >
                  <Feather
                    name="x-circle"
                    size={12}
                    color="#64748b"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              <Text
                style={[
                  styles.counterText,
                  description.length > MAX_DESCRIPTION_LENGTH * 0.9 &&
                    styles.counterWarning,
                ]}
              >
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </Text>
            </View>
          </View>
          <TextInput
            style={[styles.formInput, styles.formInputArea]}
            placeholder="Describe your question, course details, or issue with specifics..."
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={description}
            onChangeText={setDescription}
            maxLength={MAX_DESCRIPTION_LENGTH}
            multiline={true}
            scrollEnabled={false}
            textAlignVertical="top"
            accessible={true}
            accessibilityLabel="Question Description"
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 120);
            }}
          />
        </View>
      </ScrollView>

      {/* Bottom Docked Action Footer with Safe Area */}
      <View
        style={[
          styles.modalFooter,
          {
            paddingBottom: isKeyboardVisible ? 12 : Math.max(insets.bottom, 16),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitPostBtn,
            (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Publish Question"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather
                name="send"
                size={16}
                color="#ffffff"
                style={styles.submitIcon}
              />
              <Text style={styles.submitPostBtnText}>Publish Question</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoid}>
            {renderSheetContent()}
          </KeyboardAvoidingView>
        ) : (
          renderSheetContent()
        )}
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    ...BENTO_COLORS.heroShadow,
  },
  scrollView: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  modalScrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  formGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  clearBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  formLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  counterText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    fontWeight: "600",
  },
  counterWarning: {
    color: "#f59e0b",
    fontWeight: "700",
  },
  formInput: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...BENTO_COLORS.shadow,
  },
  formInputArea: {
    minHeight: 160,
    paddingTop: 14,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
  },
  modalFooter: {
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  submitPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 15,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.heroShadow,
  },
  submitBtnDisabled: {
    backgroundColor: "#94a3b8",
    opacity: 0.65,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitPostBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
