import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  BackHandler,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentUser } from "@/hooks/use-current-user";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing, rounded, shadows } from "@/theme/layout";
import { format12HourTime } from "@/utils/date-formatter";
import {
  useBloodFeed,
  useCreateBloodPost,
} from "@/features/blood/useBlood";
import Toast from "react-native-toast-message";

export function Blood() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  const [activeFilter, setActiveFilter] = useState("URGENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeVisible, setIsComposeVisible] = useState(false);

  const [newPost, setNewPost] = useState({
    patientName: "",
    patientCondition: "",
    bloodGroup: "A_POSITIVE",
    location: "",
    urgency: "High",
    contactPhone: currentUser?.phoneNumber || "",
  });

  const { data: posts, isLoading } = useBloodFeed();
  const createPostMutation = useCreateBloodPost();

  const verifyProfileAndCompose = () => {
    if (!currentUser?.bloodGroup || !currentUser?.phoneNumber) {
      Alert.alert(
        "Profile Incomplete",
        "You must update your Profile to include your Blood Group and Phone Number before requesting or donating blood.",
        [{ text: "OK", style: "default" }],
      );
      return;
    }
    setIsComposeVisible(true);
  };

  const handlePost = () => {
    if (
      !newPost.patientName ||
      !newPost.patientCondition ||
      !newPost.location ||
      !newPost.contactPhone
    ) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "All fields are required.",
      });
      return;
    }

    createPostMutation.mutate(newPost, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Request Posted!" });
        setIsComposeVisible(false);
        setNewPost({
          ...newPost,
          patientName: "",
          patientCondition: "",
          location: "",
        });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to post",
          text2: err.message,
        });
      },
    });
  };

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let filtered = posts;
    if (activeFilter === "URGENT")
      filtered = filtered.filter(
        (p: any) => !p.isFulfilled && p.urgency === "High",
      );
    if (activeFilter === "ALL")
      filtered = filtered.filter((p: any) => !p.isFulfilled);
    if (activeFilter === "FULFILLED")
      filtered = filtered.filter((p: any) => p.isFulfilled);

    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.bloodGroup.includes(lowerQ.toUpperCase()) ||
          p.location.toLowerCase().includes(lowerQ),
      );
    }
    return filtered;
  }, [posts, activeFilter, searchQuery]);

  const renderPostCard = ({ item }: { item: any }) => {
    const formattedBloodGroup = item.bloodGroup.replace("_", " ");

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card]}
        activeOpacity={0.8}
        onPress={() => router.push(`/blood/${item.id}`)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Blood request: ${formattedBloodGroup} for patient ${item.patientName} at ${item.location}. ${item.urgency === "High" ? "Urgent." : ""} ${item.isFulfilled ? "Fulfilled." : ""}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.bloodBadge}>
            <Feather
              name="droplet"
              size={16}
              color="#FFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.bloodBadgeText}>{formattedBloodGroup}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.timeText}>
              {format12HourTime(item.createdAt)}
            </Text>
            {item.urgency === "High" && !item.isFulfilled && (
              <Text style={styles.urgentText}>URGENT</Text>
            )}
            {item.isFulfilled && (
              <Text style={styles.fulfilledText}>FULFILLED</Text>
            )}
          </View>
        </View>

        <Text style={styles.patientName}>Patient: {item.patientName}</Text>

        <View style={styles.infoRow}>
          <Feather
            name="map-pin"
            size={14}
            color={colors.outline}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            {item.author?.image ? (
              <Image
                source={{ uri: item.author.image }}
                style={styles.avatarImageSm}
                accessible={true}
                accessibilityLabel={`${item.author.name || "Author"}'s avatar`}
              />
            ) : (
              <View style={styles.avatarFallbackSm}>
                <Text style={styles.avatarTextSm}>
                  {item.author?.name?.charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.authorNameSm}>
              Posted by {item.author?.name?.split(" ")[0]}
            </Text>
          </View>

          <View style={styles.responseBadge}>
            <Text style={styles.responseText}>
              {item._count?.responses || 0} Donors
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (!isComposeVisible) return;

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setIsComposeVisible(false);
        return true;
      },
    );

    return () => backHandler.remove();
  }, [isComposeVisible]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Bank Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color={colors.outline}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location or group..."
            placeholderTextColor={colors.outlineVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search by location or blood group"
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {(["URGENT", "ALL", "FULFILLED"] as const).map((filter) => {
          const filterLabels: Record<string, string> = {
            URGENT: "Urgent",
            ALL: "All Requests",
            FULFILLED: "Fulfilled",
          };
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.tabButton,
                activeFilter === filter && styles.tabButtonActive,
              ]}
              onPress={() => setActiveFilter(filter)}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel={`${filterLabels[filter] || filter} requests tab`}
            >
              <Text
                style={[
                  styles.tabText,
                  activeFilter === filter && styles.tabTextActive,
                ]}
              >
                {filterLabels[filter] || filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
      ) : !filteredPosts || filteredPosts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather
            name="heart"
            size={48}
            color={colors.surfaceContainerHighest}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Requests Found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
        onPress={verifyProfileAndCompose}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Request blood donation"
      >
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Request Form Modal */}
      <Modal
        visible={isComposeVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsComposeVisible(false)}
      >
        <SafeAreaView 
          style={styles.modalContainer}
          accessibilityViewIsModal={true}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setIsComposeVisible(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel blood request"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Request Blood</Text>
              <TouchableOpacity
                onPress={handlePost}
                disabled={createPostMutation.isPending}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Submit blood request"
              >
                {createPostMutation.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.postTextBtn}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.label}>Patient Name</Text>
              <TextInput
                style={styles.input}
                value={newPost.patientName}
                onChangeText={(text) =>
                  setNewPost({ ...newPost, patientName: text })
                }
                placeholder="Enter patient name"
                accessible={true}
                accessibilityLabel="Patient Name"
              />

              <Text style={styles.label}>Patient Condition / Reason</Text>
              <TextInput
                style={styles.input}
                value={newPost.patientCondition}
                onChangeText={(text) =>
                  setNewPost({ ...newPost, patientCondition: text })
                }
                placeholder="e.g. Dengue, Surgery, Accident"
                accessible={true}
                accessibilityLabel="Patient Condition or Reason"
              />

              <Text style={styles.label}>Blood Group Needed</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newPost.bloodGroup}
                  onValueChange={(itemValue) =>
                    setNewPost({ ...newPost, bloodGroup: itemValue })
                  }
                  accessibilityLabel="Blood Group Needed"
                >
                  <Picker.Item label="A+" value="A_POSITIVE" />
                  <Picker.Item label="A-" value="A_NEGATIVE" />
                  <Picker.Item label="B+" value="B_POSITIVE" />
                  <Picker.Item label="B-" value="B_NEGATIVE" />
                  <Picker.Item label="O+" value="O_POSITIVE" />
                  <Picker.Item label="O-" value="O_NEGATIVE" />
                  <Picker.Item label="AB+" value="AB_POSITIVE" />
                  <Picker.Item label="AB-" value="AB_NEGATIVE" />
                </Picker>
              </View>

              <Text style={styles.label}>Hospital / Location</Text>
              <TextInput
                style={styles.input}
                value={newPost.location}
                onChangeText={(text) =>
                  setNewPost({ ...newPost, location: text })
                }
                placeholder="e.g. Dhaka Medical College"
                accessible={true}
                accessibilityLabel="Hospital or Location"
              />

              <Text style={styles.label}>Your Contact Number</Text>
              <TextInput
                style={styles.input}
                value={newPost.contactPhone}
                onChangeText={(text) =>
                  setNewPost({ ...newPost, contactPhone: text })
                }
                keyboardType="phone-pad"
                accessible={true}
                accessibilityLabel="Contact Phone Number"
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: spacing.stackMd,
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
  },
  backBtn: { padding: spacing.stackSm },
  headerTitle: { ...typography.headlineMd, color: colors.onSurface },

  searchWrapper: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.stackMd,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.stackMd,
    height: 48,
  },
  searchIcon: { marginRight: spacing.stackSm },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    height: "100%",
  },

  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.marginMobile,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.stackMd,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: "#D32F2F" },
  tabText: { ...typography.labelMd, color: colors.outline },
  tabTextActive: { color: "#D32F2F", fontWeight: "700" },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "600",
  },

  listContent: { padding: spacing.marginMobile, paddingBottom: 120 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.stackLg,
    marginBottom: spacing.stackMd,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    ...shadows.level1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.stackMd,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D32F2F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: rounded.md,
  },
  bloodBadgeText: { ...typography.bodyLg, color: "#FFF", fontWeight: "800" },
  timeText: { ...typography.labelSm, color: colors.outline, marginBottom: 2 },
  urgentText: { ...typography.labelSm, color: "#D32F2F", fontWeight: "800" },
  fulfilledText: { ...typography.labelSm, color: "#2E7D32", fontWeight: "800" },

  patientName: {
    ...typography.bodyLg,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "700",
    marginBottom: spacing.stackSm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  infoText: { ...typography.bodyMd, color: colors.onSurfaceVariant },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainerHighest,
  },
  authorRow: { flexDirection: "row", alignItems: "center" },
  avatarFallbackSm: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarImageSm: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  avatarTextSm: { fontSize: 10, color: colors.onPrimary, fontWeight: "700" },
  authorNameSm: { ...typography.labelSm, color: colors.outline },
  responseBadge: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  responseText: { ...typography.labelSm, color: "#D32F2F", fontWeight: "700" },

  fab: {
    position: "absolute",
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
    ...shadows.level1,
  },

  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "700",
  },

  modalContent: { flex: 1, padding: spacing.marginMobile },
  label: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  pickerContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    overflow: "hidden",
  },
});
