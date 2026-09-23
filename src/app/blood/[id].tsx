import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Linking,
  Share,
  BackHandler,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import { authClient } from "@/services/auth-client";
import { formatCardDateTime } from "@/utils/date-formatter";
import {
  useBloodPostById,
  useRespondBloodPost,
  useResolveBloodPost,
  useDeleteBloodPost,
} from "@/features/blood/useBlood";
import { BloodProfileModal } from "@/screens/blood/components/blood-profile-modal";
import { BloodConfirmModal } from "@/screens/blood/components/blood-confirm-modal";
import { formatBloodGroupSymbol } from "@/screens/blood/utils";
import { BENTO_COLORS, fontFamily } from "@/screens/blood/constants";
import type { BloodAuthor, BloodResponseItem } from "@/features/blood/types";

const getUserSubtitle = (user?: BloodAuthor | null) => {
  if (!user) return "";
  if (user.studentProfile?.department) {
    return user.studentProfile.department;
  }
  if (user.teacherProfile?.department) {
    return user.teacherProfile.department;
  }
  return user.role || "University Member";
};

export default function BloodThreadScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user as any;

  const [selectedProfile, setSelectedProfile] = useState<BloodAuthor | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: () => {},
  });

  const handleGoBack = useCallback(() => {
    if (from === "admin") {
      router.replace("/admin/blood" as any);
    } else {
      router.replace("/(tabs)/blood" as any);
    }
  }, [router, from]);

  useEffect(() => {
    const onBackPress = () => {
      if (selectedProfile) {
        setSelectedProfile(null);
        return true;
      }
      if (confirmModal.visible) {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        return true;
      }
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [handleGoBack, selectedProfile, confirmModal.visible]);

  const { data: post, isLoading } = useBloodPostById(id as string);

  const respondMutation = useRespondBloodPost(id as string);
  const resolveMutation = useResolveBloodPost();
  const deleteMutation = useDeleteBloodPost();

  const handleVolunteer = () => {
    if (!currentUser?.bloodGroup || !currentUser?.phoneNumber) {
      Toast.show({
        type: "error",
        text1: "Profile Incomplete",
        text2: "Add your Blood Group and Phone Number to your profile before volunteering.",
      });
      return;
    }
    setConfirmModal({
      visible: true,
      title: "Volunteer to Donate",
      message: "Are you sure you want to volunteer? The requester will be able to see your contact details.",
      confirmText: "Yes, Volunteer",
      confirmColor: "#059669",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        respondMutation.mutate(
          { message: "I am available to donate blood." },
          {
            onSuccess: () => {
              Toast.show({
                type: "success",
                text1: "Volunteer Recorded",
                text2: "Thank you! The requester can now contact you.",
              });
            },
            onError: (err: any) => {
              Toast.show({
                type: "error",
                text1: "Failed to respond",
                text2: err.message || "Could not record volunteer response.",
              });
            },
          },
        );
      },
    });
  };

  const handleResolvePress = () => {
    setConfirmModal({
      visible: true,
      title: "Mark as Fulfilled",
      message: "Are you sure this blood request has been fulfilled? It will be marked as resolved for the campus community.",
      confirmText: "Mark Fulfilled",
      confirmColor: "#059669",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        resolveMutation.mutate(id as string, {
          onSuccess: () => {
            Toast.show({ type: "success", text1: "Marked as Fulfilled" });
          },
        });
      },
    });
  };

  const handleDeletePress = () => {
    setConfirmModal({
      visible: true,
      title: "Delete Request",
      message: "Are you sure you want to delete this emergency request? This action cannot be undone.",
      confirmText: "Delete",
      confirmColor: BENTO_COLORS.crimson,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        deleteMutation.mutate(id as string, {
          onSuccess: () => {
            Toast.show({ type: "info", text1: "Request Deleted" });
            handleGoBack();
          },
        });
      },
    });
  };

  const handleCall = useCallback((phoneNumber?: string) => {
    if (!phoneNumber) return;
    const sanitized = phoneNumber.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${sanitized}`).catch(() => {
      Toast.show({
        type: "error",
        text1: "Cannot Make Call",
        text2: "Your device does not support direct phone calls.",
      });
    });
  }, []);

  const handleCopyPhone = useCallback(async (phone?: string) => {
    if (!phone) return;
    await Clipboard.setStringAsync(phone);
    Toast.show({
      type: "success",
      text1: "Copied Phone Number",
      text2: phone,
    });
  }, []);

  const handleShare = useCallback(async () => {
    if (!post) return;
    try {
      const symbol = formatBloodGroupSymbol(post.bloodGroup);
      const bags = post.bagsNeeded || 1;
      const msg = `🩸 BLOOD NEEDED: ${symbol} (${bags} ${bags === 1 ? "Bag" : "Bags"})\n\nPatient: ${
        post.patientName
      }\nCondition: ${post.patientCondition || "Emergency"}\nHospital: ${
        post.location
      }\nEmergency Contact: ${
        post.contactPhone
      }\n\nPlease help or share! (Via SMUCT UniCompanion)`;
      await Share.share({ message: msg });
    } catch {
      // Ignored
    }
  }, [post]);

  if (isLoading || !post) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={BENTO_COLORS.crimson} />
      </SafeAreaView>
    );
  }

  const isAuthor = currentUser?.id === post.authorId || currentUser?.role === "ADMIN";
  const hasVolunteered = post.responses?.some(
    (r: BloodResponseItem) => r.responder?.id === currentUser?.id,
  );
  const bloodSymbol = formatBloodGroupSymbol(post.bloodGroup);
  const bagsNeeded = post.bagsNeeded || 1;
  const isUrgent = post.urgency === "High" && !post.isFulfilled;
  const isFulfilled = !!post.isFulfilled;

  const renderOriginalPost = () => (
    <View style={styles.postHeaderContainer}>
      <View
        style={[
          styles.mainBentoCard,
          isUrgent && styles.cardUrgent,
          isFulfilled && styles.cardFulfilled,
        ]}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.badgeGroup}>
            <View
              style={[
                styles.bloodBadge,
                isFulfilled
                  ? styles.bloodBadgeFulfilled
                  : isUrgent
                  ? styles.bloodBadgeUrgent
                  : styles.bloodBadgeNormal,
              ]}
            >
              <Feather
                name="droplet"
                size={12}
                color="#ffffff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.bloodBadgeText}>{bloodSymbol}</Text>
            </View>

            <View
              style={[
                styles.bagsBadge,
                isFulfilled && styles.bagsBadgeFulfilled,
              ]}
            >
              <Text
                style={[
                  styles.bagsBadgeText,
                  isFulfilled && styles.bagsBadgeTextFulfilled,
                ]}
              >
                {bagsNeeded} {bagsNeeded === 1 ? "Bag" : "Bags"}
              </Text>
            </View>
          </View>

          <View style={styles.statusGroup}>
            {isUrgent ? (
              <View style={styles.urgentPill}>
                <View style={styles.urgentDot} />
                <Text style={styles.urgentPillText}>URGENT</Text>
              </View>
            ) : isFulfilled ? (
              <View style={styles.fulfilledPill}>
                <Feather
                  name="check"
                  size={11}
                  color="#059669"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.fulfilledPillText}>FULFILLED</Text>
              </View>
            ) : null}

            <Text style={styles.timestampText}>
              {formatCardDateTime(post.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.patientBlock}>
          <Text style={styles.patientName} numberOfLines={2}>
            {post.patientName}
          </Text>
          {post.patientCondition ? (
            <Text style={styles.patientCondition} numberOfLines={2}>
              {post.patientCondition}
            </Text>
          ) : null}
        </View>

        <View style={styles.locationBlock}>
          <Feather
            name="map-pin"
            size={14}
            color={BENTO_COLORS.subtleText}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText} numberOfLines={2}>
            {post.location}
          </Text>
        </View>

        <View style={styles.contactBlock}>
          <View style={styles.contactInfo}>
            <Feather
              name="phone"
              size={14}
              color="#059669"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.contactPhoneText} numberOfLines={1}>
              {post.contactPhone}
            </Text>
          </View>

          <View style={styles.contactActions}>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => handleCopyPhone(post.contactPhone)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Copy phone number"
            >
              <Feather name="copy" size={13} color={BENTO_COLORS.subtleText} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(post.contactPhone)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Call contact"
            >
              <Feather
                name="phone-call"
                size={12}
                color="#ffffff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <TouchableOpacity
          style={styles.requesterRow}
          onPress={() => setSelectedProfile(post.author || null)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Requester: ${post.author?.name || "Campus Member"}. Tap to view profile.`}
        >
          {post.author?.image ? (
            <Image
              source={{ uri: post.author.image }}
              style={styles.requesterAvatar}
            />
          ) : (
            <View style={styles.requesterAvatarFallback}>
              <Text style={styles.requesterAvatarText}>
                {post.author?.name?.charAt(0) || "U"}
              </Text>
            </View>
          )}

          <View style={styles.requesterMeta}>
            <Text style={styles.requesterName} numberOfLines={1}>
              {post.author?.name || "Campus Member"}
            </Text>
            <Text style={styles.requesterSubtitle} numberOfLines={1}>
              {getUserSubtitle(post.author)}
            </Text>
          </View>

          <Feather
            name="chevron-right"
            size={16}
            color={BENTO_COLORS.subtleText}
          />
        </TouchableOpacity>

        {isAuthor && (
          <View style={styles.authorActionsRow}>
            {!post.isFulfilled && (
              <TouchableOpacity
                style={styles.actionBtnResolve}
                onPress={handleResolvePress}
                disabled={resolveMutation.isPending}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Mark request as fulfilled"
              >
                <Feather
                  name="check-circle"
                  size={14}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.actionBtnTextResolve}>Mark Fulfilled</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionBtnDelete}
              onPress={handleDeletePress}
              disabled={deleteMutation.isPending}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete blood request"
            >
              <Feather
                name="trash-2"
                size={14}
                color={BENTO_COLORS.crimson}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.actionBtnTextDelete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.volunteersHeaderRow}>
        <Text style={styles.volunteersSectionTitle}>
          Volunteers ({post.responses?.length || 0})
        </Text>
      </View>
    </View>
  );

  const renderReply = ({ item }: { item: BloodResponseItem }) => (
    <TouchableOpacity
      style={styles.volunteerCard}
      onPress={() => setSelectedProfile(item.responder || null)}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Volunteer ${item.responder?.name || "Member"}. Tap to view profile.`}
    >
      {item.responder?.image ? (
        <Image
          source={{ uri: item.responder.image }}
          style={styles.volunteerAvatar}
        />
      ) : (
        <View style={styles.volunteerAvatarFallback}>
          <Text style={styles.volunteerAvatarText}>
            {item.responder?.name?.charAt(0) || "U"}
          </Text>
        </View>
      )}

      <View style={styles.volunteerInfoBlock}>
        <Text style={styles.volunteerName} numberOfLines={1}>
          {item.responder?.name || "Campus Volunteer"}
        </Text>
        <View style={styles.volunteerSubRow}>
          {item.responder?.phoneNumber ? (
            <Text style={styles.volunteerPhone} numberOfLines={1}>
              {item.responder.phoneNumber}
            </Text>
          ) : null}
          {item.responder?.phoneNumber ? (
            <Text style={styles.volunteerDotSeparator}>•</Text>
          ) : null}
          <Text style={styles.volunteerTime} numberOfLines={1}>
            {formatCardDateTime(item.createdAt)}
          </Text>
        </View>
      </View>

      {item.responder?.phoneNumber && (
        <TouchableOpacity
          style={styles.volunteerCallBtn}
          onPress={() => handleCall(item.responder?.phoneNumber || undefined)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Call ${item.responder?.name}`}
        >
          <Feather name="phone-call" size={13} color="#059669" />
        </TouchableOpacity>
      )}

      <Feather
        name="chevron-right"
        size={16}
        color={BENTO_COLORS.subtleText}
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.headerIconButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Request</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.headerIconButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Share blood request"
        >
          <Feather name="share-2" size={18} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={post.responses || []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderOriginalPost}
        renderItem={renderReply}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: !isAuthor ? insets.bottom + 84 : insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        ListEmptyComponent={
          <View style={styles.emptyVolunteersCard}>
            <Feather
              name="users"
              size={24}
              color={BENTO_COLORS.subtleText}
              style={{ marginBottom: 6 }}
            />
            <Text style={styles.emptyVolunteersTitle}>No Volunteers Yet</Text>
            <Text style={styles.emptyVolunteersDesc}>
              Be the first to step forward and support this patient.
            </Text>
          </View>
        }
      />

      {!isAuthor && (
        <View
          style={[
            styles.footerContainer,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          {post.isFulfilled ? (
            <View style={styles.fulfilledBanner}>
              <Feather
                name="check-circle"
                size={16}
                color="#059669"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.fulfilledBannerText}>
                This request has been fulfilled.
              </Text>
            </View>
          ) : hasVolunteered ? (
            <View style={styles.volunteeredBadge}>
              <Feather
                name="check"
                size={16}
                color="#059669"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.volunteeredText}>
                You have volunteered to donate
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.volunteerBtn}
              onPress={handleVolunteer}
              disabled={respondMutation.isPending}
              activeOpacity={0.88}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Volunteer to donate blood"
            >
              {respondMutation.isPending ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Feather
                    name="heart"
                    size={16}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.volunteerBtnText}>
                    Volunteer to Donate
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Lazy mounted modals */}
      {!!selectedProfile && (
        <BloodProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onCall={handleCall}
          onCopyPhone={handleCopyPhone}
        />
      )}

      {confirmModal.visible && (
        <BloodConfirmModal
          visible={confirmModal.visible}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmColor={confirmModal.confirmColor}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: BENTO_COLORS.background,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...BENTO_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  postHeaderContainer: {
    marginBottom: 8,
  },
  mainBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...BENTO_COLORS.shadow,
  },
  cardUrgent: {
    borderColor: "rgba(190, 18, 60, 0.16)",
    borderLeftWidth: 3.5,
    borderLeftColor: BENTO_COLORS.crimson,
  },
  cardFulfilled: {
    backgroundColor: "#fafdfb",
    borderColor: "#bbf7d0",
    borderLeftWidth: 3.5,
    borderLeftColor: "#10b981",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  bloodBadgeNormal: {
    backgroundColor: "#e11d48",
  },
  bloodBadgeUrgent: {
    backgroundColor: BENTO_COLORS.crimson,
  },
  bloodBadgeFulfilled: {
    backgroundColor: "#059669",
  },
  bloodBadgeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  bagsBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  bagsBadgeFulfilled: {
    backgroundColor: "#dcfce7",
    borderColor: "rgba(5, 150, 105, 0.15)",
  },
  bagsBadgeText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  bagsBadgeTextFulfilled: {
    color: "#059669",
  },
  statusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.15)",
  },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BENTO_COLORS.crimson,
    marginRight: 4,
  },
  urgentPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
  },
  fulfilledPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  fulfilledPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
  },
  timestampText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  patientBlock: {
    marginBottom: 10,
  },
  patientName: {
    fontFamily,
    fontSize: 22,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  patientCondition: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: "#475569",
    marginTop: 2,
  },
  locationBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
    flex: 1,
  },
  contactBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  contactPhoneText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  contactActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callBtnText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginVertical: 14,
  },
  requesterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  requesterAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },
  requesterAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  requesterAvatarText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  requesterMeta: {
    flex: 1,
    marginRight: 6,
  },
  requesterName: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  requesterSubtitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 1,
  },
  authorActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 12,
  },
  actionBtnResolve: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnTextResolve: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  actionBtnDelete: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnTextDelete: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },
  volunteersHeaderRow: {
    marginTop: 4,
    marginBottom: 10,
  },
  volunteersSectionTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  volunteerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    padding: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...BENTO_COLORS.shadow,
  },
  volunteerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },
  volunteerAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  volunteerAvatarText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  volunteerInfoBlock: {
    flex: 1,
    marginRight: 8,
  },
  volunteerName: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
    marginBottom: 2,
  },
  volunteerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  volunteerPhone: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  volunteerDotSeparator: {
    fontSize: 10,
    color: "#94a3b8",
    marginHorizontal: 5,
  },
  volunteerTime: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
    flexShrink: 1,
  },
  volunteerCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  emptyVolunteersCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...BENTO_COLORS.shadow,
  },
  emptyVolunteersTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 2,
  },
  emptyVolunteersDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: BENTO_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  fulfilledBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  fulfilledBannerText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  volunteeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  volunteeredText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  volunteerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.crimson,
    height: 48,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.shadow,
  },
  volunteerBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
