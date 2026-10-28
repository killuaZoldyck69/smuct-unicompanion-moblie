import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Admin Campus Hubs Route Redirect
 *
 * Redirects to the unified campus hubs tab screen (/(tabs)/admin_campus_hubs)
 * which renders within the app's main tab layout with bottom navigation bar.
 */
export default function AdminCampusHubsRoute() {
  const { section } = useLocalSearchParams<{ section?: any }>();
  return (
    <Redirect
      href={{
        pathname: "/(tabs)/admin_campus_hubs",
        params: section ? { section } : undefined,
      }}
    />
  );
}
