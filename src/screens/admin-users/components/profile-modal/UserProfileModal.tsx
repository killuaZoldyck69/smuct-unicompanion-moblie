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
import { AdministrativeActionsCard } from "./AdministrativeActionsCard";

interface UserProfileModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onUpdateRole: (userId: string, action: RoleAction) => void;
  onDelete: (userId: string, name: string) => void;
  isUpdatingRole: boolean;
  isDeletingUser: boolean;
  topInset: number;
  bottomInset: number;
}

export const UserProfileModal = React.memo(
  ({
    user,
    onClose,
    onUpdateRole,
    onDelete,
    isUpdatingRole,
    isDeletingUser,
    topInset,
    bottomInset,
  }: UserProfileModalProps) => {
    if (!user) return null;

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

            {/* 2. Contact & Personal Card */}
            <ContactPersonalCard user={user} />

            {/* 3. Academic Card (Student vs Teacher) */}
            {user.role === "STUDENT" ? (
              <StudentAcademicCard profile={user.studentProfile} />
            ) : (
              <TeacherAcademicCard profile={user.teacherProfile} />
            )}

            {/* 4. Administrative Actions Card */}
            <AdministrativeActionsCard
              user={user}
              onUpdateRole={onUpdateRole}
              onDelete={onDelete}
              isUpdatingRole={isUpdatingRole}
              isDeletingUser={isDeletingUser}
            />
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
