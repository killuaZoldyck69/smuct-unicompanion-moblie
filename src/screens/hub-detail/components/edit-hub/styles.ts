import { StyleSheet } from "react-native";
import { BENTO_THEME, BENTO_FONT_FAMILY } from "@/screens/hubs/components/create-hub";

export const editHubStyles = StyleSheet.create({
  // --- Modal Shell ---
  container: {
    flex: 1,
    backgroundColor: BENTO_THEME.canvas,
  },

  // --- Header ---
  header: {
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
  headerLeft: {
    flex: 1,
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
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  // --- Scroll Content ---
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  subtitle: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13,
    color: BENTO_THEME.slateMuted,
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 4,
  },

  // --- Bento Cards ---
  bentoCard: {
    borderRadius: BENTO_THEME.cardRadius,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    ...BENTO_THEME.shadow,
  },
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
  roseBentoCard: {
    backgroundColor: BENTO_THEME.roseSoft,
    borderColor: BENTO_THEME.roseBorder,
  },

  // --- Card Header ---
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
    fontWeight: "500",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BENTO_THEME.pillRadius,
  },
  statusBadgeText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // --- Form Fields ---
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  blueInputRow: {
    backgroundColor: "#ffffff",
    borderColor: BENTO_THEME.blueBorder,
  },
  mintInputRow: {
    backgroundColor: "#ffffff",
    borderColor: BENTO_THEME.mintBorder,
  },
  amberInputRow: {
    backgroundColor: "#ffffff",
    borderColor: BENTO_THEME.amberBorder,
  },
  roseInputRow: {
    backgroundColor: "#ffffff",
    borderColor: BENTO_THEME.roseBorder,
  },
  leadingIcon: {
    marginRight: 9,
  },
  textInput: {
    flex: 1,
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_THEME.navy,
    paddingVertical: 0,
    height: "100%",
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },

  // --- Grid Layout ---
  grid: {
    flexDirection: "row",
    gap: 10,
  },
  gridItem: {
    flex: 1,
    marginBottom: 12,
  },

  // --- Schedule Item Card (Amber) ---
  scheduleItemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO_THEME.amberBorder,
    padding: 12,
    marginBottom: 10,
  },
  scheduleItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scheduleBadge: {
    backgroundColor: BENTO_THEME.amberHeaderBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO_THEME.pillRadius,
  },
  scheduleBadgeText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_THEME.amberIcon,
    letterSpacing: 0.3,
  },
  deleteBtn: {
    padding: 4,
  },
  pickerText: {
    flex: 1,
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_THEME.navy,
  },
  addScheduleBtn: {
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
  addScheduleBtnText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_THEME.amberIcon,
  },

  // --- Helper Note ---
  helperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    paddingHorizontal: 2,
  },
  helperText: {
    flex: 1,
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 11.5,
    color: BENTO_THEME.slateMuted,
    lineHeight: 16,
  },

  // --- Exam Card (Rose) ---
  examCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO_THEME.roseBorder,
    padding: 12,
    marginBottom: 10,
  },
  examCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  examBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_THEME.pillRadius,
  },
  examBadgeText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_THEME.roseIcon,
    letterSpacing: 0.3,
  },
  clearExamText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_THEME.roseIcon,
  },

  // --- Footer Actions ---
  footer: {
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131b2e",
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BENTO_THEME.border,
    borderRadius: 14,
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontFamily: BENTO_FONT_FAMILY,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO_THEME.slate,
  },
});
