import React from "react";
import { Blood } from "@/screens/blood";

/**
 * Admin Campus Blood Post Management Screen
 *
 * Renders the unified Blood Bank interface matching student and faculty views,
 * enriched with administrative management capabilities:
 * - Full Bento design system, live stats, search, and category/urgency filters
 * - Admin controls on posts: Mark Fulfilled & Delete with confirmation dialogs
 * - Floating "+ Create Request" action for administrators
 * - Enforces profile requirements (phone number and blood group) before posting
 * - Integrated stack navigation back button
 */
export default function AdminBloodManageScreen() {
  return (
    <Blood
      hasBackButton={true}
      isStackScreen={true}
      forceAdmin={true}
      headerTitle="Blood Bank"
      headerSubtitle="Admin Management & Emergency Requests"
    />
  );
}
