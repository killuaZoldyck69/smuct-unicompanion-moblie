import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

type SkeletonVariant =
  | "workspace"
  | "stream"
  | "classwork"
  | "materials"
  | "members"
  | "review";

interface CourseHubSkeletonProps {
  variant?: SkeletonVariant;
}

function SkeletonBlock({
  style,
}: {
  style?: object;
}) {
  return <View style={[styles.block, style]} />;
}

function SkeletonCard({
  variant,
}: {
  variant: Exclude<SkeletonVariant, "workspace">;
}) {
  if (variant === "members") {
    return (
      <View style={styles.memberRow}>
        <SkeletonBlock style={styles.avatar} />
        <View style={styles.memberDetails}>
          <SkeletonBlock style={styles.memberName} />
          <SkeletonBlock style={styles.memberMeta} />
        </View>
        <SkeletonBlock style={styles.memberAction} />
      </View>
    );
  }

  if (variant === "materials") {
    return (
      <View style={styles.materialCard}>
        <View style={styles.materialIcon} />
        <View style={styles.materialDetails}>
          <SkeletonBlock style={styles.materialTitle} />
          <SkeletonBlock style={styles.materialMeta} />
          <SkeletonBlock style={styles.materialDescription} />
        </View>
        <SkeletonBlock style={styles.trailingIcon} />
      </View>
    );
  }

  return (
    <View style={styles.contentCard}>
      <View style={styles.cardHeader}>
        <SkeletonBlock style={styles.avatar} />
        <View style={styles.authorDetails}>
          <SkeletonBlock style={styles.authorName} />
          <SkeletonBlock style={styles.authorMeta} />
        </View>
        <SkeletonBlock style={styles.trailingIcon} />
      </View>
      <SkeletonBlock style={styles.contentLine} />
      <SkeletonBlock style={styles.contentLineShort} />
      {variant !== "review" && <SkeletonBlock style={styles.attachment} />}
      <View style={styles.cardFooter}>
        <SkeletonBlock style={styles.footerPill} />
        <SkeletonBlock style={styles.footerPillShort} />
      </View>
    </View>
  );
}

export default React.memo(function CourseHubSkeleton({
  variant = "workspace",
}: CourseHubSkeletonProps) {
  const isWorkspace = variant === "workspace";
  const contentVariant = isWorkspace ? "stream" : variant;
  const count = contentVariant === "members" ? 6 : contentVariant === "materials" ? 3 : 2;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      accessible={false}
    >
      {isWorkspace && (
        <>
          <View style={styles.workspaceHeader}>
            <SkeletonBlock style={styles.backButton} />
            <SkeletonBlock style={styles.headerAction} />
          </View>
          <View style={styles.courseSummary}>
            <SkeletonBlock style={styles.courseEyebrow} />
            <SkeletonBlock style={styles.courseTitle} />
            <SkeletonBlock style={styles.courseSubTitle} />
            <View style={styles.courseMetaRow}>
              <SkeletonBlock style={styles.courseMeta} />
              <SkeletonBlock style={styles.courseMeta} />
              <SkeletonBlock style={styles.courseMetaShort} />
            </View>
          </View>
          <View style={styles.tabBar}>
            {[0, 1, 2, 3].map((item) => (
              <SkeletonBlock key={item} style={styles.tabPill} />
            ))}
          </View>
        </>
      )}
      {!isWorkspace && variant === "materials" && (
        <View style={styles.filterBar}>
          <SkeletonBlock style={styles.filterPill} />
          <SkeletonBlock style={styles.filterPill} />
        </View>
      )}
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} variant={contentVariant} />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  block: {
    backgroundColor: "#e8edf3",
    borderRadius: 8,
  },
  workspaceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  courseSummary: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
  },
  courseEyebrow: {
    width: 100,
    height: 11,
  },
  courseTitle: {
    width: "78%",
    height: 25,
    borderRadius: 7,
  },
  courseSubTitle: {
    width: "52%",
    height: 14,
  },
  courseMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  courseMeta: {
    width: 64,
    height: 24,
    borderRadius: 12,
  },
  courseMetaShort: {
    width: 46,
    height: 24,
    borderRadius: 12,
  },
  tabBar: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  tabPill: {
    width: 76,
    height: 36,
    borderRadius: 18,
  },
  filterBar: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 2,
  },
  filterPill: {
    width: 118,
    height: 36,
    borderRadius: 18,
  },
  contentCard: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  authorDetails: {
    flex: 1,
    gap: 6,
  },
  authorName: {
    width: "52%",
    height: 13,
  },
  authorMeta: {
    width: "34%",
    height: 10,
  },
  trailingIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
  },
  contentLine: {
    width: "96%",
    height: 12,
  },
  contentLineShort: {
    width: "66%",
    height: 12,
  },
  attachment: {
    width: "100%",
    height: 74,
    borderRadius: 12,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  footerPill: {
    width: 68,
    height: 24,
    borderRadius: 12,
  },
  footerPillShort: {
    width: 48,
    height: 24,
    borderRadius: 12,
  },
  materialCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
  },
  materialIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e8edf3",
  },
  materialDetails: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
  materialTitle: {
    width: "76%",
    height: 14,
  },
  materialMeta: {
    width: "48%",
    height: 10,
  },
  materialDescription: {
    width: "92%",
    height: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
  },
  memberDetails: {
    flex: 1,
    gap: 7,
  },
  memberName: {
    width: "64%",
    height: 13,
  },
  memberMeta: {
    width: "40%",
    height: 10,
  },
  memberAction: {
    width: 54,
    height: 22,
    borderRadius: 11,
  },
});
