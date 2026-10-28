import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function AdminCampusHubRoute() {
  const { section } = useLocalSearchParams<{ section?: any }>();
  return (
    <Redirect
      href={{
        pathname: "/(tabs)/admin_campus_hubs",
        params: section ? { section } : undefined,
      }}
    />
  );
}
