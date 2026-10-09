import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingSettings } from "@/services/field-service";
import { BENTO } from "../constants";
import { CampusFieldArt } from "./campus-field-art";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const deepNavy = "#131b2e";

interface BookingHeaderProps {
  isLoadingSettings: boolean;
  settings?: FieldBookingSettings | null;
  onBookField?: () => void;
  canBook?: boolean;
  isAdmin?: boolean;
  onManageGround?: () => void;
}

export const BookingHeader = memo(function BookingHeader({
  isLoadingSettings,
  settings,
  onBookField,
  canBook = true,
  isAdmin = false,
  onManageGround,
}: BookingHeaderProps) {
  const isClosed = !isLoadingSettings && settings?.isBookingOpen === false;
  const closureReason =
    settings?.closureReason ||
    (settings as any)?.closedNotice ||
    "The campus field is temporarily closed for maintenance or university scheduled events.";

  return (
    <View style={styles.container}>
      {/* Top Row: Title & Subtitle on Left, Campus Artwork on Right */}
      <View style={styles.headerTopRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.headerTitle}>Field Booking</Text>
          <Text style={styles.headerSubtitle}>
            Reserve university sports grounds for matches, practice & events.
          </Text>
        </View>

        <View style={styles.artColumn}>
          <CampusFieldArt />
        </View>
      </View>

      {/* Availability Row: Status on the left, + Book Field button directly on the right */}
      {!isLoadingSettings && (
        <View style={styles.availabilityRow}>
          <View style={styles.statusChipWrapper}>
            {!isClosed ? (
              <View style={styles.groundOpenChip}>
                <View style={styles.livePulseDot} />
                <Text style={styles.groundOpenText} numberOfLines={1}>
                  Ground open for reservations
                </Text>
              </View>
            ) : (
              <View style={styles.groundClosedChip}>
                <View style={styles.closedPulseDot} />
                <Text style={styles.groundClosedText} numberOfLines={1}>
                  Reservations closed
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerRightActions}>
            {isAdmin && onManageGround && (
              <TouchableOpacity
                style={styles.manageGroundBtn}
                onPress={onManageGround}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Manage ground status and notice"
              >
                <Feather
                  name="sliders"
                  size={12.5}
                  color={BENTO.navy}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.manageGroundText}>Manage</Text>
              </TouchableOpacity>
            )}

            {!isAdmin && canBook && onBookField && (
              <TouchableOpacity
                style={styles.bookFieldHeaderBtn}
                onPress={onBookField}
                activeOpacity={0.85}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Book campus sports field"
              >
                <Feather
                  name="plus"
                  size={13}
                  color="#ffffff"
                  style={styles.bookFieldBtnIcon}
                />
                <Text style={styles.bookFieldHeaderBtnText}>Book Field</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Closure Banner if ground closed */}
      {isClosed && (
        <View style={styles.noticeBanner}>
          <View style={styles.noticeHeaderRow}>
            <Feather name="alert-triangle" size={16} color={BENTO.rose} />
            <Text style={styles.noticeTitle}>Field Currently Unavailable</Text>
          </View>
          <Text style={styles.noticeDesc}>{closureReason}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: BENTO.canvas,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleColumn: {
    flex: 1,
    paddingRight: 10,
    paddingTop: 6,
  },
  headerTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: deepNavy,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 7,
    lineHeight: 18,
  },
  artColumn: {
    width: 120,
    height: 76,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  availabilityRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
  },
  statusChipWrapper: {
    flexShrink: 1,
    marginRight: 8,
  },
  groundOpenChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: BENTO.emerald,
    marginRight: 6.5,
  },
  groundOpenText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO.emerald,
  },
  groundClosedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.roseBg,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  closedPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: BENTO.rose,
    marginRight: 6.5,
  },
  groundClosedText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO.rose,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manageGroundBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  manageGroundText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO.navy,
  },
  bookFieldHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 18,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  bookFieldBtnIcon: {
    marginRight: 4,
  },
  bookFieldHeaderBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  noticeBanner: {
    backgroundColor: BENTO.roseBg,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  noticeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.rose,
    marginLeft: 6,
  },
  noticeDesc: {
    fontSize: 11.5,
    color: "#991b1b",
    lineHeight: 16,
  },
});
