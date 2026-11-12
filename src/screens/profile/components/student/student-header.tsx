import React from "react";
import { ProfileRoleHeader } from "../shared/profile-role-header";

interface StudentHeaderProps {
  insetsTop: number;
  isEditing: boolean;
  isUpdating: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const StudentHeader = React.memo(function StudentHeader(props: StudentHeaderProps) {
  return (
    <ProfileRoleHeader
      {...props}
      maxWidth={520}
      subtitle="Your academic identity, skills and connections — all in one place."
      cancelAccessibilityLabel="Cancel editing profile"
      saveAccessibilityLabel="Save profile changes"
    />
  );
});
