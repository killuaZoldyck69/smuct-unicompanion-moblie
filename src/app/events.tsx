import React from "react";
import { Redirect } from "expo-router";

export default function CampusEventsLegacyRedirectScreen() {
  return <Redirect href="/(tabs)/events" />;
}
