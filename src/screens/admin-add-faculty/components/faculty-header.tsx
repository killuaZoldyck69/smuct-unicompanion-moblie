import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FACULTY_COLORS, fontFamily, titleFontFamily } from "../constants";

export const FacultyHeader = React.memo(function FacultyHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Faculty</Text>
      <Text style={styles.subtitle}>
        Create a faculty account and profile
      </Text>

      {/* Faculty Onboarding Banner */}
      <View style={styles.banner}>
        <View style={styles.iconBox}>
          <Feather name="user-plus" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Faculty onboarding</Text>
          <Text style={styles.bannerSubtitle}>
            Account details and academic position
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  title: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: FACULTY_COLORS.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    fontWeight: "500",
    color: FACULTY_COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.bannerBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.bannerBorder,
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: FACULTY_COLORS.bannerIconBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: FACULTY_COLORS.bannerIconBg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 16,
    fontWeight: "700",
    color: FACULTY_COLORS.textPrimary,
  },
  bannerSubtitle: {
    fontFamily,
    fontSize: 13,
    color: FACULTY_COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
