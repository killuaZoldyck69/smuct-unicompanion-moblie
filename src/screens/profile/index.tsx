import React from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PROFILE_COLORS } from "./constants";

import StudentProfile from "./components/student-profile";
import TeacherProfile from "./components/teacher-profile";
import AdminProfile from "./components/admin-profile";

export function Profile() {
  const { user, role, isPending, isAuthenticated } = useCurrentUser();

  if (isPending || !isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <ActivityIndicator size="large" color={PROFILE_COLORS.deepNavy} />
      </View>
    );
  }

  if (role === "TEACHER") return <TeacherProfile sessionUser={user} />;
  if (role === "ADMIN") return <AdminProfile sessionUser={user} />;

  return <StudentProfile sessionUser={user} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.background,
  },
});
