import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { THEME } from "../../constants";
import { AdminUser, RoleAction } from "../../types";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ContactPersonalCard } from "./ContactPersonalCard";
import { StudentAcademicCard } from "./StudentAcademicCard";
import { TeacherAcademicCard } from "./TeacherAcademicCard";
import { TeacherOfficeAvailabilityCard } from "./TeacherOfficeAvailabilityCard";
import { TeacherProfessionalProfileCard } from "./TeacherProfessionalProfileCard";
import { FacultyAdminActionsCard } from "./FacultyAdminActionsCard";
import { AdministrativeActionsCard } from "./AdministrativeActionsCard";

interface UserProfileModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onUpdateRole: (userId: string, action: RoleAction) => void;
  onUpdateTeacherPosition?: (
    userId: string,
    data: { designation?: string; administrativeRole?: string | null },
  ) => void;
  onDelete?: (userId: string, name: string, isRestricted?: boolean) => void;
  onToggleRestrict?: (userId: string, name: string, isRestricted?: boolean) => void;
  isUpdatingRole: boolean;
  isUpdatingTeacherPosition?: boolean;
  isDeletingUser?: boolean;
  isRestrictingUser?: boolean;
  topInset: number;
  bottomInset: number;
}

export const UserProfileModal = React.memo(
  ({
    user,
    onClose,
    onUpdateRole,
    onUpdateTeacherPosition,
    onDelete,
    onToggleRestrict,
    isUpdatingRole,
    isUpdatingTeacherPosition,
    isDeletingUser,
    isRestrictingUser,
    topInset,
    bottomInset,
  }: UserProfileModalProps) => {
    if (!user) return null;

    const isStudent = user.role === "STUDENT";
    const isTeacher = user.role === "TEACHER";
    const handleRestrict = onToggleRestrict || onDelete;
    const isBusy = isRestrictingUser ?? isDeletingUser;

    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.detailModalContainer,
            {
              paddingTop: topInset,
              paddingBottom: bottomInset,
            },
          ]}
        >
          <StatusBar
            barStyle="dark-content"
            backgroundColor={THEME.bg}
            translucent={true}
          />

          {/* Detail Modal Header */}
          <View style={styles.detailModalHeader}>
            <Text style={styles.detailModalHeaderTitle}>User Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.detailModalCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close user profile"
            >
              <Feather name="x" size={19} color={THEME.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.detailModalScroll,
              { paddingBottom: Math.max(bottomInset + 28, 48) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Profile Hero Card */}
            <ProfileHeroCard user={user} />

            {/* Teacher Profile Layout */}
            {isTeacher ? (
              <>
                {/* 2. Academic Position Card (Yellow) */}
                <TeacherAcademicCard profile={user.teacherProfile} />

                {/* 3. Office & Availability Card (Mint) */}
                <TeacherOfficeAvailabilityCard profile={user.teacherProfile} />

                {/* 4. Professional Profile Card (Lavender) */}
                <TeacherProfessionalProfileCard profile={user.teacherProfile} />

                {/* 5. Faculty Admin Actions Card */}
                <FacultyAdminActionsCard
                  user={user}
                  onUpdateTeacherPosition={onUpdateTeacherPosition}
                  isUpdatingPosition={isUpdatingTeacherPosition}
                  onToggleRestrict={handleRestrict}
                  isRestrictingUser={isBusy}
                />
              </>
            ) : (
              <>
                {/* Student Profile Layout */}
                <ContactPersonalCard user={user} />
                <StudentAcademicCard profile={user.studentProfile} />
                <AdministrativeActionsCard
                  user={user}
                  onUpdateRole={onUpdateRole}
                  onToggleRestrict={handleRestrict}
                  isUpdatingRole={isUpdatingRole}
                  isRestrictingUser={isBusy}
                />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  detailModalContainer: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  detailModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: THEME.bg,
  },
  detailModalHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textPrimary,
    letterSpacing: -0.3,
  },
  detailModalCloseBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  detailModalScroll: {
    padding: 18,
  },
});
