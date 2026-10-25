import React from "react";
import { ComplaintsScreen } from "@/screens/complaints";
import { AdminComplaintsScreen } from "@/screens/complaints/admin-complaints";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function ComplaintsTabScreen() {
  const { role } = useCurrentUser();

  if (role === "ADMIN") {
    return <AdminComplaintsScreen />;
  }

  return <ComplaintsScreen />;
}
