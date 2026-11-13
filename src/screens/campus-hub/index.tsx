import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Forum } from "@/screens/forum";
import { LostFoundSection } from "./lost-found";
import { MarketplaceSection } from "./marketplace";
import { MemesSection } from "./memes";
import { SectionTabBar, type HubSection } from "./shared/section-tab-bar";
import { CAMPUS_HUB_COLORS, fontFamily, titleFontFamily } from "./shared/design-tokens";
import { colors } from "@/theme/colors";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAdminForumReports } from "@/features/ugc/useUgcModeration";
import { AdminModerationModal } from "@/screens/forum/components/ugc/admin-moderation-modal";
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
  const { user: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const [isForumComposeVisible, setIsForumComposeVisible] = useState(false);
  const [isLostFoundComposeVisible, setIsLostFoundComposeVisible] =
    useState(false);
  const [isMarketplaceComposeVisible, setIsMarketplaceComposeVisible] =
    useState(false);
  const [isMemeComposeVisible, setIsMemeComposeVisible] = useState(false);
  const [isModerationVisible, setIsModerationVisible] = useState(false);

  const { data: moderationSummary } = useAdminForumReports(
    { status: "PENDING", page: 1, limit: 1 },
    isAdmin,
  );
  const pendingReportsCount = moderationSummary?.meta?.pendingCount ?? 0;

  const [activeSection, setActiveSection] = useState<HubSection>(() => {
    return initialSection || getCampusHubActiveSection();
  });

  const prevInitialSectionRef = useRef<HubSection | undefined>(undefined);

  useEffect(() => {
    // Only sync when the route param itself changes so manual section tab
    // switches aren't overwritten back to `initialSection` on re-render.
    if (initialSection !== prevInitialSectionRef.current) {
      prevInitialSectionRef.current = initialSection;
      if (initialSection) {
        setCampusHubActiveSection(initialSection);
        setActiveSection(initialSection);
      }
    }
  }, [initialSection]);

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
          {isAdmin && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setIsModerationVisible(true)}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Moderation queue, ${pendingReportsCount} pending reports`}
              activeOpacity={0.7}
            >
              <Feather
                name="shield"
                size={18}
                color={
                  pendingReportsCount > 0
                    ? colors.semantic.violet.accent
                    : CAMPUS_HUB_COLORS.deepNavy
                }
              />
              {pendingReportsCount > 0 && (
                <View style={styles.pendingDot}>
                  <Text style={styles.pendingDotText}>
                    {pendingReportsCount > 9 ? "9+" : pendingReportsCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleComposePress}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
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

      {isAdmin && (
        <AdminModerationModal
          visible={isModerationVisible}
          onClose={() => setIsModerationVisible(false)}
        />
      )}
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
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
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
    fontFamily,
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
    fontFamily: titleFontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  navBrandTitle: {
    fontFamily: titleFontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  navSubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  iconBtn: {
    position: "relative",
    width: 38,
    height: 38,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  pendingDot: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#be123c",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  pendingDotText: {
    fontFamily,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
    color: colors.white,
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  sectionContent: {
    flex: 1,
  },
});
