import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { THEME } from "../../constants";
import {
  AdminUser,
  RoleAction,
  UpdateAdminTeacherProfilePayload,
  UpdateAdminStudentProfilePayload,
} from "../../types";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ContactPersonalCard } from "./ContactPersonalCard";
import { StudentAcademicCard } from "./StudentAcademicCard";
import { TeacherAcademicCard } from "./TeacherAcademicCard";
import { TeacherOfficeAvailabilityCard } from "./TeacherOfficeAvailabilityCard";
import { TeacherProfessionalProfileCard } from "./TeacherProfessionalProfileCard";
import { FacultyAdminActionsCard } from "./FacultyAdminActionsCard";
import { AdministrativeActionsCard } from "./AdministrativeActionsCard";
import { RestrictConfirmationModal } from "./RestrictConfirmationModal";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";

interface UserProfileModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onUpdateRole: (userId: string, action: RoleAction) => void;
  onUpdateTeacherPosition?: (
    userId: string,
    data: { designation?: string; administrativeRole?: string | null },
  ) => void;
  onUpdateTeacherProfile?: (
    userId: string,
    data: UpdateAdminTeacherProfilePayload,
  ) => Promise<any> | void;
  onUpdateStudentProfile?: (
    userId: string,
    data: UpdateAdminStudentProfilePayload,
  ) => Promise<any> | void;
  onDelete?: (userId: string, name: string, isRestricted?: boolean) => void;
  onToggleRestrict?: (userId: string, name: string, isRestricted?: boolean) => void;
  isUpdatingRole: boolean;
  isUpdatingTeacherPosition?: boolean;
  isUpdatingTeacherProfile?: boolean;
  isUpdatingStudentProfile?: boolean;
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
    onUpdateTeacherProfile,
    onUpdateStudentProfile,
    onDelete,
    onToggleRestrict,
    isUpdatingRole,
    isUpdatingTeacherPosition,
    isUpdatingTeacherProfile,
    isUpdatingStudentProfile = false,
    isDeletingUser,
    isRestrictingUser,
    topInset,
    bottomInset,
  }: UserProfileModalProps) => {
    const [isRestrictConfirmVisible, setIsRestrictConfirmVisible] =
      React.useState(false);

    const handleRestrict = onToggleRestrict || onDelete;
    const isBusy = isRestrictingUser ?? isDeletingUser;

    const handlePromptRestrict = React.useCallback(() => {
      if (user?.role === "ADMIN") {
        Alert.alert(
          "Action Prohibited",
          "Administrator accounts cannot be restricted.",
        );
        return;
      }
      setIsRestrictConfirmVisible(true);
    }, [user?.role]);

    const handleExecuteRestrict = React.useCallback(() => {
      if (!user) return;
      handleRestrict?.(user.id, user.name, user.isRestricted);
      setIsRestrictConfirmVisible(false);
    }, [user, handleRestrict]);

    if (!user) return null;

    const isTeacher = user.role === "TEACHER";

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
                <TeacherOfficeAvailabilityCard
                  profile={user.teacherProfile}
                  phoneNumber={user.phoneNumber}
                />

                {/* 4. Professional Profile Card (Lavender) */}
                <TeacherProfessionalProfileCard profile={user.teacherProfile} />

                {/* 5. Faculty Admin Actions Card */}
                <FacultyAdminActionsCard
                  user={user}
                  onUpdateTeacherPosition={onUpdateTeacherPosition}
                  onUpdateTeacherProfile={onUpdateTeacherProfile}
                  isUpdatingPosition={isUpdatingTeacherPosition}
                  isUpdatingProfile={isUpdatingTeacherProfile}
                  onToggleRestrict={handlePromptRestrict}
                  isRestrictingUser={isBusy}
                />
              </>
            ) : (
              <>
                {/* Student Profile Layout */}
                <StudentAcademicCard profile={user.studentProfile} />
                <ContactPersonalCard user={user} />
                <AdministrativeActionsCard
                  user={user}
                  onUpdateRole={onUpdateRole}
                  onUpdateStudentProfile={onUpdateStudentProfile}
                  isUpdatingProfile={isUpdatingStudentProfile}
                  onToggleRestrict={handlePromptRestrict}
                  isUpdatingRole={isUpdatingRole}
                  isRestrictingUser={isBusy}
                />
              </>
            )}
          </ScrollView>

          {/* Restrict Confirmation Modal */}
          <RestrictConfirmationModal
            visible={isRestrictConfirmVisible}
            user={user}
            onClose={() => setIsRestrictConfirmVisible(false)}
            onConfirm={handleExecuteRestrict}
            isLoading={isBusy}
          />

          {/* Toast Notification for Profile Modal */}
          <Toast
            config={toastConfig}
            topOffset={Math.max(topInset + 8, 44)}
          />
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
