import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Forum } from "@/screens/forum";
import { LostFoundSection } from "./lost-found";
import { MarketplaceSection } from "./marketplace";
import { MemesSection } from "./memes";
import { SectionTabBar, type HubSection } from "./shared/section-tab-bar";
import { CAMPUS_HUB_COLORS, fontFamily, titleFontFamily } from "./shared/design-tokens";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getCampusHubActiveSection,
  setCampusHubActiveSection,
  subscribeCampusHubSection,
} from "./shared/hub-state";

export {
  getCampusHubActiveSection,
  setCampusHubActiveSection,
  subscribeCampusHubSection,
};

interface CampusHubProps {
  initialSection?: HubSection;
}

export function CampusHub({ initialSection }: CampusHubProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const [isForumComposeVisible, setIsForumComposeVisible] = useState(false);
  const [isLostFoundComposeVisible, setIsLostFoundComposeVisible] =
    useState(false);
  const [isMarketplaceComposeVisible, setIsMarketplaceComposeVisible] =
    useState(false);
  const [isMemeComposeVisible, setIsMemeComposeVisible] = useState(false);

  const [activeSection, setActiveSection] = useState<HubSection>(() => {
    return initialSection || getCampusHubActiveSection();
  });

  useEffect(() => {
    if (initialSection && initialSection !== activeSection) {
      setCampusHubActiveSection(initialSection);
      setActiveSection(initialSection);
    }
  }, [initialSection, activeSection]);

  useEffect(() => {
    return subscribeCampusHubSection((newSec) => {
      setActiveSection((prev) => (prev !== newSec ? newSec : prev));
    });
  }, []);

  const handleSectionChange = useCallback((section: HubSection) => {
    setCampusHubActiveSection(section);
    setActiveSection(section);
  }, []);

  const handleComposePress = useCallback(() => {
    if (activeSection === "FORUM") {
      setIsForumComposeVisible(true);
    } else if (activeSection === "LOST_FOUND") {
      setIsLostFoundComposeVisible(true);
    } else if (activeSection === "MARKETPLACE") {
      setIsMarketplaceComposeVisible(true);
    } else if (activeSection === "MEMES") {
      setIsMemeComposeVisible(true);
    }
  }, [activeSection]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topNavBar}>
        <View style={styles.topNavLeftGroup}>
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Campus Hub</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
          <Text style={styles.screenSubtitle}>
            Forum, marketplace, items & memes
          </Text>
        </View>

        <View style={styles.topNavRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleComposePress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              activeSection === "FORUM"
                ? "Ask a question"
                : activeSection === "LOST_FOUND"
                  ? "Create Lost or Found post"
                  : activeSection === "MARKETPLACE"
                    ? "Create marketplace listing"
                    : "Post a meme"
            }
            activeOpacity={0.7}
          >
            <Feather name="plus" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionTabBar
        activeSection={activeSection}
        onSelect={handleSectionChange}
      />

      <View style={styles.sectionContent}>
        {activeSection === "FORUM" && (
          <Forum
            embedded={true}
            isComposeVisible={isForumComposeVisible}
            onCloseCompose={() => setIsForumComposeVisible(false)}
          />
        )}
        {activeSection === "LOST_FOUND" && (
          <LostFoundSection
            isComposeVisible={isLostFoundComposeVisible}
            onCloseCompose={() => setIsLostFoundComposeVisible(false)}
          />
        )}
        {activeSection === "MARKETPLACE" && (
          <MarketplaceSection
            isComposeVisible={isMarketplaceComposeVisible}
            onOpenCompose={() => setIsMarketplaceComposeVisible(true)}
            onCloseCompose={() => setIsMarketplaceComposeVisible(false)}
          />
        )}
        {activeSection === "MEMES" && (
          <MemesSection
            isComposeVisible={isMemeComposeVisible}
            onCloseCompose={() => setIsMemeComposeVisible(false)}
          />
        )}
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
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  topNavLeftGroup: {
    flex: 1,
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginLeft: 2,
  },
  adminBadgeText: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_700Bold",
      default: "Onest_700Bold",
    }),
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  topNavRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  screenTitle: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  navBrandTitle: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  screenSubtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  navSubtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
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
