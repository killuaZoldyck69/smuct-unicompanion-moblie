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

interface BookingHeaderProps {
  onBack: () => void;
  isLoadingSettings: boolean;
  settings?: FieldBookingSettings | null;
}

export const BookingHeader = memo(function BookingHeader({
  onBack,
  isLoadingSettings,
  settings,
}: BookingHeaderProps) {
  const isClosed = !isLoadingSettings && settings?.isBookingOpen === false;
  const closureReason =
    settings?.closureReason ||
    (settings as any)?.closedNotice ||
    "The administration has temporarily disabled ground bookings for maintenance or scheduled events.";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color={BENTO.navy} />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Field Booking</Text>
            <Text style={styles.headerSubtitle}>
              Reserve university sports ground for matches & events
            </Text>
          </View>
        </View>

        {!isLoadingSettings && (
          <View style={styles.statusIndicatorRow}>
            {!isClosed ? (
              <View style={styles.groundOpenChip}>
                <View style={styles.liveDotOpen} />
                <Text style={styles.groundOpenText}>
                  Ground Open for Reservations
                </Text>
              </View>
            ) : (
              <View style={styles.groundClosedChip}>
                <View style={styles.liveDotClosed} />
                <Text style={styles.groundClosedText}>
                  Reservations Temporarily Paused
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {isClosed && (
        <View style={styles.noticeBanner}>
          <View style={styles.noticeHeaderRow}>
            <Feather name="alert-triangle" size={18} color={BENTO.rose} />
            <Text style={styles.noticeTitle}>Ground Currently Closed</Text>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO.card,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.5,
    fontFamily:
      Platform.OS === "web"
        ? "var(--font-heading), 'Plus Jakarta Sans', system-ui, sans-serif"
        : undefined,
  },
  headerSubtitle: {
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 2,
    fontFamily:
      Platform.OS === "web"
        ? "var(--font-body), 'Plus Jakarta Sans', system-ui, sans-serif"
        : undefined,
  },
  statusIndicatorRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  groundOpenChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.emeraldBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.emeraldBorder,
  },
  liveDotOpen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BENTO.emerald,
    marginRight: 6,
  },
  groundOpenText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.emerald,
  },
  groundClosedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.roseBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  liveDotClosed: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BENTO.rose,
    marginRight: 6,
  },
  groundClosedText: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.rose,
  },
  noticeBanner: {
    backgroundColor: BENTO.roseBg,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
  },
  noticeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.rose,
    marginLeft: 8,
  },
  noticeDesc: {
    fontSize: 12,
    color: "#991b1b",
    lineHeight: 18,
  },
});
