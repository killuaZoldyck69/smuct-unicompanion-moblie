import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

interface LostFoundDeleteModalProps {
  visible: boolean;
  isDeleting: boolean;
  postTitle: string;
  postType?: "LOST" | "FOUND";
  postLocation?: string;
  postImage?: string;
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
  const insets = useSafeAreaInsets();
  const isLost = postType === "LOST";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isDeleting ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={isDeleting ? undefined : onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
              ]}
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
              <Text style={styles.title}>Delete Listing?</Text>
              <Text style={styles.description}>
                Are you sure you want to permanently delete this listing? All
                attached claims and information will be removed. This action
                cannot be undone.
              </Text>

              {/* Inset Post Preview Card */}
              <View style={styles.previewCard}>
                <View style={styles.previewThumbContainer}>
                  {postImage ? (
                    <Image
                      source={{ uri: postImage }}
                      style={styles.previewThumb}
                      resizeMode="cover"
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
                        isLost ? styles.typeBadgeLost : styles.typeBadgeFound,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeText,
                          isLost
                            ? styles.typeBadgeTextLost
                            : styles.typeBadgeTextFound,
                        ]}
                      >
                        {isLost ? "LOST ITEM" : "FOUND ITEM"}
                      </Text>
                    </View>

                    {!!postLocation && (
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

              {/* Actions Button Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={onClose}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel listing deletion"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btn,
                    styles.deleteBtn,
                    isDeleting && styles.deleteBtnDisabled,
                  ]}
                  onPress={onConfirm}
                  disabled={isDeleting}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm delete listing"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View style={styles.btnContentRow}>
                      <Feather name="trash-2" size={15} color="#ffffff" />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.heroShadow,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
  },
  haloOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  haloInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily,
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
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  previewMeta: {
    flex: 1,
    gap: 4,
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
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeBadgeLost: {
    backgroundColor: CAMPUS_HUB_COLORS.lostRoseBg,
    borderColor: CAMPUS_HUB_COLORS.lostRoseBorder,
  },
  typeBadgeFound: {
    backgroundColor: CAMPUS_HUB_COLORS.foundTealBg,
    borderColor: CAMPUS_HUB_COLORS.foundTealBorder,
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  typeBadgeTextLost: {
    color: CAMPUS_HUB_COLORS.lostRoseText,
  },
  typeBadgeTextFound: {
    color: CAMPUS_HUB_COLORS.foundTealText,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  locationText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#f1f5f9",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  deleteBtn: {
    backgroundColor: CAMPUS_HUB_COLORS.dangerText,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  deleteBtnDisabled: {
    opacity: 0.6,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
