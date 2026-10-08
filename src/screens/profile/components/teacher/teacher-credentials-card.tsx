import React from "react";
import { View } from "react-native";
import { TeacherExpertiseCard } from "./teacher-expertise-card";
import { TeacherQualificationsCard } from "./teacher-qualifications-card";

interface TeacherCredentialsCardProps {
  expertiseFields: string[];
  academicQualifications: Record<string, string>;
  isEditing: boolean;
  onAddExpertise: (field: string) => void;
  onRemoveExpertise: (field: string) => void;
  onAddQualification: (degree: string, inst: string) => void;
  onRemoveQualification: (degree: string) => void;
}

export const TeacherCredentialsCard = React.memo(
  function TeacherCredentialsCard({
    expertiseFields,
    academicQualifications,
    isEditing,
    onAddExpertise,
    onRemoveExpertise,
    onAddQualification,
    onRemoveQualification,
  }: TeacherCredentialsCardProps) {
    return (
      <View>
        <TeacherExpertiseCard
          expertiseFields={expertiseFields}
          isEditing={isEditing}
          onAddExpertise={onAddExpertise}
          onRemoveExpertise={onRemoveExpertise}
        />
        <TeacherQualificationsCard
          academicQualifications={academicQualifications}
          isEditing={isEditing}
          onAddQualification={onAddQualification}
          onRemoveQualification={onRemoveQualification}
        />
      </View>
    );
  }
);
