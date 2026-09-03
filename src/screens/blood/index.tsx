import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "@/hooks/use-current-user";
import { useBloodFeed, useCreateBloodPost } from "@/features/blood/useBlood";
import {
  BENTO_COLORS,
  BloodFilterType,
  fontFamily,
  NewBloodPostForm,
} from "./constants";
import { filterAndCountBloodPosts, validateBloodPostInput } from "./utils";
import { BloodPostCard } from "./components/blood-post-card";
import { BloodHeroCard } from "./components/blood-hero-card";
import { BloodFilterPills } from "./components/blood-filter-pills";
import { ComposeBloodModal } from "./components/compose-blood-modal";
import {
  BloodSkeleton,
  BloodError,
  BloodEmpty,
} from "./components/blood-states";

export { BENTO_COLORS } from "./constants";
export { formatBloodGroup } from "./utils";

export function Blood() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useCurrentUser();

  const [activeFilter, setActiveFilter] = useState<BloodFilterType>("URGENT");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeVisible, setIsComposeVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [newPost, setNewPost] = useState<NewBloodPostForm>({
    patientName: "",
    patientCondition: "",
    bloodGroup: "A_POSITIVE",
    location: "",
    urgency: "High",
    contactPhone: currentUser?.phoneNumber || "",
  });

  const { data: posts, isLoading, isError, refetch } = useBloodFeed();
  const createPostMutation = useCreateBloodPost();

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const verifyProfileAndCompose = useCallback(() => {
    if (!currentUser?.bloodGroup || !currentUser?.phoneNumber) {
      Alert.alert(
        "Profile Incomplete",
        "You must update your Profile to include your Blood Group and Phone Number before requesting or donating blood.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    setIsComposeVisible(true);
  }, [currentUser]);

  const handlePost = useCallback(() => {
    const { isValid, error } = validateBloodPostInput(newPost);
    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: error || "All fields are required.",
      });
      return;
    }

    createPostMutation.mutate(newPost, {
      onSuccess: () => {
        Toast.show({ type: "success", text1: "Blood Request Published!" });
        setIsComposeVisible(false);
        setNewPost({
          patientName: "",
          patientCondition: "",
          bloodGroup: "A_POSITIVE",
          location: "",
          urgency: "High",
          contactPhone: currentUser?.phoneNumber || "",
        });
      },
      onError: (err: any) => {
        Toast.show({
          type: "error",
          text1: "Failed to post",
          text2: err.message || "Network error. Please try again.",
        });
      },
    });
  }, [newPost, createPostMutation, currentUser]);

  const { filteredPosts, counts } = useMemo(() => {
    return filterAndCountBloodPosts(posts, activeFilter, searchQuery);
  }, [posts, activeFilter, searchQuery]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home");
    }
  }, [router]);

  useEffect(() => {
    if (!isComposeVisible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setIsComposeVisible(false);
      return true;
    });
    return () => sub.remove();
  }, [isComposeVisible]);

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitlesContainer}>
          <Text style={styles.screenTitle}>Blood Bank Hub</Text>
          <Text style={styles.screenSubtitle}>Emergency Donor Network</Text>
        </View>

        <TouchableOpacity
          onPress={verifyProfileAndCompose}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Request blood donation"
          activeOpacity={0.7}
        >
          <Feather name="plus" size={20} color={BENTO_COLORS.crimson} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 120 : 132 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[BENTO_COLORS.crimson]}
            tintColor={BENTO_COLORS.crimson}
          />
        }
      >
        <View style={styles.searchBarWrapper}>
          <Feather
            name="search"
            size={16}
            color={BENTO_COLORS.subtleText}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location, hospital, or blood group..."
            placeholderTextColor={BENTO_COLORS.subtleText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search blood requests"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ padding: 4 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Feather
                name="x-circle"
                size={16}
                color={BENTO_COLORS.subtleText}
              />
            </TouchableOpacity>
          )}
        </View>

        <BloodHeroCard counts={counts} />

        <BloodFilterPills
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          counts={counts}
        />

        {isLoading ? (
          <BloodSkeleton />
        ) : isError ? (
          <BloodError onRetry={refetch} />
        ) : filteredPosts.length === 0 ? (
          <BloodEmpty
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onReset={() => {
              setActiveFilter("ALL");
              setSearchQuery("");
            }}
          />
        ) : (
          <View style={styles.cardsListContainer}>
            {filteredPosts.map((item: any) => (
              <BloodPostCard key={item.id} item={item} />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fabBtn,
          { bottom: insets.bottom > 0 ? insets.bottom + 92 : 104 },
        ]}
        onPress={verifyProfileAndCompose}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Post blood request"
      >
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>

      <ComposeBloodModal
        visible={isComposeVisible}
        form={newPost}
        onChangeForm={setNewPost}
        onSubmit={handlePost}
        onClose={() => setIsComposeVisible(false)}
        isSubmitting={createPostMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
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
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerTitlesContainer: {
    alignItems: "center",
  },
  screenTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 16,
    ...BENTO_COLORS.shadow,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
    padding: 0,
  },
  cardsListContainer: {
    marginBottom: 16,
  },
  fabBtn: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BENTO_COLORS.crimson,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.heroShadow,
  },
});
