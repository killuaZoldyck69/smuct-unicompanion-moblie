import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComplaintsSection } from "@/screens/campus-hub/complaints";
import { CAMPUS_HUB_COLORS, fontFamily } from "@/screens/campus-hub/shared/design-tokens";

export function ComplaintsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Header with Back Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Back to previous screen"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color={CAMPUS_HUB_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.title}>Grievances & Complaints</Text>
          <Text style={styles.subtitle}>Submit issues directly to campus authority</Text>
        </View>
      </View>

      {/* Embedded Complaints Section */}
      <View style={styles.content}>
        <ComplaintsSection />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS_HUB_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: CAMPUS_HUB_COLORS.background,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
});
