import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BENTO_COLORS } from "../constants";

export const BloodRequestDetailsSkeleton = React.memo(
  function BloodRequestDetailsSkeleton() {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top", "bottom"]}
        accessibilityLabel="Loading blood request details"
        accessibilityState={{ busy: true }}
      >
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <View style={styles.headerTitle} />
          <View style={styles.headerButton} />
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <View style={styles.bloodGroupBadge} />
              <View style={styles.urgencyBadge} />
            </View>
            <View style={styles.title} />
            <View style={styles.subtitle} />
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.icon} />
              <View style={styles.detailText} />
            </View>
            <View style={styles.detailRow}>
              <View style={styles.icon} />
              <View style={styles.detailTextShort} />
            </View>
            <View style={styles.detailRow}>
              <View style={styles.icon} />
              <View style={styles.detailText} />
            </View>
          </View>

          <View style={styles.mapCard}>
            <View style={styles.sectionTitle} />
            <View style={styles.mapPlaceholder}>
              <View style={styles.mapPin} />
            </View>
            <View style={styles.detailText} />
            <View style={styles.detailTextShort} />
          </View>

          <View style={styles.requesterCard}>
            <View style={styles.sectionTitle} />
            <View style={styles.requesterRow}>
              <View style={styles.avatar} />
              <View style={styles.requesterInfo}>
                <View style={styles.requesterName} />
                <View style={styles.detailTextShort} />
              </View>
              <View style={styles.contactButton} />
            </View>
          </View>

          <View style={styles.responsesCard}>
            <View style={styles.sectionTitle} />
            <View style={styles.responseRow}>
              <View style={styles.avatarSmall} />
              <View style={styles.requesterInfo}>
                <View style={styles.requesterName} />
                <View style={styles.detailTextShort} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerButton} />
        </View>
      </SafeAreaView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E2E8F0",
  },
  headerTitle: {
    width: 130,
    height: 16,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    padding: 18,
    gap: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  bloodGroupBadge: {
    width: 66,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFE4E6",
  },
  urgencyBadge: {
    width: 78,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  title: {
    width: "72%",
    height: 22,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  subtitle: {
    width: "48%",
    height: 13,
    borderRadius: 5,
    backgroundColor: "#F1F5F9",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  detailText: {
    width: "68%",
    height: 12,
    borderRadius: 5,
    backgroundColor: "#F1F5F9",
  },
  detailTextShort: {
    width: "44%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F1F5F9",
  },
  mapCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    padding: 18,
    gap: 10,
  },
  sectionTitle: {
    width: "45%",
    height: 12,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
    marginBottom: 2,
  },
  mapPlaceholder: {
    height: 105,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  mapPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E2E8F0",
  },
  requesterCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    padding: 18,
    gap: 14,
  },
  requesterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
  },
  requesterInfo: {
    flex: 1,
    gap: 7,
  },
  requesterName: {
    width: "58%",
    height: 13,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
  },
  contactButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
  },
  responsesCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    padding: 18,
    gap: 14,
  },
  responseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  footerButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E2E8F0",
  },
});
