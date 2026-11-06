import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

/**
 * HubAssessmentsScreen (Legacy Forwarder)
 *
 * Forwards legacy deep links and notifications targeting `/hub/[id]/assessments`
 * directly into the unified Course Hub details screen with the Classwork tab active
 * and the specific coursework modal open (via `assessmentId`).
 */
export default function HubAssessmentsScreen() {
  const { id, assessmentId } = useLocalSearchParams<{
    id: string;
    assessmentId?: string;
  }>();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace({
        pathname: "/hub/[id]",
        params: {
          id,
          tab: "classwork",
          fromNotification: "true",
          ...(assessmentId ? { assessmentId } : {}),
        },
      });
    }
  }, [id, assessmentId, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#131b2e" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fb",
  },
});
