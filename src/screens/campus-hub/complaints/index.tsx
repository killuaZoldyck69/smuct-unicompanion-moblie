import React from "react";
import { ComplaintsScreen } from "@/screens/complaints";

/**
 * Backward-compatible proxy for ComplaintsSection
 * Delegating directly to the canonical production ComplaintsScreen
 */
export const ComplaintsSection = React.memo(function ComplaintsSection() {
  return <ComplaintsScreen />;
});

export default ComplaintsSection;
