import React from "react";
import { NoticeboardScreen } from "@/screens/notices";

/**
 * Admin Campus Notice Management Screen
 *
 * Renders the noticeboard interface matching student and faculty views,
 * enriched with administrative capabilities:
 * - Floating "+ Create Notice" pill button that opens the notice creation form
 * - In-card & in-modal notice editing with pre-filled notice data
 * - Deletion with custom confirmation dialogs & database persistence
 * - Back button integration for nested stack navigation
 */
export default function AdminNoticesManageScreen() {
  return (
    <NoticeboardScreen
      hasBackButton={true}
      isStackScreen={true}
      forceAdmin={true}
      headerTitle="Noticeboard"
      headerSubtitle="Admin Management & Official Notices"
    />
  );
}
