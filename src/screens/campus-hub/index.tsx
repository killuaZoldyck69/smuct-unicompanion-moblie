import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Forum } from "@/screens/forum";
import { LostFoundSection } from "./lost-found";
import { MarketplaceSection } from "./marketplace";
import {
  SectionTabBar,
  type HubSection,
} from "./shared/section-tab-bar";
import { CAMPUS_HUB_COLORS, fontFamily } from "./shared/design-tokens";

export function CampusHub() {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  const [activeSection, setActiveSection] = useState<HubSection>("FORUM");

  const handleSectionChange = useCallback((section: HubSection) => {
    setActiveSection(section);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topNavBar}>
        <View style={styles.topNavLeft}>
          {currentUser?.image ? (
            <Image
              source={{ uri: currentUser.image }}
              style={styles.navAvatar}
              accessible={true}
              accessibilityLabel="Your avatar"
            />
          ) : (
            <View style={styles.navAvatarFallback}>
              <Text style={styles.navAvatarText}>
                {currentUser?.name?.charAt(0) ?? "U"}
              </Text>
            </View>
          )}
          <Text style={styles.navBrandTitle}>Campus Hub</Text>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(tabs)/notices")}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="View notices"
        >
          <Feather name="bell" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
        </TouchableOpacity>
      </View>

      <SectionTabBar
        activeSection={activeSection}
        onSelect={handleSectionChange}
      />

      <View style={styles.sectionContent}>
        {activeSection === "FORUM" && <Forum embedded={true} />}
        {activeSection === "LOST_FOUND" && <LostFoundSection />}
        {activeSection === "MARKETPLACE" && <MarketplaceSection />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  topNavBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  topNavLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  navAvatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  navAvatarText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  navBrandTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  sectionContent: {
    flex: 1,
  },
});

