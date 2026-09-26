import { StyleSheet } from "react-native";
import { BENTO_THEME, BENTO_FONT_FAMILY } from "./constants";

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: BENTO_THEME.canvas,
  },

  // 1. Top Header
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_THEME.borderSubtle,
    backgroundColor: BENTO_THEME.canvas,
  },
  headerLeftGroup: {
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 22,
    fontWeight: "800",
    color: BENTO_THEME.navy,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_THEME.border,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  modalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pageSubtitle: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13,
    color: BENTO_THEME.slateMuted,
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 4,
  },

  // 2. Base Bento Card
  bentoCard: {
    borderRadius: BENTO_THEME.cardRadius,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    ...BENTO_THEME.shadow,
  },

  // Section Color Themes
  blueBentoCard: {
    backgroundColor: BENTO_THEME.blueCardBg,
    borderColor: BENTO_THEME.blueBorder,
  },
  mintBentoCard: {
    backgroundColor: BENTO_THEME.mintCardBg,
    borderColor: BENTO_THEME.mintBorder,
  },
  amberBentoCard: {
    backgroundColor: BENTO_THEME.amberCardBg,
    borderColor: BENTO_THEME.amberBorder,
  },
  purpleBentoCard: {
    backgroundColor: BENTO_THEME.purpleCardBg,
    borderColor: BENTO_THEME.purpleBorder,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  cardHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardHeaderTextGroup: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_THEME.navy,
    letterSpacing: -0.1,
  },
  cardHeaderSub: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 11,
    marginTop: 1,
    fontWeight: "500",
  },
  requiredBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BENTO_THEME.pillRadius,
  },
  requiredBadgeText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // 3. Form Inputs
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  blueInputBox: {
    backgroundColor: "#ffffff",
    borderColor: BENTO_THEME.blueBorder,
  },
  mintInputBox: {
    backgroundColor: "#ffffff",
    borderColor: BENTO_THEME.mintBorder,
  },
  amberInputBox: {
    backgroundColor: "#ffffff",
    borderColor: BENTO_THEME.amberBorder,
  },
  disabledInputBox: {
    backgroundColor: "#f8fafc",
    borderColor: "rgba(19, 27, 46, 0.08)",
  },
  inputLeadingIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_THEME.navy,
    paddingVertical: 0,
    height: "100%",
  },
  disabledInputText: {
    color: BENTO_THEME.slateMuted,
  },

  gridRow: {
    flexDirection: "row",
    gap: 10,
  },
  gridItem: {
    flex: 1,
    marginBottom: 12,
  },

  // 4. CR Auto-Assigned Cohort Card
  crCohortCard: {
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  crCohortHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  crCohortHeaderTitle: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_THEME.navy,
  },
  crVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BENTO_THEME.pillRadius,
    gap: 3,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  crVerifiedText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 9.5,
    fontWeight: "700",
    color: "#15803d",
    letterSpacing: 0.2,
  },
  crCohortPillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  crCohortChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO_THEME.mintBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  crCohortChipText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },

  // 5. Schedules (Soft Amber)
  amberScheduleItemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO_THEME.amberBorder,
    padding: 12,
    marginBottom: 10,
  },
  scheduleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  amberScheduleBadge: {
    backgroundColor: BENTO_THEME.amberHeaderBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_THEME.pillRadius,
  },
  amberScheduleBadgeText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_THEME.amberIcon,
    letterSpacing: 0.3,
  },
  deleteScheduleBtn: {
    padding: 4,
  },
  pickerValueText: {
    flex: 1,
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_THEME.navy,
  },
  timeValueText: {
    flex: 1,
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_THEME.navy,
  },
  amberAddScheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO_THEME.amberBorder,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 2,
    gap: 6,
  },
  amberAddScheduleText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_THEME.amberIcon,
  },

  // 6. Teacher Self Assigned (For Teachers)
  teacherSelfCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO_THEME.purpleBorder,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  teacherSelfAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_THEME.purpleHeaderBg,
    alignItems: "center",
    justifyContent: "center",
  },
  teacherSelfName: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_THEME.navy,
  },
  teacherSelfSub: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 11,
    color: BENTO_THEME.purpleSub,
    marginTop: 1,
  },

  // 7. Bottom Action Buttons
  bottomActions: {
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  bottomCreateBtn: {
    backgroundColor: "#131b2e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  bottomCreateBtnText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  bottomResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO_THEME.border,
    borderRadius: 14,
    paddingVertical: 12,
  },
  bottomResetBtnText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_THEME.slate,
  },

  // 8. Day Picker Modal Sheet
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(19, 27, 46, 0.4)",
  },
  modalOverlayBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalDropdownSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: 380,
  },
  modalSheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(19, 27, 46, 0.15)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalSheetTitle: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 16,
    fontWeight: "700",
    color: BENTO_THEME.navy,
  },
  sheetCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BENTO_THEME.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalListItemActive: {
    backgroundColor: "#f0fdf4",
  },
  modalListItemText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "500",
    color: BENTO_THEME.slate,
  },
  modalListItemTextActive: {
    fontWeight: "700",
    color: "#15803d",
  },
});
