import React from "react";
import { Redirect } from "expo-router";

/**
 * Admin System Monitor Route Redirect
 *
 * Redirects to the unified system monitor tab screen (/(tabs)/admin_system_monitor)
 * which renders within the app's main tab layout with bottom navigation bar.
 */
export default function AdminSystemMonitorRoute() {
  return <Redirect href="/(tabs)/admin_system_monitor" />;
}
