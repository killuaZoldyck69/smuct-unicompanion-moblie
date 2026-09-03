import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CampusEventItem } from "@/services/event-service";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatEventDate, formatEventTime, safeShareEvent, safeCopyEvent } from "../utils";

interface EventDetailModalProps {
  event: CampusEventItem | null;
  onClose: () => void;
}

export const EventDetailModal = React.memo(function EventDetailModal({
  event,
  onClose,
}: EventDetailModalProps) {
  if (!event) return null;

  const eventDate = new Date(event.eventDate || event.date || event.createdAt);
  const now = new Date();
  const isToday = eventDate.toDateString() === now.toDateString();
  const isPast = eventDate.getTime() < now.getTime() && !isToday;

  const formattedDate = formatEventDate(
    event.eventDate || event.date || event.createdAt,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
  const formattedTime = formatEventTime(
    event.eventDate || event.date || event.createdAt
  );

  return (
    <Modal
      visible={!!event}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={styles.container}
        edges={["top", "bottom"]}
        accessibilityViewIsModal={true}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close event details"
          >
            <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Event Details</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => safeCopyEvent(event)}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Copy event details"
            >
              <Feather name="copy" size={17} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => safeShareEvent(event)}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Share event"
            >
              <Feather name="share-2" size={17} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Pill */}
          <View style={styles.statusRow}>
            {isToday ? (
              <View style={styles.todayPill}>
                <View style={styles.pulseDot} />
                <Text style={styles.todayText}>HAPPENING TODAY</Text>
              </View>
            ) : isPast ? (
              <View style={styles.pastPill}>
                <Text style={styles.pastText}>COMPLETED EVENT</Text>
              </View>
            ) : (
              <View style={styles.upcomingPill}>
                <Text style={styles.upcomingText}>UPCOMING EVENT</Text>
              </View>
            )}
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>

          {/* Bento Details Grid */}
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCard}>
              <View style={[styles.bentoIconCircle, { backgroundColor: "#f0f9ff" }]}>
                <Feather name="calendar" size={18} color="#0284c7" />
              </View>
              <Text style={styles.bentoLabel}>DATE & TIME</Text>
              <Text style={styles.bentoValue}>{formattedDate}</Text>
              <Text style={styles.bentoSub}>{formattedTime}</Text>
            </View>

            <View style={styles.bentoCard}>
              <View style={[styles.bentoIconCircle, { backgroundColor: "#ecfdf5" }]}>
                <Feather name="map-pin" size={18} color="#059669" />
              </View>
              <Text style={styles.bentoLabel}>LOCATION / VENUE</Text>
              <Text style={styles.bentoValue}>
                {event.location || "Permanent Campus"}
              </Text>
              <Text style={styles.bentoSub}>SMUCT Main Campus</Text>
            </View>
          </View>

          {/* Description */}
          {event.description ? (
            <View style={styles.descCard}>
              <Text style={styles.descLabel}>ABOUT THIS EVENT</Text>
              <Text style={styles.descText}>{event.description}</Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => safeShareEvent(event)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Share event with friends"
            >
              <Feather
                name="share-2"
                size={16}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.shareBtnText}>Share Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => safeCopyEvent(event)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Copy event information"
            >
              <Feather
                name="copy"
                size={16}
                color={BENTO_COLORS.deepNavy}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.copyBtnText}>Copy Info</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BENTO_COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
  scrollContent: {
    padding: 20,
  },
  statusRow: {
    marginBottom: 12,
  },
  todayPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    alignSelf: "flex-start",
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
    marginRight: 6,
  },
  todayText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
    letterSpacing: 0.5,
  },
  pastPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    alignSelf: "flex-start",
  },
  pastText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  upcomingPill: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
    alignSelf: "flex-start",
  },
  upcomingText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    lineHeight: 32,
    marginBottom: 20,
  },
  bentoGrid: {
    gap: 12,
    marginBottom: 20,
  },
  bentoCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  bentoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  bentoLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bentoValue: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  bentoSub: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  descCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginBottom: 24,
    ...BENTO_COLORS.shadow,
  },
  descLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 1,
    marginBottom: 12,
  },
  descText: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.neutralText,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  shareBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  copyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 14,
    borderRadius: BENTO_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  copyBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
});
