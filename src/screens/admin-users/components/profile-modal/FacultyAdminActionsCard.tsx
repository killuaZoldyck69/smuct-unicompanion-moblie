import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AdminUser } from "../../types";
import {
  DESIGNATION_OPTIONS,
  TEACHER_ADMIN_ROLE_OPTIONS,
  TeacherAdminRoleOption,
} from "../../constants";

interface FacultyAdminActionsCardProps {
  user: AdminUser;
  onUpdateTeacherPosition?: (
    userId: string,
    data: { designation?: string; administrativeRole?: string | null },
  ) => void;
  isUpdatingPosition?: boolean;
  onDelete?: (userId: string, name: string, isRestricted?: boolean) => void;
  onToggleRestrict?: (userId: string, name: string, isRestricted?: boolean) => void;
  isDeletingUser?: boolean;
  isRestrictingUser?: boolean;
}

export const FacultyAdminActionsCard = React.memo(
  ({
    user,
    onUpdateTeacherPosition,
    isUpdatingPosition = false,
    onDelete,
    onToggleRestrict,
    isDeletingUser,
    isRestrictingUser,
  }: FacultyAdminActionsCardProps) => {
    const handleRestrict = onToggleRestrict || onDelete;
    const isBusy = isRestrictingUser ?? isDeletingUser;

    const [isDesignationModalOpen, setIsDesignationModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const currentDesignation =
      user.teacherProfile?.designation || "Lecturer";
    const currentAdminRole =
      user.teacherProfile?.administrativeRole || null;

    const handleSelectDesignation = useCallback(
      (designation: string) => {
        setIsDesignationModalOpen(false);
        if (designation !== currentDesignation && onUpdateTeacherPosition) {
          onUpdateTeacherPosition(user.id, { designation });
        }
      },
      [user.id, currentDesignation, onUpdateTeacherPosition],
    );

    const handleSelectAdminRole = useCallback(
      (roleValue: string | null) => {
        setIsRoleModalOpen(false);
        if (roleValue !== currentAdminRole && onUpdateTeacherPosition) {
          onUpdateTeacherPosition(user.id, { administrativeRole: roleValue });
        }
      },
      [user.id, currentAdminRole, onUpdateTeacherPosition],
    );

    return (
      <View style={styles.cardContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Feather name="sliders" size={13} color="#0F172A" />
            </View>
            <Text style={styles.headerTitle}>FACULTY ADMIN ACTIONS</Text>
          </View>
        </View>

        {/* 1. Change Designation Button (Dark Navy) */}
        <TouchableOpacity
          style={styles.actionBtnNavy}
          activeOpacity={0.85}
          onPress={() => setIsDesignationModalOpen(true)}
          disabled={isUpdatingPosition}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Change Designation. Current: ${currentDesignation}`}
        >
          <View style={styles.btnContentRow}>
            <View style={styles.btnIconTextGroup}>
              <Feather
                name="award"
                size={16}
                color="#A78BFA"
                style={styles.btnIcon}
              />
              <Text style={styles.btnTextWhite}>Change Designation</Text>
            </View>
            <View style={styles.currentBadgeNavy}>
              <Text style={styles.currentBadgeNavyText} numberOfLines={1}>
                {currentDesignation}
              </Text>
              <Feather
                name="chevron-right"
                size={14}
                color="#94A3B8"
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. Assign / Change Leadership Role Button (Deep Indigo) */}
        <TouchableOpacity
          style={styles.actionBtnIndigo}
          activeOpacity={0.85}
          onPress={() => setIsRoleModalOpen(true)}
          disabled={isUpdatingPosition}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Assign Leadership Role. Current: ${
            currentAdminRole || "None"
          }`}
        >
          <View style={styles.btnContentRow}>
            <View style={styles.btnIconTextGroup}>
              <Ionicons
                name="shield-checkmark"
                size={17}
                color="#FBBF24"
                style={styles.btnIcon}
              />
              <Text style={styles.btnTextWhite}>Leadership Role</Text>
            </View>
            <View
              style={[
                styles.currentBadgeIndigo,
                currentAdminRole ? styles.currentBadgeIndigoActive : null,
              ]}
            >
              <Text
                style={[
                  styles.currentBadgeIndigoText,
                  currentAdminRole
                    ? styles.currentBadgeIndigoTextActive
                    : null,
                ]}
                numberOfLines={1}
              >
                {currentAdminRole || "None"}
              </Text>
              <Feather
                name="chevron-right"
                size={14}
                color={currentAdminRole ? "#F59E0B" : "#94A3B8"}
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. Restrict / Unrestrict Account */}
        {user.isRestricted ? (
          <TouchableOpacity
            style={styles.emeraldBtn}
            activeOpacity={0.85}
            onPress={() => handleRestrict?.(user.id, user.name, user.isRestricted)}
            disabled={isBusy || isUpdatingPosition}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Unrestrict Account"
          >
            <Feather
              name="check-circle"
              size={16}
              color="#059669"
              style={styles.btnIcon}
            />
            <Text style={styles.emeraldBtnText}>Unrestrict Account</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.roseBtn}
            activeOpacity={0.85}
            onPress={() => handleRestrict?.(user.id, user.name, user.isRestricted)}
            disabled={isBusy || isUpdatingPosition}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Restrict Account"
          >
            <Feather
              name="slash"
              size={16}
              color="#E11D48"
              style={styles.btnIcon}
            />
            <Text style={styles.roseBtnText}>Restrict Account</Text>
          </TouchableOpacity>
        )}

        {/* ======================================================== */}
        {/* MODAL 1: CHANGE DESIGNATION                              */}
        {/* ======================================================== */}
        <Modal
          visible={isDesignationModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDesignationModalOpen(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsDesignationModalOpen(false)}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Change Designation</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    Update academic title for {user.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsDesignationModalOpen(false)}
                  style={styles.modalCloseBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close designation dialog"
                >
                  <Feather name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.optionsList}
              >
                {DESIGNATION_OPTIONS.map((designation) => {
                  const isSelected = designation === currentDesignation;
                  return (
                    <TouchableOpacity
                      key={designation}
                      style={[
                        styles.optionItem,
                        isSelected && styles.optionItemSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleSelectDesignation(designation)}
                    >
                      <View style={styles.optionLeft}>
                        <View
                          style={[
                            styles.optionRadio,
                            isSelected && styles.optionRadioSelected,
                          ]}
                        >
                          {isSelected && (
                            <View style={styles.optionRadioInner} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {designation}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.activeCheckBadge}>
                          <Feather name="check" size={13} color="#6366F1" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* ======================================================== */}
        {/* MODAL 2: ASSIGN LEADERSHIP ROLE                          */}
        {/* ======================================================== */}
        <Modal
          visible={isRoleModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsRoleModalOpen(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsRoleModalOpen(false)}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Assign Leadership Role</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    Roles for {user.name} (e.g. HOD, Coordinator, Dean)
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsRoleModalOpen(false)}
                  style={styles.modalCloseBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close leadership role dialog"
                >
                  <Feather name="x" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.optionsList}
              >
                {TEACHER_ADMIN_ROLE_OPTIONS.map((item: TeacherAdminRoleOption) => {
                  const isSelected =
                    (item.value === null && !currentAdminRole) ||
                    (item.value !== null && currentAdminRole === item.value);

                  return (
                    <TouchableOpacity
                      key={item.label}
                      style={[
                        styles.optionItemWithDesc,
                        isSelected && styles.optionItemSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleSelectAdminRole(item.value)}
                    >
                      <View style={styles.optionLeftDescGroup}>
                        <View
                          style={[
                            styles.optionRadio,
                            isSelected && styles.optionRadioSelected,
                          ]}
                        >
                          {isSelected && (
                            <View style={styles.optionRadioInner} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                            ]}
                          >
                            {item.label}
                          </Text>
                          {Boolean(item.description) && (
                            <Text style={styles.optionDesc}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      {isSelected && (
                        <View style={styles.activeCheckBadge}>
                          <Feather name="check" size={13} color="#6366F1" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.8,
  },
  btnIcon: {
    marginRight: 8,
  },
  actionBtnNavy: {
    backgroundColor: "#1E222B",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnIndigo: {
    backgroundColor: "#2E1065",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#2E1065",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnIconTextGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  btnTextWhite: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  currentBadgeNavy: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 150,
  },
  currentBadgeNavyText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  currentBadgeIndigo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 150,
  },
  currentBadgeIndigoActive: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  currentBadgeIndigoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CBD5E1",
  },
  currentBadgeIndigoTextActive: {
    color: "#FDE68A",
    fontWeight: "700",
  },
  emeraldBtn: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emeraldBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
  roseBtn: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  roseBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E11D48",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    paddingBottom: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionItemWithDesc: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionItemSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#818CF8",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionLeftDescGroup: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 10,
  },
  optionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  optionRadioSelected: {
    borderColor: "#6366F1",
  },
  optionRadioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#6366F1",
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  optionLabelSelected: {
    color: "#4338CA",
  },
  optionDesc: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  activeCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
