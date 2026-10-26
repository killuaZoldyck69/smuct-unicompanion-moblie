import React from "react";
import { Blood } from "@/screens/blood";

/**
 * Admin Blood Bank Tab Route
 *
 * Renders the unified Blood Bank interface inside the main tab layout
 * with administrative management capabilities so the bottom tab bar is always visible.
 */
export default function AdminBloodTabRoute() {
  return (
    <Blood
      hasBackButton={false}
      isStackScreen={false}
      forceAdmin={true}
      headerTitle="Blood Bank"
      headerSubtitle="Admin Management & Emergency Requests"
    />
  );
}
