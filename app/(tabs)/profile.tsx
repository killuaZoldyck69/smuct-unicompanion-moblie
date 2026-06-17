import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { authClient } from "../../src/services/auth-client";
import { colors } from "../../src/theme/colors";

// Import our decoupled components
import StudentProfile from "../../src/components/profile/StudentProfile";
import TeacherProfile from "../../src/components/profile/TeacherProfile";
import AdminProfile from "../../src/components/profile/AdminProfile";

export default function ProfileTab() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  const role = (session?.user as any)?.role || "STUDENT";

  // Route to the dedicated profile component based on role
  if (role === "TEACHER") return <TeacherProfile sessionUser={session?.user} />;
  if (role === "ADMIN") return <AdminProfile sessionUser={session?.user} />;

  return <StudentProfile sessionUser={session?.user} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
