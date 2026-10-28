import React from "react";
import { Redirect } from "expo-router";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function CommunityRedirect() {
  const { user } = useCurrentUser();
  if (user?.role === "ADMIN") {
    return <Redirect href="/(tabs)/admin_campus_hubs" />;
  }
  return <Redirect href="/(tabs)/forum" />;
}
