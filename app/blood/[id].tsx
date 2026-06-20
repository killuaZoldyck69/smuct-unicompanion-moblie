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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import api from "../../src/services/api";
import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing, rounded, shadows } from "../../src/theme/layout";

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
  if (user.studentProfile)
    return `${user.studentProfile.department} • Sem ${user.studentProfile.currentSemester}`;
  if (user.teacherProfile)
    return `${user.teacherProfile.designation} • ${user.teacherProfile.department}`;
  return "University Member";
};

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
      Toast.show({
        type: "success",
        text1: "Response Sent",
        text2: "Thank you for volunteering!",
      });
    },
    onError: (err: any) =>
      Toast.show({
        type: "error",
        text1: "Failed to respond",
        text2: err.message,
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
        [{ text: "OK" }],
      );
      return;
    }
    Alert.alert(
      "Volunteer to Donate",
      "Are you sure you want to volunteer? The patient's family will be able to see your contact number.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => respondMutation.mutate() },
      ],
    );
  };

  if (isLoading || !post) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  const isAuthor = currentUser?.id === post.authorId;
  const hasVolunteered = post.responses?.some(
    (r: any) => r.responderId === currentUser?.id,
  );

  const renderOriginalPost = () => (
    <View style={styles.originalPostContainer}>
      <View style={styles.titleRow}>
        <View style={styles.bloodBadgeBig}>
          <Text style={styles.bloodBadgeTextBig}>
            {post.bloodGroup.replace("_", " ")}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: spacing.stackMd }}>
          <Text style={styles.patientName}>{post.patientName}</Text>
          <Text style={styles.timeText}>
            {format12HourTime(post.createdAt)}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        {/* NEW: Patient Condition Info Row */}
        <View style={styles.infoRow}>
          <Feather
            name="activity"
            size={16}
            color={colors.outline}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Condition: {post.patientCondition}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Feather
            name="map-pin"
            size={16}
            color={colors.outline}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{post.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Feather
            name="phone"
            size={16}
            color={colors.outline}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{post.contactPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Feather
            name="alert-circle"
            size={16}
            color={colors.outline}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>Urgency: {post.urgency}</Text>
        </View>
      </View>

      <View style={styles.authorSection}>
        <Text style={styles.sectionHeader}>Requested By</Text>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => setSelectedProfile(post.author)}
        >
          {post.author?.image ? (
            <Image
              source={{ uri: post.author.image }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {post.author?.name?.charAt(0)}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.authorName}>{post.author?.name}</Text>
            <Text style={styles.authorSubtitle}>
              {getUserSubtitle(post.author)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {isAuthor && (
        <View style={styles.authorActionsRow}>
          {!post.isFulfilled && (
            <TouchableOpacity
              style={styles.actionBtnResolve}
              onPress={() => resolveMutation.mutate()}
            >
              <Feather
                name="check-circle"
                size={14}
                color={colors.onPrimary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.actionBtnTextResolve}>Mark Fulfilled</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionBtnDelete}
            onPress={() => deleteMutation.mutate()}
          >
            <Feather
              name="trash-2"
              size={14}
              color={colors.error}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.actionBtnTextDelete}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.divider} />
      <Text style={styles.responseCountHeader}>
        {post.responses?.length || 0} Volunteer
        {post.responses?.length === 1 ? "" : "s"}
      </Text>
    </View>
  );

  const renderReply = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.replyCard}
      onPress={() => setSelectedProfile(item.responder)}
    >
      {item.responder?.image ? (
        <Image
          source={{ uri: item.responder.image }}
          style={styles.replyAvatarImage}
        />
      ) : (
        <View style={styles.replyAvatarFallback}>
          <Text style={styles.replyAvatarText}>
            {item.responder?.name?.charAt(0)}
          </Text>
        </View>
      )}
      <View style={styles.replyContentBlock}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyAuthorName}>{item.responder?.name}</Text>
          <Text style={styles.replyTimeText}>
            {format12HourTime(item.createdAt)}
          </Text>
        </View>
        <Text style={styles.replyPhone}>
          Phone: {item.responder?.phoneNumber || "Not provided"}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.outline} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={post.responses || []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderOriginalPost}
        renderItem={renderReply}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
      />

      {/* Footer Action Bar */}
      <View
        style={[
          styles.footerContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {post.isFulfilled ? (
          <View style={styles.fulfilledBadgeFull}>
            <Text style={styles.fulfilledTextFull}>
              This request has been fulfilled.
            </Text>
          </View>
        ) : isAuthor ? (
          <Text style={styles.authorFooterText}>
            You are the author of this request.
          </Text>
        ) : hasVolunteered ? (
          <View style={styles.volunteeredBadge}>
            <Feather
              name="check"
              size={16}
              color={colors.onPrimary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.volunteeredText}>You have volunteered</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.volunteerBtn}
            onPress={handleVolunteer}
            disabled={respondMutation.isPending}
          >
            {respondMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Feather
                  name="heart"
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.volunteerBtnText}>I Want to Donate</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* --- USER PROFILE INFO MODAL --- */}
      <Modal
        visible={!!selectedProfile}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalCard}>
            <TouchableOpacity
              style={styles.profileCloseBtn}
              onPress={() => setSelectedProfile(null)}
            >
              <Feather name="x" size={20} color={colors.onSurface} />
            </TouchableOpacity>

            {selectedProfile?.image ? (
              <Image
                source={{ uri: selectedProfile.image }}
                style={styles.profileModalAvatarImage}
              />
            ) : (
              <View style={styles.profileModalAvatarFallback}>
                <Text style={styles.profileModalAvatarText}>
                  {selectedProfile?.name?.charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.profileModalName}>{selectedProfile?.name}</Text>

            <View style={styles.profileMetaBox}>
              <Text style={styles.profileMetaLabel}>Blood Group:</Text>
              <Text style={styles.profileMetaValueRed}>
                {selectedProfile?.bloodGroup?.replace("_", " ") || "Unknown"}
              </Text>
            </View>

            <View style={styles.profileInfoBox}>
              <Text style={styles.profileInfoText}>
                {getUserSubtitle(selectedProfile)}
              </Text>
              <Text style={styles.profileInfoTextSub}>
                {selectedProfile?.phoneNumber || "No Phone Number"}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  backBtn: { padding: spacing.stackSm, marginLeft: spacing.stackSm },
  headerTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
  },

  listContent: { paddingBottom: spacing.sectionBreak },
  originalPostContainer: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.marginMobile,
    marginBottom: spacing.stackSm,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackLg,
  },
  bloodBadgeBig: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: rounded.md,
  },
  bloodBadgeTextBig: {
    ...typography.headlineMd,
    color: "#FFF",
    fontWeight: "800",
  },
  patientName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: 2,
  },
  timeText: { ...typography.labelSm, color: colors.outline },

  infoBox: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackLg,
    borderRadius: rounded.md,
    marginBottom: spacing.stackLg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackSm,
  },
  infoIcon: { marginRight: spacing.stackMd, width: 20 },
  infoText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
  },

  authorSection: { marginTop: spacing.stackSm },
  sectionHeader: {
    ...typography.labelSm,
    color: colors.outline,
    textTransform: "uppercase",
    marginBottom: spacing.stackMd,
  },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.stackMd,
  },
  avatarText: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  authorName: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  authorSubtitle: {
    ...typography.labelSm,
    color: colors.outline,
    marginTop: 2,
  },

  authorActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.stackLg,
    gap: spacing.stackMd,
  },
  actionBtnResolve: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
  },
  actionBtnTextResolve: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  actionBtnDelete: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.errorContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
  },
  actionBtnTextDelete: {
    ...typography.labelSm,
    color: colors.error,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: colors.surfaceContainerHighest,
    marginVertical: spacing.sectionBreak,
  },
  responseCountHeader: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackMd,
  },

  replyCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.stackMd,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  replyAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.stackMd,
  },
  replyAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.stackMd,
  },
  replyAvatarText: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  replyContentBlock: { flex: 1 },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  replyAuthorName: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  replyTimeText: { fontSize: 10, color: colors.outline },
  replyPhone: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 4,
  },

  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
    padding: spacing.marginMobile,
  },
  volunteerBtn: {
    flexDirection: "row",
    backgroundColor: "#D32F2F",
    height: 50,
    borderRadius: rounded.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  volunteerBtnText: { ...typography.bodyLg, color: "#FFF", fontWeight: "700" },
  volunteeredBadge: {
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    height: 50,
    borderRadius: rounded.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  volunteeredText: { ...typography.bodyLg, color: "#FFF", fontWeight: "700" },
  fulfilledBadgeFull: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: 16,
    borderRadius: rounded.lg,
    alignItems: "center",
  },
  fulfilledTextFull: {
    ...typography.bodyMd,
    color: colors.outline,
    fontStyle: "italic",
  },
  authorFooterText: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 10,
  },

  // Info Modal Styles
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.marginMobile,
  },
  profileModalCard: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    alignItems: "center",
    ...shadows.level1,
  },
  profileCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.full,
  },
  profileModalAvatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.stackLg,
    marginTop: spacing.stackLg,
  },
  profileModalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.stackLg,
    marginTop: spacing.stackLg,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  profileModalAvatarText: {
    fontSize: 32,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  profileModalName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackMd,
  },

  profileMetaBox: {
    flexDirection: "row",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: rounded.full,
    marginBottom: spacing.stackLg,
  },
  profileMetaLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginRight: 6,
  },
  profileMetaValueRed: {
    ...typography.labelMd,
    color: "#D32F2F",
    fontWeight: "800",
  },

  profileInfoBox: {
    width: "100%",
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    alignItems: "center",
  },
  profileInfoText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "600",
    textAlign: "center",
  },
  profileInfoTextSub: {
    ...typography.bodyMd,
    color: colors.primary,
    marginTop: 6,
    fontWeight: "700",
  },
});
