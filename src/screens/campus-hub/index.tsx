import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Forum } from "@/screens/forum";
import { LostFoundSection } from "./lost-found";
import { MarketplaceSection } from "./marketplace";
import { ComplaintsSection } from "./complaints";
import {
  SectionTabBar,
  type HubSection,
} from "./shared/section-tab-bar";
import { CAMPUS_HUB_COLORS, fontFamily } from "./shared/design-tokens";
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
  const [isForumComposeVisible, setIsForumComposeVisible] = useState(false);

  const [activeSection, setActiveSection] = useState<HubSection>(() => {
    return initialSection || getCampusHubActiveSection();
  });

  useEffect(() => {
    if (initialSection) {
      setCampusHubActiveSection(initialSection);
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    return subscribeCampusHubSection((newSec) => {
      setActiveSection(newSec);
    });
  }, []);

  const handleSectionChange = useCallback((section: HubSection) => {
    setCampusHubActiveSection(section);
    setActiveSection(section);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topNavBar}>
        <View style={styles.topNavLeft}>
          <Text style={styles.navBrandTitle}>Campus Hub</Text>
        </View>

        <View style={styles.topNavRight}>
          {activeSection === "FORUM" && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setIsForumComposeVisible(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ask a question"
              activeOpacity={0.7}
            >
              <Feather name="plus" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/(tabs)/notices")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View notices"
            activeOpacity={0.7}
          >
            <Feather name="bell" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
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
        {activeSection === "LOST_FOUND" && <LostFoundSection />}
        {activeSection === "MARKETPLACE" && <MarketplaceSection />}
        {activeSection === "COMPLAINTS" && <ComplaintsSection />}
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
  },
  topNavRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navBrandTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.5,
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

