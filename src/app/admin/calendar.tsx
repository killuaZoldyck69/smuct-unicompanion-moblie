import React from "react";
import { Redirect } from "expo-router";

export default function AdminCalendarRedirect() {
  return <Redirect href="/(tabs)/admin_calendar" />;
}
