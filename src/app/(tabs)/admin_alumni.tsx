import React from "react";
import { AlumniScreen } from "@/screens/alumni";

/**
 * Admin Alumni Tab Route
 *
 * Renders the AlumniScreen inside the main tab layout
 * so the bottom tab bar is visible.
 */
export default function AdminAlumniTabRoute() {
  return (
    <AlumniScreen
      hasBackButton={false}
      isStackScreen={false}
      forceAdmin={true}
      headerTitle="Alumni Network"
      headerSubtitle="Admin Management & Directory"
    />
  );
}
