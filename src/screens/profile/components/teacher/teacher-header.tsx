import React from "react";
import { ProfileRoleHeader } from "../shared/profile-role-header";

interface TeacherHeaderProps {
  insetsTop: number;
  isEditing: boolean;
  isUpdating: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const TeacherHeader = React.memo(function TeacherHeader(props: TeacherHeaderProps) {
  return (
    <ProfileRoleHeader
      {...props}
      maxWidth={520}
      subtitle="View your details, academic position and professional information."
      cancelAccessibilityLabel="Cancel editing faculty profile"
      saveAccessibilityLabel="Save faculty profile changes"
    />
  );
});
