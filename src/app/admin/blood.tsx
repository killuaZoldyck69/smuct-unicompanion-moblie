import React from "react";
import { Redirect } from "expo-router";

/**
 * Admin Blood Bank Screen Redirect
 *
 * Redirects to the unified admin blood tab screen (/(tabs)/admin_blood)
 * which renders within the app's main tab layout with bottom navigation bar.
 */
export default function AdminBloodManageScreen() {
  return <Redirect href="/(tabs)/admin_blood" />;
}

