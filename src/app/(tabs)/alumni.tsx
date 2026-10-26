import React from "react";
import { AlumniScreen } from "@/screens/alumni";

export default function AlumniTabRoute() {
  return (
    <AlumniScreen
      hasBackButton={false}
      isStackScreen={false}
      headerTitle="Alumni Network"
      headerSubtitle="Connect with SMUCT graduates"
    />
  );
}
