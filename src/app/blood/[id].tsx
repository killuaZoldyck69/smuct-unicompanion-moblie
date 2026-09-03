import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Alert,
  Modal,
  Linking,
  Share,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

import api from "@/services/api";
import { authClient } from "@/services/auth-client";

// ==================================================
// 1. SOFT CAMPUS BENTO DESIGN SYSTEM CONSTANTS
// ==================================================
const BENTO_COLORS = {
  background: "#f7f9fb",
  deepNavy: "#131b2e",
  white: "#ffffff",
  neutralText: "#191c1d",
  subtleText: "#64748b",
  crimson: "#be123c",
  cardRadius: 24,
  pillRadius: 9999,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  heroShadow: {
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 6,
  },
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const format12HourTime = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
};

const getUserSubtitle = (user: any) => {
  if (!user) return "";
  if (user.studentProfile) {
    return `${user.studentProfile.department} • Sem ${user.studentProfile.currentSemester}`;
  }
  if (user.teacherProfile) {
    return `${user.teacherProfile.designation} • ${user.teacherProfile.department}`;
  }
  return "University Member";
};

// ==================================================
// 2. MAIN COMPONENT
// ==================================================
export default function BloodThreadScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user as any;

  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ["bloodThread", id],
    queryFn: async () => {
      const response = await api.get(`/blood/${id}`);
      return response.data?.data;
    },
  });

  const respondMutation = useMutation({
    mutationFn: async () =>
      await api.post(`/blood/${id}/respond`, {
        message: "I am available to donate blood.",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodThread", id] });
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
      Toast.show({
        type: "success",
        text1: "Volunteered Successfully!",
        text2: "Thank you for being a lifesaver.",
      });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to respond",
        text2: err.message || "Could not record volunteer response.",
      }),
  });

  const resolveMutation = useMutation({
    mutationFn: async () => await api.patch(`/blood/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodThread", id] });
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
      Toast.show({ type: "success", text1: "Marked as Fulfilled" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await api.delete(`/blood/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bloodPosts"] });
      Toast.show({ type: "info", text1: "Request Deleted" });
      router.back();
    },
  });

  const handleVolunteer = () => {
    if (!currentUser?.bloodGroup || !currentUser?.phoneNumber) {
      Alert.alert(
        "Profile Incomplete",
        "You must add your Blood Group and Phone Number to your profile before you can volunteer.",
        [{ text: "OK" }]
      );
      return;
    }
    Alert.alert(
      "Volunteer to Donate",
      "Are you sure you want to volunteer? The patient's family will be able to see your contact number.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => respondMutation.mutate() },
      ]
    );
  };

  const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Toast.show({
        type: "error",
        text1: "Cannot Make Call",
        text2: "Your device does not support direct phone calls.",
      });
    });
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      const bg = post.bloodGroup.replace("_", " ");
      const msg = `🩸 URGENT BLOOD NEEDED: ${bg}\n\nPatient: ${post.patientName}\nCondition: ${
        post.patientCondition || "Emergency"
      }\nHospital: ${post.location}\nEmergency Contact: ${
        post.contactPhone
      }\n\nPlease help or share! (Via SMUCT UniCompanion)`;
      await Share.share({ message: msg });
    } catch {
      // Ignored
    }
  };

  const handleCopyPhone = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    Toast.show({
      type: "success",
      text1: "Copied Phone Number",
      text2: phone,
    });
  };

  if (isLoading || !post) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={BENTO_COLORS.crimson} />
      </SafeAreaView>
    );
  }

  const isAuthor = currentUser?.id === post.authorId;
  const hasVolunteered = post.responses?.some(
    (r: any) => r.responderId === currentUser?.id
  );
  const formattedBloodGroup = post.bloodGroup.replace("_", " ");

  const renderOriginalPost = () => (
    <View style={styles.postHeaderContainer}>
      {/* 1. HERO PATIENT & BLOOD GROUP BENTO CARD */}
      <View style={styles.heroBentoCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroTagPill}>
            <Text style={styles.heroTagText}>EMERGENCY CASE</Text>
          </View>
          {post.isFulfilled ? (
            <View style={styles.fulfilledPill}>
              <Text style={styles.fulfilledPillText}>✓ FULFILLED</Text>
            </View>
          ) : post.urgency === "High" ? (
            <View style={styles.urgentAlertPill}>
              <View style={styles.pulseDot} />
              <Text style={styles.urgentAlertText}>HIGH URGENCY</Text>
            </View>
          ) : null}
        </View>

        {/* Big Blood Group Badge */}
        <View style={styles.bloodBadgeHeroPill}>
          <Feather
            name="droplet"
            size={16}
            color="#ffffff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.bloodBadgeHeroText}>
            {formattedBloodGroup}
          </Text>
        </View>

        <Text style={styles.heroPatientName}>
          {post.patientName}
        </Text>

        <Text style={styles.heroTimeText}>
          Requested on {format12HourTime(post.createdAt)}
        </Text>
      </View>

      {/* 2. CASE OVERVIEW & VENUE BENTO CARD */}
      <View style={styles.detailsBentoCard}>
        <Text style={styles.bentoSectionLabel}>CASE OVERVIEW & VENUE</Text>

        {/* Condition */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconBox}>
            <Feather name="activity" size={16} color={BENTO_COLORS.crimson} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailItemLabel}>CONDITION / REASON</Text>
            <Text style={styles.detailItemValue}>
              {post.patientCondition || "Urgent Medical Emergency"}
            </Text>
          </View>
        </View>

        <View style={styles.detailDivider} />

        {/* Location */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconBox}>
            <Feather name="map-pin" size={16} color={BENTO_COLORS.deepNavy} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailItemLabel}>HOSPITAL / VENUE</Text>
            <Text style={styles.detailItemValue}>{post.location}</Text>
          </View>
        </View>

        <View style={styles.detailDivider} />

        {/* Emergency Phone with Direct Call */}
        <View style={styles.detailRow}>
          <View style={styles.detailIconBox}>
            <Feather name="phone" size={16} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailItemLabel}>EMERGENCY CONTACT</Text>
            <Text style={styles.detailItemValue}>{post.contactPhone}</Text>
          </View>
          <TouchableOpacity
            style={styles.callActionBtn}
            onPress={() => handleCall(post.contactPhone)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Call emergency contact at ${post.contactPhone}`}
          >
            <Feather
              name="phone-call"
              size={13}
              color="#ffffff"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.callActionBtnText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. REQUESTED BY SECTION */}
      <View style={styles.requesterBentoCard}>
        <Text style={styles.bentoSectionLabel}>POSTED BY</Text>
        <TouchableOpacity
          style={styles.requesterRow}
          onPress={() => setSelectedProfile(post.author)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`View profile of ${post.author?.name}`}
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
          <View style={{ flex: 1 }}>
            <Text style={styles.requesterName}>{post.author?.name}</Text>
            <Text style={styles.requesterSubtitle}>
              {getUserSubtitle(post.author)}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={16}
            color={BENTO_COLORS.subtleText}
          />
        </TouchableOpacity>

        {/* Author Controls */}
        {isAuthor && (
          <View style={styles.authorActionsRow}>
            {!post.isFulfilled && (
              <TouchableOpacity
                style={styles.actionBtnResolve}
                onPress={() => resolveMutation.mutate()}
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
              onPress={() => {
                Alert.alert(
                  "Delete Request",
                  "Are you sure you want to delete this blood request?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => deleteMutation.mutate(),
                    },
                  ]
                );
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete blood request"
            >
              <Feather
                name="trash-2"
                size={14}
                color={BENTO_COLORS.crimson}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionBtnTextDelete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 4. VOLUNTEERS SECTION HEADER */}
      <View style={styles.volunteersHeaderRow}>
        <Text style={styles.volunteersSectionTitle}>
          {post.responses?.length || 0} Volunteer
          {post.responses?.length === 1 ? "" : "s"}
        </Text>
        <Text style={styles.volunteersSectionSubtitle}>
          Community members ready to donate
        </Text>
      </View>
    </View>
  );

  const renderReply = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.volunteerCard}
      onPress={() => setSelectedProfile(item.responder)}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Volunteer: ${item.responder?.name}, Phone: ${
        item.responder?.phoneNumber || "Not provided"
      }. Tap to view profile.`}
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
        <View style={styles.volunteerTopRow}>
          <Text style={styles.volunteerName} numberOfLines={1}>
            {item.responder?.name}
          </Text>
          <Text style={styles.volunteerTime}>
            {format12HourTime(item.createdAt)}
          </Text>
        </View>

        <Text style={styles.volunteerPhone}>
          Phone: {item.responder?.phoneNumber || "Not provided"}
        </Text>
      </View>

      {item.responder?.phoneNumber && (
        <TouchableOpacity
          style={styles.volunteerCallBtn}
          onPress={() => handleCall(item.responder?.phoneNumber)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Call volunteer ${item.responder?.name}`}
        >
          <Feather name="phone-call" size={13} color={BENTO_COLORS.deepNavy} />
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Request</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.headerIconButton}
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
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyVolunteersCard}>
            <Feather
              name="heart"
              size={28}
              color={BENTO_COLORS.subtleText}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptyVolunteersTitle}>No Volunteers Yet</Text>
            <Text style={styles.emptyVolunteersDesc}>
              Be the first lifesaver to step forward for this patient.
            </Text>
          </View>
        }
      />

      {/* FOOTER ACTION BAR */}
      <View
        style={[
          styles.footerContainer,
          { paddingBottom: Math.max(insets.bottom, 18) },
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
        ) : isAuthor ? (
          <View style={styles.authorNoticeBanner}>
            <Text style={styles.authorNoticeText}>
              You are the author of this emergency request.
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
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="I want to donate blood"
          >
            {respondMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Feather
                  name="heart"
                  size={18}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.volunteerBtnText}>I Want to Donate</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* USER PROFILE INFO MODAL */}
      <Modal visible={!!selectedProfile} animationType="fade" transparent={true}>
        <View
          style={styles.profileModalOverlay}
          accessibilityViewIsModal={true}
        >
          <View style={styles.profileModalCard}>
            <TouchableOpacity
              style={styles.profileCloseBtn}
              onPress={() => setSelectedProfile(null)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close profile details"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>

            {selectedProfile?.image ? (
              <Image
                source={{ uri: selectedProfile.image }}
                style={styles.profileModalAvatarImage}
              />
            ) : (
              <View style={styles.profileModalAvatarFallback}>
                <Text style={styles.profileModalAvatarText}>
                  {selectedProfile?.name?.charAt(0) || "U"}
                </Text>
              </View>
            )}

            <Text style={styles.profileModalName}>{selectedProfile?.name}</Text>

            {/* Blood Group Pill */}
            <View style={styles.profileBloodBadge}>
              <Feather
                name="droplet"
                size={12}
                color={BENTO_COLORS.crimson}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.profileBloodText}>
                {selectedProfile?.bloodGroup?.replace("_", " ") ||
                  "Unknown Group"}
              </Text>
            </View>

            <View style={styles.profileInfoBox}>
              <Text style={styles.profileInfoSubtitle}>
                {getUserSubtitle(selectedProfile)}
              </Text>
              <Text style={styles.profileInfoPhone}>
                {selectedProfile?.phoneNumber || "No Phone Provided"}
              </Text>
            </View>

            {selectedProfile?.phoneNumber && (
              <View style={styles.modalActionButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCallBtn}
                  onPress={() => handleCall(selectedProfile.phoneNumber)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Call volunteer"
                >
                  <Feather
                    name="phone-call"
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.modalCallBtnText}>Direct Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCopyBtn}
                  onPress={() => handleCopyPhone(selectedProfile.phoneNumber)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Copy volunteer phone number"
                >
                  <Feather
                    name="copy"
                    size={14}
                    color={BENTO_COLORS.deepNavy}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.modalCopyBtnText}>Copy Phone</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==================================================
// 3. STYLES
// ==================================================
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
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  postHeaderContainer: {
    marginBottom: 10,
  },

  // --- HERO BENTO CARD ---
  heroBentoCard: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    ...BENTO_COLORS.heroShadow,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTagPill: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  heroTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  urgentAlertPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  urgentAlertText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#fca5a5",
  },
  fulfilledPill: {
    backgroundColor: "rgba(16, 185, 129, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  fulfilledPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#6ee7b7",
  },
  bloodBadgeHeroPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.crimson,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BENTO_COLORS.pillRadius,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  bloodBadgeHeroText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  heroPatientName: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroTimeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.72)",
  },

  // --- DETAILS BENTO CARD ---
  detailsBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  bentoSectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailItemLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailItemValue: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginVertical: 12,
  },
  callActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  callActionBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  // --- REQUESTER BENTO CARD ---
  requesterBentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    marginBottom: 18,
    ...BENTO_COLORS.shadow,
  },
  requesterRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  requesterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  requesterAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  requesterAvatarText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  requesterName: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  requesterSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  authorActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 14,
  },
  actionBtnResolve: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  actionBtnTextDelete: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },

  // --- VOLUNTEERS HEADER ---
  volunteersHeaderRow: {
    marginBottom: 12,
  },
  volunteersSectionTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  volunteersSectionSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },

  // --- VOLUNTEER CARDS ---
  volunteerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    ...BENTO_COLORS.shadow,
  },
  volunteerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  volunteerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  volunteerAvatarText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  volunteerInfoBlock: {
    flex: 1,
  },
  volunteerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  volunteerName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  volunteerTime: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  volunteerPhone: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.deepNavy,
  },
  volunteerCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  emptyVolunteersCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 6,
    ...BENTO_COLORS.shadow,
  },
  emptyVolunteersTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 4,
  },
  emptyVolunteersDesc: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
  },

  // --- FOOTER CONTAINER ---
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: BENTO_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  fulfilledBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  fulfilledBannerText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },
  authorNoticeBanner: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  authorNoticeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
  },
  volunteeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ecfdf5",
    paddingVertical: 14,
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
    paddingVertical: 15,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.heroShadow,
  },
  volunteerBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },

  // --- PROFILE MODAL ---
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  profileModalCard: {
    width: "100%",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    ...BENTO_COLORS.heroShadow,
  },
  profileCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  profileModalAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  profileModalAvatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileModalAvatarText: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  profileModalName: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 8,
  },
  profileBloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    marginBottom: 14,
  },
  profileBloodText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
  },
  profileInfoBox: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: "100%",
    marginBottom: 16,
  },
  profileInfoSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    marginBottom: 4,
    textAlign: "center",
  },
  profileInfoPhone: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  modalActionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  modalCallBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalCopyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  modalCopyBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
