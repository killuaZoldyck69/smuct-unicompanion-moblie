import React from "react";
import { Redirect } from "expo-router";

/**
 * Admin Campus Event Management Screen Redirect
 *
 * Redirects to the unified campus events tab screen (/(tabs)/events)
 * which renders within the app's main tab layout with bottom navigation bar.
 */
export default function AdminEventsManageScreen() {
  return <Redirect href="/(tabs)/events" />;
}
