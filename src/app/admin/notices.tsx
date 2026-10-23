import React from "react";
import { Redirect } from "expo-router";

/**
 * Admin Campus Notice Management Screen Redirect
 *
 * Redirects to the unified noticeboard tab screen (/(tabs)/notices)
 * which renders within the app's main tab layout with bottom navigation bar.
 */
export default function AdminNoticesManageScreen() {
  return <Redirect href="/(tabs)/notices" />;
}
