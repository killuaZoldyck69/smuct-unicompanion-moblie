import React from "react";
import { Redirect } from "expo-router";

/**
 * Admin Campus Complaint Management Screen Redirect
 *
 * Redirects to the unified complaint management tab screen (/(tabs)/admin_complaints)
 * which renders within the app's main tab layout with bottom navigation bar.
 */
export default function AdminComplaintsManageScreen() {
  return <Redirect href="/(tabs)/admin_complaints" />;
}
