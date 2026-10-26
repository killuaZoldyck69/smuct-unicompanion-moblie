import React from "react";
import { Redirect } from "expo-router";

/**
 * Admin Alumni Redirect
 *
 * Redirects to the unified alumni management tab screen (/(tabs)/admin_alumni)
 * so the bottom main tab bar is always shown.
 */
export default function AdminAlumniRedirect() {
  return <Redirect href="/(tabs)/admin_alumni" />;
}
