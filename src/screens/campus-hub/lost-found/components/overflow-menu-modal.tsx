import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

export interface OverflowMenuModalProps {
  visible: boolean;
  onClose: () => void;
  isAuthor: boolean;
  onDelete?: () => void;
  postTitle: string;
  postDescription?: string;
  postType?: "LOST" | "FOUND";
  postLocation?: string;
  postImage?: string;
  isLoading?: boolean;
}

export function OverflowMenuModal({
  visible,
  onClose,
  isAuthor,
  onDelete,
  postTitle,
  postType = "LOST",
  postLocation,
  postImage,
  isLoading = false,
}: OverflowMenuModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Math.max(insets.bottom, 20) + (Platform.OS === "android" ? 12 : 6);

  const isLost = postType === "LOST";

  if (!visible || !isAuthor) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={() => !isLoading && onClose()}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => !isLoading && onClose()}
          accessible={false}
        />

        <View style={[styles.sheet, { paddingBottom: bottomPadding }]}>
          <View style={styles.handle} />

          {/* Danger Halo Icon */}
          <View style={styles.haloOuter}>
            <View style={styles.haloInner}>
              <Feather
                name="trash-2"
                size={26}
                color={CAMPUS_HUB_COLORS.dangerText}
              />
            </View>
          </View>

          {/* Title & Warning Message */}
          <Text style={styles.title}>Delete Listing?</Text>
          <Text style={styles.message}>
            Are you sure you want to permanently delete this listing? All claims
            and information attached will be removed. This action cannot be undone.
          </Text>

          {/* Inset Post Preview Card */}
          <View style={styles.previewCard}>
            <View style={styles.previewThumbContainer}>
              {postImage ? (
                <Image
                  source={{ uri: postImage }}
                  style={styles.previewThumb}
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
              <Text style={styles.previewTitle} numberOfLines={1}>
                {postTitle}
              </Text>
              <View style={styles.previewBadgeRow}>
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: isLost
                        ? CAMPUS_HUB_COLORS.lostRoseBg
                        : CAMPUS_HUB_COLORS.foundTealBg,
                      borderColor: isLost
                        ? CAMPUS_HUB_COLORS.lostRoseBorder
                        : CAMPUS_HUB_COLORS.foundTealBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      {
                        color: isLost
                          ? CAMPUS_HUB_COLORS.lostRoseText
                          : CAMPUS_HUB_COLORS.foundTealText,
                      },
                    ]}
                  >
                    {isLost ? "LOST ITEM" : "FOUND ITEM"}
                  </Text>
                </View>

                {postLocation && (
                  <View style={styles.locationRow}>
                    <Feather
                      name="map-pin"
                      size={11}
                      color={CAMPUS_HUB_COLORS.subtleText}
                    />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {postLocation}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.deleteBtn,
                isLoading && styles.btnDisabled,
              ]}
              onPress={onDelete}
              disabled={isLoading}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Permanently delete listing"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="trash-2"
                    size={16}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.deleteBtnText}>Delete Listing</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Cancel and keep listing"
            >
              <Text style={styles.cancelBtnText}>Keep Listing</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 22,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 20,
  },
  haloOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  haloInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    fontFamily,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 12,
    gap: 12,
    marginBottom: 24,
  },
  previewThumbContainer: {
    width: 46,
    height: 46,
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
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  previewMeta: {
    flex: 1,
    gap: 4,
  },
  previewTitle: {
    fontSize: 14,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  previewBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    fontFamily,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  actionsContainer: {
    gap: 10,
  },
  deleteBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: CAMPUS_HUB_COLORS.dangerText,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  deleteBtnText: {
    fontSize: 15,
    fontFamily,
    fontWeight: "800",
    color: "#ffffff",
  },
  cancelBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
});
