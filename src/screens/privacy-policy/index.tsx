import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { fontFamily, titleFontFamily } from "@/theme/typography";

interface PolicySection {
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  body: string;
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    title: "1. Information We Collect",
    icon: "database",
    body:
      "SMUCT UniCompanion stores only the campus profile data required for university features: your institutional name, university email, role (Student, Faculty, or Admin), ID, academic program or department details, optional contact/social links, profile avatar, and device push token for campus alerts.",
  },
  {
    title: "2. How Your Data Is Used",
    icon: "shield",
    body:
      "Your profile powers course hubs, faculty consultation directories, academic notices, and classroom updates within Shanto-Mariam University of Creative Technology. Phone numbers and emergency blood group data remain scoped to authorized campus features.",
  },
  {
    title: "3. Third-Party Integrations & Media",
    icon: "cloud",
    body:
      "Profile photos are stored securely via Cloudinary under a strict 3 MB size limit. If you connect Google Drive for course hub materials, only explicit session/connection metadata needed for Drive access is synced.",
  },
  {
    title: "4. Account Deletion & Re-Registration Policy",
    icon: "trash-2",
    body:
      "You can permanently delete your account at any time from your Profile screen. Deleting your account immediately erases your personal profile, sessions, uploaded avatar, and push tokens. To prevent abuse, a non-reversible cryptographic hash is retained for a 30-day re-registration cooldown on first deletion (or a permanent block upon repeated deletions).",
  },
  {
    title: "5. Contact & Support",
    icon: "mail",
    body:
      "Questions about privacy, wrongful restriction, or data corrections can be directed to the SMUCT Campus Administration or university IT support desk.",
  },
];

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSubtitle}>SMUCT UniCompanion Data & Lifecycle Terms</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 128 : 132,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBanner}>
          <View style={styles.introBadge}>
            <Feather name="lock" size={14} color={colors.semantic.indigo.solid} />
            <Text style={styles.introBadgeText}>TRANSPARENT BY DESIGN</Text>
          </View>
          <Text style={styles.introBody}>
            Your campus identity belongs to you. Below is an exact summary of what
            SMUCT UniCompanion collects, how it is protected, and what happens when
            you sign out or delete your account.
          </Text>
        </View>

        {POLICY_SECTIONS.map((section) => (
          <View key={section.title} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Feather name={section.icon} size={16} color={colors.semantic.blue.accent} />
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footerNote}>
          Effective November 2026 • SMUCT UniCompanion Mobile & API
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.homeBackground,
  },
  header: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.homeBackground,
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: colors.navyDeep,
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: colors.slate500,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  scrollContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  introBanner: {
    backgroundColor: colors.semantic.indigo.tint,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.semantic.indigo.border,
  },
  introBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  introBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: colors.semantic.indigo.solid,
    letterSpacing: 0.7,
  },
  introBody: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.slate700,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.navyAlpha06,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.semantic.blue.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: colors.navyDeep,
  },
  cardBody: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.slate600,
  },
  footerNote: {
    fontFamily,
    fontSize: 12,
    color: colors.slate400,
    textAlign: "center",
    marginTop: 8,
  },
});
