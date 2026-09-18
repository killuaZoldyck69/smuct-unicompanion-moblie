import React, { useEffect } from "react";
import { Redirect } from "expo-router";
import { setCampusHubActiveSection } from "@/screens/campus-hub/shared/hub-state";

export default function ComplaintsRedirect() {
  useEffect(() => {
    setCampusHubActiveSection("COMPLAINTS");
  }, []);

  return <Redirect href="/(tabs)/forum" />;
}
