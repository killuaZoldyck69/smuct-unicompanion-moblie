import React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { PROFILE_COLORS, SPACING } from "../../constants";

type ProfileLoadingSkeletonProps = {
  role?: string | null;
};

const Placeholder = React.memo(function Placeholder({
  style,
}: {
  style: object;
}) {
  return <View style={[styles.placeholder, style]} />;
});

export const ProfileLoadingSkeleton = React.memo(
  function ProfileLoadingSkeleton({ role }: ProfileLoadingSkeletonProps) {
    const isAdmin = role === "ADMIN";
    const isTeacher = role === "TEACHER";

    return (
      <View style={styles.container} accessibilityLabel="Loading profile">
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.identityCard, isAdmin && styles.adminHero]}>
            {isAdmin ? (
              <>
                <Placeholder style={styles.adminAvatar} />
                <Placeholder style={styles.adminName} />
                <Placeholder style={styles.adminRole} />
              </>
            ) : (
              <View style={styles.identityRow}>
                <Placeholder style={styles.avatar} />
                <View style={styles.identityDetails}>
                  <Placeholder style={styles.name} />
                  <Placeholder style={styles.role} />
                  <Placeholder style={styles.meta} />
                  <Placeholder style={styles.metaShort} />
                </View>
              </View>
            )}
          </View>

          {isAdmin ? (
            <View style={styles.sectionCard}>
              <Placeholder style={styles.sectionTitle} />
              <View style={styles.infoRow}>
                <Placeholder style={styles.infoIcon} />
                <View style={styles.infoText}>
                  <Placeholder style={styles.infoLabel} />
                  <Placeholder style={styles.infoValue} />
                </View>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.sectionCard}>
                <Placeholder style={styles.sectionTitle} />
                <View style={styles.tileRow}>
                  <Placeholder style={styles.tile} />
                  <Placeholder style={styles.tile} />
                  <Placeholder style={styles.tile} />
                </View>
                <Placeholder style={styles.fullLine} />
              </View>

              <View style={styles.sectionCard}>
                <Placeholder style={styles.sectionTitle} />
                {[0, 1, 2].map((row) => (
                  <View key={row} style={styles.dataRow}>
                    <Placeholder style={styles.dataIcon} />
                    <View style={styles.dataText}>
                      <Placeholder style={styles.dataLabel} />
                      <Placeholder
                        style={[
                          styles.dataValue,
                          row === 1 && styles.dataValueShort,
                          isTeacher && row === 2 && styles.dataValueWide,
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.sectionCard}>
                <Placeholder style={styles.sectionTitle} />
                <View style={styles.chipsRow}>
                  <Placeholder style={styles.chip} />
                  <Placeholder style={styles.chipWide} />
                  <Placeholder style={styles.chip} />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 54,
    paddingBottom: 140,
  },
  placeholder: {
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
  },
  identityCard: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    marginRight: 18,
  },
  identityDetails: {
    flex: 1,
    gap: 9,
  },
  name: {
    width: "76%",
    height: 18,
  },
  role: {
    width: "45%",
    height: 20,
    borderRadius: 10,
  },
  meta: {
    width: "86%",
    height: 11,
  },
  metaShort: {
    width: "65%",
    height: 11,
  },
  adminHero: {
    minHeight: 205,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.deepNavy,
  },
  adminAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 14,
  },
  adminName: {
    width: 170,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 10,
  },
  adminRole: {
    width: 112,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  sectionCard: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: PROFILE_COLORS.cardRadius,
    padding: SPACING.xl,
    marginBottom: SPACING.cardGap,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.subtleBorder,
  },
  sectionTitle: {
    width: 144,
    height: 12,
    marginBottom: 18,
  },
  tileRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  tile: {
    flex: 1,
    height: 62,
    borderRadius: 12,
  },
  fullLine: {
    width: "84%",
    height: 12,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  dataIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  dataText: {
    flex: 1,
    gap: 7,
  },
  dataLabel: {
    width: "30%",
    height: 9,
  },
  dataValue: {
    width: "68%",
    height: 12,
  },
  dataValueShort: {
    width: "48%",
  },
  dataValueWide: {
    width: "82%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    gap: 7,
  },
  infoLabel: {
    width: 92,
    height: 9,
  },
  infoValue: {
    width: "74%",
    height: 13,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    width: 72,
    height: 24,
    borderRadius: 12,
  },
  chipWide: {
    width: 108,
    height: 24,
    borderRadius: 12,
  },
});
