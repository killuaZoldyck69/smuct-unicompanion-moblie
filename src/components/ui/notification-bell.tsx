import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useUnreadNotificationCount } from "@/features/notifications/useNotifications";

const CAT_FPS = 60;
const CAT_TOTAL_FRAMES = 479;
const CAT_LOOP_DURATION_MS = (CAT_TOTAL_FRAMES / CAT_FPS) * 1000;
const CALLOUT_SHOW_START_FRAME = 85;
const CALLOUT_SHOW_FULL_FRAME = 92;
const CALLOUT_HIDE_START_FRAME = 354;
const CALLOUT_HIDE_END_FRAME = 361;

interface NotificationBellProps {
  style?: StyleProp<ViewStyle>;
  iconColor?: string;
  iconSize?: number;
  accessibilityLabel?: string;
  useCatAnimation?: boolean;
}

export const NotificationBell = React.memo(function NotificationBell({
  style,
  iconColor = "#131b2e",
  iconSize = 20,
  accessibilityLabel = "Notifications",
  useCatAnimation = false,
}: NotificationBellProps) {
  const router = useRouter();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const frameAnim = useRef(new Animated.Value(0)).current;
  const loopAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startBadgeCycle = useCallback(() => {
    loopAnimRef.current?.stop();
    frameAnim.setValue(0);

    const loopAnim = Animated.loop(
      Animated.timing(frameAnim, {
        toValue: CAT_TOTAL_FRAMES,
        duration: CAT_LOOP_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      }),
    );

    loopAnimRef.current = loopAnim;
    loopAnim.start();
  }, [frameAnim]);

  useEffect(() => {
    if (!useCatAnimation) {
      loopAnimRef.current?.stop();
      frameAnim.setValue(0);
      return;
    }

    startBadgeCycle();

    return () => {
      loopAnimRef.current?.stop();
    };
  }, [useCatAnimation, startBadgeCycle, frameAnim]);

  const catBadgeAnimatedStyle = useMemo(() => {
    const opacity = frameAnim.interpolate({
      inputRange: [
        0,
        CALLOUT_SHOW_START_FRAME,
        CALLOUT_SHOW_FULL_FRAME,
        CALLOUT_HIDE_START_FRAME,
        CALLOUT_HIDE_END_FRAME,
        CAT_TOTAL_FRAMES,
      ],
      outputRange: [0, 0, 1, 1, 0, 0],
      extrapolate: "clamp",
    });

    const scale = frameAnim.interpolate({
      inputRange: [
        0,
        CALLOUT_SHOW_START_FRAME,
        CALLOUT_SHOW_FULL_FRAME,
        CALLOUT_HIDE_START_FRAME,
        CALLOUT_HIDE_END_FRAME,
        CAT_TOTAL_FRAMES,
      ],
      outputRange: [0.6, 0.6, 1, 1, 0.6, 0.6],
      extrapolate: "clamp",
    });

    return {
      opacity,
      transform: [{ scale }],
    };
  }, [frameAnim]);

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/notifications")}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `${accessibilityLabel}, ${unreadCount} unread`
          : accessibilityLabel
      }
    >
      {useCatAnimation ? (
        <View pointerEvents="none" style={styles.catAnimation}>
          <LottieView
            source={require("@/assets/icons/cat.json")}
            autoPlay
            loop
            resizeMode="contain"
            style={styles.catAnimation}
            onAnimationLoaded={startBadgeCycle}
            onAnimationLoop={startBadgeCycle}
          />
        </View>
      ) : (
        <Feather name="bell" size={iconSize} color={iconColor} />
      )}
      {unreadCount > 0 && (
        <Animated.View
          style={[
            styles.badge,
            useCatAnimation && styles.catBadge,
            useCatAnimation && catBadgeAnimatedStyle,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              useCatAnimation && styles.catBadgeText,
            ]}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  catAnimation: {
    width: 144,
    height: 144,
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -2,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 100,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  catBadge: {
    top: 4,
    right: 38,
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: "#808080",
  },
  badgeText: { color: "#ffffff", fontSize: 9, fontWeight: "800" },
  catBadgeText: { color: "#000000" },
});
