import React from "react";
import { Redirect } from "expo-router";

/**
 * Admin Course Hubs Route Redirect
 *
 * Redirects to the unified course hubs management tab screen (/(tabs)/admin_course_hubs)
 * which renders within the app's main tab layout with bottom navigation bar.
 */
export default function AdminCourseHubsRoute() {
  return <Redirect href="/(tabs)/admin_course_hubs" />;
}
