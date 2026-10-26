import React from "react";
import { Redirect } from "expo-router";

/**
 * General Alumni Redirect
 *
 * Redirects to the unified alumni directory tab screen (/(tabs)/alumni)
 * so the bottom main tab bar is always shown.
 */
export default function AlumniRedirect() {
  return <Redirect href="/(tabs)/alumni" />;
}
