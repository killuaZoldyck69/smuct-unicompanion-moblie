import React from "react";
import { EventsScreen } from "@/screens/events";

/**
 * Admin Campus Event Management Screen
 *
 * Renders the campus events interface matching student and faculty views,
 * enriched with administrative capabilities:
 * - Floating "+ Create Event" pill button that opens the event creation form
 * - In-card & in-modal event editing with pre-filled event data
 * - Deletion with custom confirmation dialogs & database persistence
 * - Back button integration for nested stack navigation
 */
export default function AdminEventsManageScreen() {
  return (
    <EventsScreen
      hasBackButton={true}
      isStackScreen={true}
      forceAdmin={true}
      headerTitle="Campus Events"
      headerSubtitle="Admin Management & Event Controls"
    />
  );
}
