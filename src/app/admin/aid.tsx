import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { spacing, rounded, shadows } from "@/theme/layout";

export default function AdminAidScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color="#131b2e" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Student Aid & Welfare</Text>
          <Text style={styles.headerSubtitle}>Emergency Relief & Assistance</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 24 : 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Blood Aid Card */}
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => router.push("/admin/blood")}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: "#fee2e2" }]}>
            <Feather name="heart" size={22} color="#dc2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Emergency Blood Aid</Text>
            <Text style={styles.cardDesc}>
              Review donor requests, urgent patient cases, and fulfilled donations.
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#94a3b8" />
        </TouchableOpacity>

        {/* Financial Aid Card */}
        <View style={styles.infoCard}>
          <View style={[styles.iconWrap, { backgroundColor: "#ecfdf5" }]}>
            <Feather name="award" size={22} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Tuition Waiver & Scholarships</Text>
            <Text style={styles.cardDesc}>
              University scholarship guidelines, merit waivers, and hardship funding programs.
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Institutional Policy Active</Text>
            </View>
          </View>
        </View>

        {/* Emergency Helplines */}
        <Text style={styles.sectionLabel}>EMERGENCY HELPLINE DESK</Text>
        <View style={styles.helplineCard}>
          <View style={styles.helplineRow}>
            <Feather name="phone-call" size={16} color="#2563eb" />
            <Text style={styles.helplineName}>Medical Emergency Unit:</Text>
            <Text style={styles.helplineVal}>+880 1711-000000</Text>
          </View>
          <View style={styles.helplineRow}>
            <Feather name="phone-call" size={16} color="#059669" />
            <Text style={styles.helplineName}>Student Affairs Division:</Text>
            <Text style={styles.helplineVal}>+880 1819-000000</Text>
          </View>
          <View style={styles.helplineRow}>
            <Feather name="mail" size={16} color="#7c3aed" />
            <Text style={styles.helplineName}>Welfare Email:</Text>
            <Text style={styles.helplineVal}>aid@smuct.edu.bd</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 14,
    ...shadows.level1,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 14,
    ...shadows.level1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginTop: 4,
  },
  statusPill: {
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#047857",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#64748b",
    marginTop: 8,
  },
  helplineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
    ...shadows.level1,
  },
  helplineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  helplineName: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  helplineVal: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
    marginLeft: "auto",
  },
});
