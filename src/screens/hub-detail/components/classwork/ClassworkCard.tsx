import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AssessmentData } from "./types";
import {
  getAssessmentTypeConfig,
  getSubmissionTypeInfo,
  getRemainingDaysInfo,
  formatDueDate,
} from "./utils";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface ClassworkCardProps {
  item: AssessmentData;
  canManage: boolean;
  onPress: (item: AssessmentData) => void;
  onOptionsPress?: (item: AssessmentData) => void;
  onEdit?: (item: AssessmentData) => void;
  onDelete?: (item: AssessmentData) => void;
  currentUserId?: string;
  isTeacher?: boolean;
}

export const ClassworkCard: React.FC<ClassworkCardProps> = React.memo(
  ({
    item,
    canManage,
    onPress,
    onOptionsPress,
    onEdit,
    onDelete,
    currentUserId,
    isTeacher,
  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuCoords, setMenuCoords] = useState<{ top: number; right: number }>({
      top: 0,
      right: 16,
    });
    const moreBtnRef = useRef<View>(null);

    const handleOpenMenu = () => {
      if (moreBtnRef.current) {
        moreBtnRef.current.measureInWindow((x, y, width, height) => {
          const windowWidth = Dimensions.get("window").width;
          const windowHeight = Dimensions.get("window").height;
          const menuHeight = 110;

          if (typeof y === "number" && !isNaN(y) && y > 0) {
            let top = y + height + 6;
            let right = Math.max(16, windowWidth - (x + width));
            if (top + menuHeight > windowHeight - 20) {
              top = Math.max(20, y - menuHeight - 6);
            }
            setMenuCoords({ top, right });
          } else {
            setMenuCoords({ top: 100, right: 16 });
          }
          setIsMenuOpen(true);
        });
      } else {
        setMenuCoords({ top: 100, right: 16 });
        setIsMenuOpen(true);
      }
    };

    const handleEdit = () => {
      setIsMenuOpen(false);
      if (onEdit) {
        onEdit(item);
      } else if (onOptionsPress) {
        onOptionsPress(item);
      }
    };

    const handleDelete = () => {
      setIsMenuOpen(false);
      onDelete?.(item);
    };
    const typeConfig = getAssessmentTypeConfig(item.type);
    const submissionTypeInfo = getSubmissionTypeInfo(item.submissionType);
    const remainingDaysInfo = getRemainingDaysInfo(item.deadline);

    // Current user's submission
    const mySub = useMemo(() => {
      if (item.mySubmission) return item.mySubmission;
      if (!currentUserId || !item.submissions || !Array.isArray(item.submissions)) {
        return undefined;
      }
      return item.submissions.find(
        (s: any) =>
          s.studentId === currentUserId ||
          s.student?.id === currentUserId ||
          (s.student as any)?.userId === currentUserId
      );
    }, [item.mySubmission, item.submissions, currentUserId]);

    const isSubmitted = !!mySub;
    const isGraded = mySub?.marks !== null && mySub?.marks !== undefined;

    const submittedCount = useMemo(() => {
      if (item.submissionStats?.total !== undefined) return item.submissionStats.total;
      return Array.isArray(item.submissions) ? item.submissions.length : 0;
    }, [item.submissionStats, item.submissions]);

    const gradedCount = useMemo(() => {
      if (item.submissionStats?.graded !== undefined) return item.submissionStats.graded;
      if (Array.isArray(item.submissions)) {
        return item.submissions.filter(
          (s: any) => s.marks !== null && s.marks !== undefined
        ).length;
      }
      return 0;
    }, [item.submissionStats, item.submissions]);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onPress(item)}
      >
        <View style={styles.cardContentRow}>
          {/* Left Circular Type Icon */}
          <View
            style={[
              styles.typeIconContainer,
              {
                backgroundColor: typeConfig.iconBg,
                borderColor: typeConfig.iconBorder,
              },
            ]}
          >
            {typeConfig.assetIcon ? (
              <Image
                source={typeConfig.assetIcon}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            ) : (
              <Feather
                name={typeConfig.icon}
                size={20}
                color={typeConfig.iconColor}
              />
            )}
          </View>

          {/* Right Details Column */}
          <View style={styles.cardDetailsCol}>
            {/* Top Row: Type Pill Badge, Submission Type Badge & 3-Dots Action Menu */}
            <View style={styles.cardTopRow}>
              <View style={styles.badgesCluster}>
                <View
                  style={[
                    styles.typeBadgePill,
                    { backgroundColor: typeConfig.badgeBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      { color: typeConfig.badgeText },
                    ]}
                  >
                    {typeConfig.label}
                  </Text>
                </View>

                <View
                  style={[
                    styles.submissionTypeBadge,
                    submissionTypeInfo.isHand
                      ? styles.submissionTypeBadgeHand
                      : styles.submissionTypeBadgeOnline,
                  ]}
                >
                  <Feather
                    name={submissionTypeInfo.icon}
                    size={10}
                    color={submissionTypeInfo.isHand ? "#b45309" : "#0284c7"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.submissionTypeText,
                      {
                        color: submissionTypeInfo.isHand ? "#b45309" : "#0284c7",
                      },
                    ]}
                  >
                    {submissionTypeInfo.label}
                  </Text>
                </View>

                {/* Late Submission Policy Badge */}
                <View
                  style={[
                    styles.policyBadge,
                    item.allowLateSubmission
                      ? styles.policyBadgeLate
                      : styles.policyBadgeStrict,
                  ]}
                >
                  <Feather
                    name={item.allowLateSubmission ? "clock" : "lock"}
                    size={9.5}
                    color={item.allowLateSubmission ? "#0d9488" : "#64748b"}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.policyBadgeText,
                      item.allowLateSubmission
                        ? styles.policyBadgeTextLate
                        : styles.policyBadgeTextStrict,
                    ]}
                  >
                    {item.allowLateSubmission ? "Late OK" : "Strict"}
                  </Text>
                </View>
              </View>

              {canManage && (
                <View collapsable={false} ref={moreBtnRef}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleOpenMenu();
                    }}
                    style={styles.moreBtn}
                    activeOpacity={0.6}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Classwork options"
                  >
                    <Feather name="more-vertical" size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Classwork Title & Submitted Status */}
            <View style={styles.titleRow}>
              <Text style={styles.classworkTitle}>{item.title}</Text>
              {isSubmitted && (
                <View
                  style={[
                    styles.statusBadge,
                    mySub?.isLate
                      ? styles.statusBadgeLate
                      : styles.statusBadgeSubmitted,
                  ]}
                >
                  <Feather
                    name={mySub?.isLate ? "clock" : "check"}
                    size={10}
                    color={mySub?.isLate ? "#d97706" : "#16a34a"}
                    style={{ marginRight: 3.5 }}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      mySub?.isLate
                        ? styles.statusBadgeLateText
                        : styles.statusBadgeSubmittedText,
                    ]}
                  >
                    {mySub?.isLate ? "Submitted (Late)" : "Submitted"}
                  </Text>
                </View>
              )}
            </View>

            {/* Due Date & Remaining Days Badge */}
            <View style={styles.dueRow}>
              <Text style={styles.dueText}>
                Due: {formatDueDate(item.deadline)}
              </Text>
              {remainingDaysInfo && !isSubmitted && !(remainingDaysInfo.isOverdue && item.allowLateSubmission) && (
                <View
                  style={[
                    styles.remainingBadge,
                    remainingDaysInfo.isOverdue
                      ? styles.remainingBadgeOverdue
                      : remainingDaysInfo.isUrgent
                        ? styles.remainingBadgeUrgent
                        : styles.remainingBadgeNormal,
                  ]}
                >
                  <Feather
                    name={
                      remainingDaysInfo.isOverdue
                        ? "lock"
                        : remainingDaysInfo.isUrgent
                          ? "alert-circle"
                          : "clock"
                    }
                    size={10}
                    color={
                      remainingDaysInfo.isOverdue
                        ? "#dc2626"
                        : remainingDaysInfo.isUrgent
                          ? "#b45309"
                          : "#475569"
                    }
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.remainingBadgeText,
                      remainingDaysInfo.isOverdue
                        ? styles.remainingBadgeTextOverdue
                        : remainingDaysInfo.isUrgent
                          ? styles.remainingBadgeTextUrgent
                          : styles.remainingBadgeTextNormal,
                    ]}
                  >
                    {remainingDaysInfo.isOverdue
                      ? "Closed"
                      : remainingDaysInfo.text}
                  </Text>
                </View>
              )}
            </View>

            {/* Max Marks & Graded Tag Row */}
            <View style={styles.marksRow}>
              <Text style={styles.maxMarksText}>
                Max Marks: {item.totalMarks}
              </Text>
              {/* Student View: Graded Tag */}
              {!isTeacher && isGraded && (
                <View style={styles.statusBadgeGraded}>
                  <Feather
                    name="award"
                    size={10}
                    color="#7c3aed"
                    style={{ marginRight: 3.5 }}
                  />
                  <Text style={styles.statusBadgeGradedText}>
                    Graded • {mySub?.marks}/{item.totalMarks}
                  </Text>
                </View>
              )}

              {/* Teacher View: Submissions & Graded Tags */}
              {isTeacher && (
                <>
                  <View style={styles.teacherSubmittedBadge}>
                    <Feather
                      name="users"
                      size={10}
                      color="#0284c7"
                      style={{ marginRight: 3.5 }}
                    />
                    <Text style={styles.teacherSubmittedBadgeText}>
                      {submittedCount} submitted
                    </Text>
                  </View>

                  <View style={styles.teacherGradedBadge}>
                    <Feather
                      name="award"
                      size={10}
                      color="#16a34a"
                      style={{ marginRight: 3.5 }}
                    />
                    <Text style={styles.teacherGradedBadgeText}>
                      {gradedCount} graded
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* 3-Dots Dropdown Menu Modal */}
        <Modal
          visible={isMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setIsMenuOpen(false)}
            accessible={false}
          >
            <View
              style={[
                styles.dropdownMenu,
                {
                  top: menuCoords.top,
                  right: menuCoords.right,
                },
              ]}
              onStartShouldSetResponder={() => true}
            >
              <TouchableOpacity
                style={styles.dropdownItem}
                activeOpacity={0.7}
                onPress={handleEdit}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Edit classwork"
              >
                <View
                  style={[styles.dropdownIconBox, styles.dropdownIconBoxEdit]}
                >
                  <Feather name="edit-2" size={14} color="#2563eb" />
                </View>
                <Text style={styles.dropdownItemText}>Edit Classwork</Text>
              </TouchableOpacity>

              <View style={styles.dropdownDivider} />

              <TouchableOpacity
                style={[styles.dropdownItem, styles.dropdownItemDelete]}
                activeOpacity={0.7}
                onPress={handleDelete}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Delete classwork"
              >
                <View
                  style={[styles.dropdownIconBox, styles.dropdownIconBoxDelete]}
                >
                  <Feather name="trash-2" size={14} color="#e11d48" />
                </View>
                <Text
                  style={[styles.dropdownItemText, styles.dropdownItemTextDelete]}
                >
                  Delete Classwork
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </TouchableOpacity>
    );
  }
);

ClassworkCard.displayName = "ClassworkCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 2,
  },
  cardDetailsCol: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  badgesCluster: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  typeBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
    alignSelf: "flex-start",
  },
  typeBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
  },
  submissionTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  submissionTypeBadgeOnline: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  submissionTypeBadgeHand: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  submissionTypeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
  },
  moreBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.12)",
  },
  dropdownMenu: {
    position: "absolute",
    minWidth: 195,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  dropdownItemDelete: {},
  dropdownIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownIconBoxEdit: {
    backgroundColor: "#eff6ff",
  },
  dropdownIconBoxDelete: {
    backgroundColor: "#fff1f2",
  },
  dropdownItemText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: "#131b2e",
    letterSpacing: -0.1,
  },
  dropdownItemTextDelete: {
    color: "#e11d48",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "rgba(19, 27, 46, 0.06)",
    marginVertical: 3,
    marginHorizontal: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  classworkTitle: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 20,
  },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 3,
  },
  dueText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    color: "#64748b",
  },
  remainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6.5,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  remainingBadgeNormal: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  remainingBadgeUrgent: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  remainingBadgeOverdue: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  remainingBadgeLateAllowed: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  remainingBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  remainingBadgeTextNormal: {
    color: "#475569",
  },
  remainingBadgeTextUrgent: {
    color: "#b45309",
  },
  remainingBadgeTextOverdue: {
    color: "#dc2626",
  },
  remainingBadgeTextLateAllowed: {
    color: "#b45309",
  },
  marksRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 3,
  },
  maxMarksText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748b",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusBadgeSubmitted: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statusBadgeLate: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  statusBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
  },
  statusBadgeSubmittedText: {
    color: "#16a34a",
  },
  statusBadgeLateText: {
    color: "#d97706",
  },
  statusBadgeGraded: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },
  statusBadgeGradedText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#7e22ce",
  },
  statusBadgeTeacher: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  statusBadgeTeacherText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#475569",
  },
  teacherSubmittedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },
  teacherSubmittedBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#0284c7",
  },
  teacherGradedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  teacherGradedBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: "#16a34a",
  },
  policyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  policyBadgeStrict: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  policyBadgeLate: {
    backgroundColor: "#f0fdfa",
    borderColor: "#99f6e4",
  },
  policyBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  policyBadgeTextStrict: {
    color: "#64748b",
  },
  policyBadgeTextLate: {
    color: "#0f766e",
  },
});
