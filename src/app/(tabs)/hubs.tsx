import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Hubs } from "@/screens/hubs";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function HubsDashboardScreen() {
  const router = useRouter();
  const { role } = useCurrentUser();

  useEffect(() => {
    if (role === "ADMIN") {
      router.replace("/(tabs)/admin_course_hubs");
    }
  }, [role, router]);

  return <Hubs />;
}
