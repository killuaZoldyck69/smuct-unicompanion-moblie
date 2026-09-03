import React from "react";
import { Redirect } from "expo-router";

export default function NoticesLegacyRedirectScreen() {
  return <Redirect href="/(tabs)/notices" />;
}
