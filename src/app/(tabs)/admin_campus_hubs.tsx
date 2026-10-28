import React from "react";
import { CampusHub } from "@/screens/campus-hub";
import { useLocalSearchParams } from "expo-router";

/**
 * Admin Campus Hubs Tab Screen
 *
 * Renders within the main app tab layout with the bottom navigation bar permanently visible.
 */
export default function AdminCampusHubsTabScreen() {
  const { section } = useLocalSearchParams<{ section?: any }>();
  return <CampusHub initialSection={section} />;
}

