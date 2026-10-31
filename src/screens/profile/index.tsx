import React from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

import StudentProfile from "./components/student-profile";
import TeacherProfile from "./components/teacher-profile";
import AdminProfile from "./components/admin-profile";
import { ProfileLoadingSkeleton } from "./components/shared/profile-loading-skeleton";

export function Profile() {
  const { user, role, isPending, isAuthenticated } = useCurrentUser();

  if (isPending || !isAuthenticated || !user) {
    return <ProfileLoadingSkeleton role={role} />;
  }

  if (role === "TEACHER") return <TeacherProfile sessionUser={user} />;
  if (role === "ADMIN") return <AdminProfile sessionUser={user} />;

  return <StudentProfile sessionUser={user} />;
}
