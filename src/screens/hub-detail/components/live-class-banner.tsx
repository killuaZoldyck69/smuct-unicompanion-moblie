import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const BENTO = {
  white: "#ffffff",
  deepNavy: "#131b2e",
  slate: "#64748b",
  pillRadius: 9999,
  cardRadius: 20,
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface LiveClassBannerProps {
  hubDetails: any;
  canManage: boolean;
  onToggleLive: (isLive: boolean, meetUrl?: string) => void;
  onConfigureMeet: () => void;
  isPending?: boolean;
}

export const LiveClassBanner: React.FC<LiveClassBannerProps> = ({
  hubDetails,
  canManage,
  onToggleLive,
  onConfigureMeet,
  isPending = false,
}) => {
  const isLive = Boolean(hubDetails?.isClassLive);
  const meetUrl = hubDetails?.meetUrl?.trim();

  const handleJoinMeet = async () => {
    if (!meetUrl) {
      Toast.show({
        type: "info",
        text1: "No Google Meet Link",
        text2: "Your instructor has not configured a Google Meet link yet.",
      });
      return;
    }

    try {
      const targetUrl =
        meetUrl.startsWith("http://") || meetUrl.startsWith("https://")
          ? meetUrl
          : `https://${meetUrl}`;

      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(targetUrl);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Could Not Open Link",
        text2: "Please make sure Google Meet or a browser is installed.",
      });
    }
  };

  // State 1: CLASS IS LIVE NOW 🟢
  if (isLive) {
    return (
      <View style={[styles.container, styles.liveContainer]}>
        <View style={styles.topMetaRow}>
          <View style={styles.liveIndicatorBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.liveBadgeText}>LIVE CLASS NOW</Text>
          </View>

          {canManage && (
            <TouchableOpacity
              style={styles.endClassBtn}
              onPress={() => onToggleLive(false)}
              disabled={isPending}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="End live class"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#e11d48" />
              ) : (
                <>
                  <Feather
                    name="phone-off"
                    size={12}
                    color="#e11d48"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.endClassText}>End Class</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.liveContentRow}>
          <View style={styles.liveTextCol}>
            <Text style={styles.liveTitle}>Online Lecture in Progress</Text>
            <Text style={styles.liveSubtitle}>
              {meetUrl ? "Join on Google Meet with 1 tap" : "No link provided"}
            </Text>
          </View>

          {meetUrl ? (
            <TouchableOpacity
              style={styles.joinMeetBtn}
              onPress={handleJoinMeet}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join Google Meet class"
            >
              <Feather
                name="video"
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.joinMeetBtnText}>Join Meet</Text>
              <Feather
                name="arrow-up-right"
                size={14}
                color="#ffffff"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          ) : canManage ? (
            <TouchableOpacity
              style={styles.configureBtn}
              onPress={onConfigureMeet}
              activeOpacity={0.8}
            >
              <Text style={styles.configureBtnText}>Set Link</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  // State 2: CLASS IS NOT LIVE, BUT TEACHER/CR CAN START OR CONFIGURE
  if (canManage) {
    return (
      <View style={[styles.container, styles.idleContainer]}>
        <View style={styles.idleLeftCol}>
          <View style={styles.meetIconCircle}>
            <Feather name="video" size={16} color={BENTO.deepNavy} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.idleTitle}>Online Class (Google Meet)</Text>
            <Text style={styles.idleSubtitle} numberOfLines={1}>
              {meetUrl ? meetUrl.replace(/^https?:\/\//, "") : "No link configured"}
            </Text>
          </View>
        </View>

        <View style={styles.idleActionsRow}>
          {meetUrl ? (
            <TouchableOpacity
              style={styles.goLiveBtn}
              onPress={() => onToggleLive(true)}
              disabled={isPending}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Start live online class"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="radio"
                    size={12}
                    color="#ffffff"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.goLiveBtnText}>Go Live</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addLinkBtn}
              onPress={onConfigureMeet}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Configure Google Meet link"
            >
              <Feather
                name="plus"
                size={13}
                color={BENTO.deepNavy}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.addLinkBtnText}>Set Link</Text>
            </TouchableOpacity>
          )}

          {meetUrl ? (
            <TouchableOpacity
              style={styles.editLinkIconBtn}
              onPress={onConfigureMeet}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit Google Meet link"
            >
              <Feather name="edit-2" size={13} color={BENTO.slate} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  // State 3: STUDENT VIEW WHEN NOT LIVE (Subtle Room Badge if meetUrl exists)
  if (meetUrl) {
    return (
      <View style={[styles.container, styles.studentIdleContainer]}>
        <View style={styles.studentIdleLeft}>
          <Feather
            name="video"
            size={14}
            color="#0284c7"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.studentIdleText}>Class Google Meet Room</Text>
        </View>
        <TouchableOpacity
          style={styles.studentOpenBtn}
          onPress={handleJoinMeet}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open Google Meet room"
        >
          <Text style={styles.studentOpenBtnText}>Open Room</Text>
          <Feather
            name="external-link"
            size={12}
            color="#0284c7"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: BENTO.cardRadius,
    padding: 14,
  },

  // Live styling
  liveContainer: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#86efac",
    ...Platform.select({
      web: {
        boxShadow: "0 8px 24px -4px rgba(22, 163, 74, 0.18)",
      } as any,
      default: {
        shadowColor: "#16a34a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 3,
      },
    }),
  },
  topMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  liveIndicatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: BENTO.pillRadius,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
    marginRight: 6,
  },
  liveBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#15803d",
    letterSpacing: 0.5,
  },
  endClassBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: BENTO.pillRadius,
  },
  endClassText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#e11d48",
  },
  liveContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveTextCol: {
    flex: 1,
    marginRight: 10,
  },
  liveTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: BENTO.deepNavy,
    marginBottom: 2,
  },
  liveSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO.slate,
  },
  joinMeetBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15803d",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BENTO.pillRadius,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(21, 128, 61, 0.25)",
      } as any,
      default: {
        shadowColor: "#15803d",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
      },
    }),
  },
  joinMeetBtnText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  configureBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BENTO.pillRadius,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  configureBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },

  // Idle Manager styling
  idleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  idleLeftCol: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  meetIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  idleTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.deepNavy,
  },
  idleSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO.slate,
  },
  idleActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  goLiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15803d",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BENTO.pillRadius,
  },
  goLiveBtnText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  addLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BENTO.pillRadius,
  },
  addLinkBtnText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO.deepNavy,
  },
  editLinkIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
  },

  // Student Idle Styling
  studentIdleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  studentIdleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentIdleText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0369a1",
  },
  studentOpenBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: BENTO.pillRadius,
    borderWidth: 1,
    borderColor: "#7dd3fc",
  },
  studentOpenBtnText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0284c7",
  },
});
