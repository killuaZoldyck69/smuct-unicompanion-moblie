import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CourseHubMember, HubRole } from "@/types/member.types";
import { BENTO, fontFamily } from "../constants";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ProfileDetailsGrid } from "./ProfileDetailsGrid";
import { RoleSelectorSection } from "./RoleSelectorSection";
import { MemberDestructiveAction } from "./MemberDestructiveAction";

interface ManageMemberModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedMember: CourseHubMember | null;
  myRole: string;
  myUserId: string;
  onUpdateRole: (role: HubRole) => void;
  onRemoveMember: () => void;
  isPending: boolean;
}

export function ManageMemberModal({
  isVisible,
  onClose,
  selectedMember,
  myRole,
  myUserId,
  onUpdateRole,
  onRemoveMember,
  isPending,
}: ManageMemberModalProps) {
  const insets = useSafeAreaInsets();
  if (!selectedMember) return null;

  const isSelf = selectedMember.user?.id === myUserId;
  const isTargetTeacher = selectedMember.role === "TEACHER";
  const isManager = ["TEACHER", "CR", "TA"].includes(myRole);

  const isBlocked = !isSelf && isTargetTeacher && myRole !== "TEACHER";
  const hasNoPermission = !isManager && !isSelf;

  const availableRoles: HubRole[] =
    myRole === "TEACHER"
      ? ["STUDENT", "CR", "TA", "TEACHER"]
      : ["STUDENT", "CR", "TA"];

  const modalTitle = isSelf
    ? "My Profile & Membership"
    : isTargetTeacher
    ? "Faculty Details"
    : "Member Details";

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <ExpoStatusBar style="light" />

      <View
        style={[
          styles.modalBackdrop,
          { paddingTop: Math.max(insets.top + 16, 44) },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTap}
          activeOpacity={1}
          onPress={isPending ? undefined : onClose}
        />

        <View style={styles.sheetWrap}>
          <View
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom + 16, 28) },
            ]}
          >
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>

            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>{modalTitle}</Text>
              <TouchableOpacity
                onPress={onClose}
                disabled={isPending}
                style={styles.closeBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={17} color={BENTO.slate} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <ProfileHeroCard member={selectedMember} isSelf={isSelf} />

              <ProfileDetailsGrid member={selectedMember} />

              {hasNoPermission ? null : isBlocked ? (
                <View style={styles.noticeBox}>
                  <Feather
                    name="shield"
                    size={15}
                    color={BENTO.amberText}
                    style={styles.noticeIcon}
                  />
                  <Text style={styles.noticeText}>
                    Only course instructors can manage instructor permissions.
                  </Text>
                </View>
              ) : (
                <>
                  {!isSelf && (
                    <RoleSelectorSection
                      currentRole={selectedMember.role}
                      availableRoles={availableRoles}
                      isPending={isPending}
                      onSelectRole={onUpdateRole}
                    />
                  )}

                  <MemberDestructiveAction
                    isSelf={isSelf}
                    memberName={selectedMember.user?.name}
                    isPending={isPending}
                    onConfirm={onRemoveMember}
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  backdropTap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetWrap: {
    width: "100%",
    justifyContent: "flex-end",
    maxHeight: "90%",
  },
  modalSheet: {
    backgroundColor: BENTO.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 10,
    paddingHorizontal: 20,
    width: "100%",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(15, 23, 42, 0.08)",
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handleWrap: {
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 8,
  },
  handle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 16,
  },
  noticeIcon: {
    marginRight: 8,
  },
  noticeText: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    lineHeight: 16,
  },
});
