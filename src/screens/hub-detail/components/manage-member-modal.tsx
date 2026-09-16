import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  borderActive: "#0f172a",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
  roseSoft: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#e11d48",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  amberText: "#b45309",
  purpleSoft: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#7e22ce",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

const ROLE_CONFIG: Record<
  string,
  {
    title: string;
    badgeLabel: string;
    description: string;
    icon: keyof typeof Feather.glyphMap;
    softBg: string;
    border: string;
    textColor: string;
  }
> = {
  STUDENT: {
    title: "Student / Member",
    badgeLabel: "Student",
    description: "Standard access to class routine, materials & coursework",
    icon: "user",
    softBg: BENTO.blueSoft,
    border: BENTO.blueBorder,
    textColor: BENTO.blueText,
  },
  CR: {
    title: "Class Representative (CR)",
    badgeLabel: "Class Rep",
    description: "Can post announcements, manage coursework & organize cohort",
    icon: "star",
    softBg: BENTO.amberSoft,
    border: BENTO.amberBorder,
    textColor: BENTO.amberText,
  },
  TA: {
    title: "Teaching Assistant (TA)",
    badgeLabel: "Teaching Assistant",
    description: "Can publish assignments, grade submissions & assist instructor",
    icon: "shield",
    softBg: BENTO.purpleSoft,
    border: BENTO.purpleBorder,
    textColor: BENTO.purpleText,
  },
  TEACHER: {
    title: "Course Instructor (Teacher)",
    badgeLabel: "Lead Instructor",
    description: "Full administrative ownership over this course hub",
    icon: "award",
    softBg: "#f1f5f9",
    border: "#cbd5e1",
    textColor: BENTO.navy,
  },
};

interface Props {
  isVisible: boolean;
  onClose: () => void;
  selectedMember: any;
  myRole: string;
  myUserId: string;
  onUpdateRole: (role: string) => void;
  onRemoveMember: () => void;
  isPending: boolean;
}

export default function ManageMemberModal({
  isVisible,
  onClose,
  selectedMember,
  myRole,
  myUserId,
  onUpdateRole,
  onRemoveMember,
  isPending,
}: Props) {
  if (!selectedMember) return null;

  const isSelf = selectedMember.user.id === myUserId;
  const isTargetTeacher = selectedMember.role === "TEACHER";
  const isManager = ["TEACHER", "CR", "TA"].includes(myRole);

  // Security Lock UI: Only a TEACHER can modify a TEACHER.
  // Blocks CRs and TAs from touching the instructor.
  const isBlocked = !isSelf && isTargetTeacher && myRole !== "TEACHER";

  // Failsafe: If a regular STUDENT somehow opens the modal on someone else
  const hasNoPermission = !isManager && !isSelf;

  const availableRoles =
    myRole === "TEACHER"
      ? ["STUDENT", "CR", "TA", "TEACHER"]
      : ["STUDENT", "CR", "TA"];

  const currentRoleInfo =
    ROLE_CONFIG[selectedMember.role] || ROLE_CONFIG.STUDENT;

  const idDisplay = isTargetTeacher
    ? selectedMember.user?.teacherProfile?.teacherId
    : selectedMember.user?.studentProfile?.studentId;

  // Safe removal confirmation
  const handleDestructiveAction = () => {
    const title = isSelf
      ? "Leave Course Hub?"
      : `Remove ${selectedMember.user?.name || "Member"}?`;
    const message = isSelf
      ? "Are you sure you want to leave this course hub? You will need the join code to re-enter."
      : `Are you sure you want to remove ${selectedMember.user?.name || "this member"} from this course hub? They will lose access to all coursework and materials.`;

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (window.confirm(`${title}\n\n${message}`)) {
          onRemoveMember();
        }
      } else {
        onRemoveMember();
      }
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        {
          text: isSelf ? "Leave Hub" : "Remove Member",
          style: "destructive",
          onPress: onRemoveMember,
        },
      ]);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} accessibilityViewIsModal={true}>
        <View style={styles.modalContent}>
          {/* Header Bar */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeftCol}>
              <Text style={styles.headerSubtitle}>
                {isSelf ? "MY MEMBERSHIP" : "MANAGE COHORT"}
              </Text>
              <Text style={styles.headerTitle}>
                {isSelf ? "Hub Settings" : "Member Permissions"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={isPending}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close member modal"
            >
              <Feather name="x" size={18} color={BENTO.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Member Profile Card */}
            <View style={styles.profileCard}>
              {selectedMember.user?.image ? (
                <Image
                  source={{ uri: selectedMember.user.image }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={[
                    styles.avatarFallback,
                    { backgroundColor: currentRoleInfo.softBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: currentRoleInfo.textColor },
                    ]}
                  >
                    {selectedMember.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </View>
              )}

              <View style={styles.profileInfoCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {selectedMember.user?.name}
                  </Text>
                  {isSelf && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>You</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.memberEmail} numberOfLines={1}>
                  {idDisplay ? `${idDisplay} • ` : ""}
                  {selectedMember.user?.email}
                </Text>

                <View
                  style={[
                    styles.currentRoleBadge,
                    {
                      backgroundColor: currentRoleInfo.softBg,
                      borderColor: currentRoleInfo.border,
                    },
                  ]}
                >
                  <Feather
                    name={currentRoleInfo.icon}
                    size={11}
                    color={currentRoleInfo.textColor}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.currentRoleBadgeText,
                      { color: currentRoleInfo.textColor },
                    ]}
                  >
                    {currentRoleInfo.badgeLabel}
                  </Text>
                </View>
              </View>
            </View>

            {/* Permission Scenarios */}
            {hasNoPermission ? (
              <View style={styles.noticeCard}>
                <View
                  style={[
                    styles.noticeIconBox,
                    { backgroundColor: BENTO.blueSoft },
                  ]}
                >
                  <Feather name="info" size={18} color={BENTO.blueText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>Member Access</Text>
                  <Text style={styles.noticeText}>
                    Administrative permissions are restricted to Course
                    Instructors, Class Representatives, and TAs.
                  </Text>
                </View>
              </View>
            ) : isBlocked ? (
              <View style={styles.noticeCard}>
                <View
                  style={[
                    styles.noticeIconBox,
                    { backgroundColor: BENTO.amberSoft },
                  ]}
                >
                  <Feather name="shield" size={18} color={BENTO.amberText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>Instructor Protected</Text>
                  <Text style={styles.noticeText}>
                    As a{" "}
                    {myRole === "TA"
                      ? "Teaching Assistant"
                      : "Class Representative"}
                    , you cannot modify role permissions or remove course
                    instructors.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                {/* Role Assignment Bento Grid (Only when managing others) */}
                {!isSelf && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>ASSIGN ROLE</Text>

                    <View style={styles.rolesGrid}>
                      {availableRoles.map((role) => {
                        const isCurrent = selectedMember.role === role;
                        const roleMeta = ROLE_CONFIG[role] || ROLE_CONFIG.STUDENT;

                        return (
                          <TouchableOpacity
                            key={role}
                            disabled={isPending || isCurrent}
                            style={[
                              styles.roleCard,
                              isCurrent && styles.roleCardActive,
                            ]}
                            onPress={() => onUpdateRole(role)}
                            activeOpacity={0.75}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Assign ${roleMeta.title} role`}
                          >
                            <View
                              style={[
                                styles.roleIconBox,
                                { backgroundColor: roleMeta.softBg },
                                isCurrent && {
                                  backgroundColor: BENTO.mintSoft,
                                },
                              ]}
                            >
                              <Feather
                                name={roleMeta.icon}
                                size={16}
                                color={
                                  isCurrent
                                    ? BENTO.mintText
                                    : roleMeta.textColor
                                }
                              />
                            </View>

                            <View style={styles.roleTextCol}>
                              <View style={styles.roleTitleRow}>
                                <Text
                                  style={[
                                    styles.roleTitle,
                                    isCurrent && styles.roleTitleActive,
                                  ]}
                                >
                                  {roleMeta.title}
                                </Text>

                                {isCurrent && (
                                  <View style={styles.activeCheckBadge}>
                                    <Feather
                                      name="check"
                                      size={10}
                                      color={BENTO.mintText}
                                      style={{ marginRight: 3 }}
                                    />
                                    <Text style={styles.activeCheckText}>
                                      Current
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.roleDescription}>
                                {roleMeta.description}
                              </Text>
                            </View>

                            {isPending && isCurrent ? (
                              <ActivityIndicator
                                size="small"
                                color={BENTO.navy}
                                style={{ marginLeft: 8 }}
                              />
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Destructive Action Card (Leave or Remove) */}
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>
                    {isSelf ? "MEMBERSHIP ACTION" : "DANGER ZONE"}
                  </Text>

                  <TouchableOpacity
                    style={styles.destructiveCard}
                    onPress={handleDestructiveAction}
                    disabled={isPending}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isSelf ? "Leave Course Hub" : "Remove member from class"
                    }
                  >
                    <View style={styles.destructiveIconCircle}>
                      <Feather
                        name={isSelf ? "log-out" : "user-x"}
                        size={16}
                        color={BENTO.roseText}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.destructiveTitle}>
                        {isSelf ? "Leave Course Hub" : "Remove from Course Hub"}
                      </Text>
                      <Text style={styles.destructiveSubtitle}>
                        {isSelf
                          ? "You will lose access to all discussions & coursework"
                          : "Revoke member's enrollment and access to this hub"}
                      </Text>
                    </View>

                    <Feather
                      name="chevron-right"
                      size={16}
                      color={BENTO.roseText}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Bottom Done Button */}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={onClose}
              disabled={isPending}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Done and close modal"
            >
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BENTO.border,
    maxWidth: 480,
    width: "100%",
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerLeftCol: {
    flex: 1,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.canvas,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollBody: {
    padding: 18,
    paddingBottom: 22,
  },

  // Profile Card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 14,
    marginBottom: 18,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
  },
  profileInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  memberName: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO.navy,
    flexShrink: 1,
  },
  youBadge: {
    backgroundColor: BENTO.blueSoft,
    borderWidth: 1,
    borderColor: BENTO.blueBorder,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  youBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.blueText,
  },
  memberEmail: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginBottom: 6,
  },
  currentRoleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  currentRoleBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },

  // Notice / Permission Card
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 14,
    marginBottom: 16,
  },
  noticeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  noticeTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 2,
  },
  noticeText: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    lineHeight: 17,
  },

  // Section Blocks
  sectionBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Role Grid
  rolesGrid: {
    gap: 8,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BENTO.border,
    padding: 12,
  },
  roleCardActive: {
    borderColor: BENTO.mintBorder,
    backgroundColor: "#fcfefc",
  },
  roleIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  roleTextCol: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  roleTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },
  roleTitleActive: {
    fontWeight: "800",
  },
  activeCheckBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.mintSoft,
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  activeCheckText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.mintText,
  },
  roleDescription: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 15,
  },

  // Destructive Action Card
  destructiveCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.roseSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    padding: 12,
  },
  destructiveIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  destructiveTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.roseText,
    marginBottom: 2,
  },
  destructiveSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#9f1239",
    lineHeight: 14,
  },

  // Done Button
  doneBtn: {
    backgroundColor: BENTO.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  doneBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.slate,
  },
});
