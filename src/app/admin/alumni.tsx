import React from "react";
import { AlumniScreen } from "@/screens/alumni";

/**
 * Admin Alumni Management Screen
 *
 * Renders the unified Alumni Network interface matching student and faculty views,
 * enriched with administrative management capabilities:
 * - Full Bento design system, department filters, search, and detailed profile modal
 * - Admin controls on cards & profile modal: Pre-filled Edit & Delete with confirmation
 * - Floating administrative actions: "+ Add Alumnus" and "📁 Import CSV"
 * - CSV batch import with file picker, format validation, duplicate detection, and row-level previews
 * - Stack navigation back button to return to Admin Dashboard
 */
export default function AdminAlumniManageScreen() {
  return (
    <AlumniScreen
      hasBackButton={true}
      isStackScreen={true}
      forceAdmin={true}
      headerTitle="Alumni Network"
      headerSubtitle="Admin Management & Directory"
    />
  );
}
