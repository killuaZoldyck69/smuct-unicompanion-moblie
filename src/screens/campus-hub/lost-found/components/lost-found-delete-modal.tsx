import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "@/screens/campus-hub/shared/design-tokens";
import {
  LocationBadge,
  TypeBadge,
} from "@/screens/campus-hub/lost-found/components/status-badge";

interface LostFoundDeleteModalProps {
  visible: boolean;
  isDeleting: boolean;
  postTitle: string;
  postType?: "LOST" | "FOUND";
  postLocation?: string | null;
  postImage?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const LostFoundDeleteModal = React.memo(function LostFoundDeleteModal({
  visible,
  isDeleting,
  postTitle,
  postType = "LOST",
  postLocation,
  postImage,
  onConfirm,
  onClose,
}: LostFoundDeleteModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const isLost = postType === "LOST";
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [postImage]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isDeleting ? undefined : onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop} accessibilityViewIsModal={true}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={isDeleting ? undefined : onClose}
          accessible={false}
        />
        <View
          style={[
            styles.modalCard,
            { maxHeight: Math.min(windowHeight * 0.88, 600) },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Warning Halo Circle */}
            <View style={styles.haloOuter}>
              <View style={styles.haloInner}>
                <Feather
                  name="trash-2"
                  size={22}
                  color={CAMPUS_HUB_COLORS.dangerText}
                />
              </View>
            </View>

            {/* Title & Description */}
            <Text style={styles.title} maxFontSizeMultiplier={1.35}>
              Delete Listing?
            </Text>
            <Text style={styles.description} maxFontSizeMultiplier={1.35}>
              Are you sure you want to permanently delete this listing? All
              attached claims and information will be removed. This action
              cannot be undone.
            </Text>

            {/* Inset Post Preview Card */}
            <View style={styles.previewCard}>
              <View style={styles.previewThumbContainer}>
                {postImage && !imgError ? (
                  <Image
                    source={{ uri: postImage }}
                    style={styles.previewThumb}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Feather
                      name={isLost ? "search" : "gift"}
                      size={18}
                      color={CAMPUS_HUB_COLORS.subtleText}
                    />
                  </View>
                )}
              </View>

              <View style={styles.previewMeta}>
                <Text
                  style={styles.previewTitle}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.35}
                >
                  {postTitle}
                </Text>
                <View style={styles.previewBadgeRow}>
                  <TypeBadge type={postType} />
                  {!!postLocation && <LocationBadge location={postLocation} />}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Actions Button Row */}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.cancelBtn,
                pressed && !isDeleting && { opacity: 0.8 },
              ]}
              onPress={onClose}
              disabled={isDeleting}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isDeleting }}
              accessibilityLabel="Cancel listing deletion"
            >
              <Text style={styles.cancelBtnText} maxFontSizeMultiplier={1.25}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.deleteBtn,
                isDeleting && styles.deleteBtnDisabled,
                pressed && !isDeleting && { opacity: 0.88 },
              ]}
              onPress={onConfirm}
              disabled={isDeleting}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isDeleting, busy: isDeleting }}
              accessibilityLabel="Confirm delete listing"
            >
              {isDeleting ? (
                <ActivityIndicator
                  size="small"
                  color={CAMPUS_HUB_COLORS.white}
                />
              ) : (
                <View style={styles.btnContentRow}>
                  <Feather
                    name="trash-2"
                    size={15}
                    color={CAMPUS_HUB_COLORS.white}
                  />
                  <Text
                    style={styles.deleteBtnText}
                    maxFontSizeMultiplier={1.25}
                  >
                    Delete
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  scrollContent: {
    alignItems: "center",
  },
  haloOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.semantic.rose.tint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.semantic.rose.border,
  },
  haloInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.semantic.rose.softBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontFamily,
    fontSize: 13,
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: 14,
    padding: 10,
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  previewThumbContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
  },
  previewThumb: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.slate200,
    alignItems: "center",
    justifyContent: "center",
  },
  previewMeta: {
    flex: 1,
    gap: 6,
  },
  previewTitle: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  previewBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btn: {
    flex: 1,
    minHeight: 48,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cancelBtn: {
    backgroundColor: colors.slate100,
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  deleteBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerText,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  deleteBtnDisabled: {
    opacity: 0.6,
    elevation: 0,
    shadowOpacity: 0,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
});
