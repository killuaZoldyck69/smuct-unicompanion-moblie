import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface AuthKeyboardScrollViewProps {
  children: React.ReactNode;
  /**
   * Optional decorative hero illustration that smoothly collapses when the
   * soft keyboard opens so the form card and CTA button move immediately into
   * the visible viewport above the keyboard.
   */
  collapsibleHero?: React.ReactNode;
  /**
   * Initial estimated height of the collapsible hero before first layout measurement.
   */
  initialHeroHeight?: number;
  /**
   * Top padding applied when the hero is expanded (keyboard closed).
   */
  expandedTopPadding?: number;
  /**
   * Top padding applied when the hero is collapsed (keyboard open).
   */
  collapsedTopPadding?: number;
  /**
   * Optional fixed top bar (such as a navigation back arrow row) rendered
   * above the ScrollView.
   */
  topBar?: React.ReactNode;
  /**
   * Style applied to the ScrollView's contentContainerStyle.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Extra vertical clearance (in px) kept visible below the focused TextInput
   * when auto-scrolling above the keyboard (default: 110).
   */
  extraScrollHeight?: number;
  /**
   * Whether to scroll back to top (y = 0) when the keyboard closes.
   * Defaults to true when `collapsibleHero` is provided, false otherwise.
   */
  resetScrollOnKeyboardHide?: boolean;
}

/**
 * Expo-Go-compatible adaptive keyboard-aware ScrollView for Auth & Onboarding screens.
 *
 * Why this works across BOTH legacy Android (e.g. Redmi Note 7S / Android 10)
 * AND modern Edge-to-Edge Android (e.g. Redmi Note 15 / Android 15+ HyperOS) + iOS:
 * 1. Adaptive Layout-Delta Detection:
 *    - Measures the container's baseline height when the keyboard is closed.
 *    - When the keyboard opens, compares the current container height against
 *      the baseline height (`osShrinkage = baselineHeight - currentHeight`).
 *    - On Android 10 (`adjustResize`), `osShrinkage ≈ keyboardHeight`, so
 *      `uncompensatedKeyboardHeight` is `0` (preventing double padding).
 *    - On Android 15+ Edge-to-Edge, `osShrinkage === 0`, so
 *      `uncompensatedKeyboardHeight === keyboardHeight`, shrinking the ScrollView
 *      viewport to end right at the top edge of the keyboard.
 * 2. Smooth Collapsible Hero:
 *    - Automatically collapses the decorative top hero illustration while the
 *      keyboard is visible so the form inputs and primary CTA button sit in the
 *      upper visible area of the screen.
 * 3. Automatic Focused-Input Scroll-Into-View:
 *    - Uses `TextInput.State.currentlyFocusedInput()?.measureInWindow(...)` on
 *      keyboard show and input focus changes to scroll the active field (plus
 *      `extraScrollHeight` clearance for the next field/CTA button) cleanly
 *      above the keyboard.
 */
export function AuthKeyboardScrollView({
  children,
  collapsibleHero,
  initialHeroHeight = 230,
  expandedTopPadding,
  collapsedTopPadding,
  topBar,
  contentContainerStyle,
  extraScrollHeight = 110,
  resetScrollOnKeyboardHide,
}: AuthKeyboardScrollViewProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardHeightRef = useRef(0);
  const keyboardTopYRef = useRef(Dimensions.get("window").height);

  // Track container layout height to detect whether the OS already resized the view
  const [containerHeight, setContainerHeight] = useState(0);
  const baselineHeightRef = useRef(0);

  // Track natural height of the collapsible hero for exact interpolation
  const [measuredHeroHeight, setMeasuredHeroHeight] =
    useState(initialHeroHeight);
  const heroProgress = useRef(new Animated.Value(1)).current;

  const shouldResetOnHide =
    resetScrollOnKeyboardHide ?? Boolean(collapsibleHero);

  const clearScheduledScrolls = useCallback(() => {
    timeoutsRef.current.forEach((timer) => clearTimeout(timer));
    timeoutsRef.current = [];
  }, []);

  const scrollToFocusedInput = useCallback(() => {
    if (keyboardHeightRef.current <= 0) {
      return;
    }

    const focusedInput = TextInput.State?.currentlyFocusedInput?.();
    if (!focusedInput || typeof focusedInput.measureInWindow !== "function") {
      return;
    }

    focusedInput.measureInWindow((_x, inputY, _width, inputHeight) => {
      if (!inputHeight || inputHeight <= 0) {
        return;
      }

      const kbTopY = keyboardTopYRef.current;
      const desiredBottomY = inputY + inputHeight + extraScrollHeight;
      const topSafeBoundary = insets.top + (topBar ? 56 : 16);

      if (desiredBottomY > kbTopY) {
        const delta = desiredBottomY - kbTopY;
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollOffsetRef.current + delta),
          animated: true,
        });
      } else if (inputY < topSafeBoundary && scrollOffsetRef.current > 0) {
        const pullBack = topSafeBoundary - inputY + 12;
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollOffsetRef.current - pullBack),
          animated: true,
        });
      }
    });
  }, [extraScrollHeight, insets.top, topBar]);

  const scheduleScrollChecks = useCallback(
    (delays: number[]) => {
      clearScheduledScrolls();
      timeoutsRef.current = delays.map((delay) =>
        setTimeout(() => {
          scrollToFocusedInput();
        }, delay),
      );
    },
    [clearScheduledScrolls, scrollToFocusedInput],
  );

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e?.endCoordinates?.height ?? 0;
      const windowHeight = Dimensions.get("window").height;
      const calculatedTopY = windowHeight - height;
      const rawScreenY = e?.endCoordinates?.screenY;

      keyboardHeightRef.current = height;
      keyboardTopYRef.current =
        typeof rawScreenY === "number" &&
        rawScreenY > 100 &&
        rawScreenY < windowHeight
          ? Math.min(rawScreenY, calculatedTopY)
          : calculatedTopY;

      setKeyboardHeight(height);

      if (collapsibleHero) {
        Animated.timing(heroProgress, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      scheduleScrollChecks(collapsibleHero ? [90, 230] : [60, 180]);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      clearScheduledScrolls();
      keyboardHeightRef.current = 0;
      keyboardTopYRef.current = Dimensions.get("window").height;
      setKeyboardHeight(0);

      if (collapsibleHero) {
        Animated.timing(heroProgress, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }).start();
      }

      if (shouldResetOnHide) {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    });

    return () => {
      clearScheduledScrolls();
      showSub.remove();
      hideSub.remove();
    };
  }, [
    clearScheduledScrolls,
    collapsibleHero,
    heroProgress,
    scheduleScrollChecks,
    shouldResetOnHide,
  ]);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const newHeight = event.nativeEvent.layout.height;
    if (newHeight <= 0) {
      return;
    }

    if (
      keyboardHeightRef.current === 0 ||
      newHeight > baselineHeightRef.current
    ) {
      baselineHeightRef.current = newHeight;
    }
    setContainerHeight(newHeight);
  }, []);

  const handleHeroInnerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const h = event.nativeEvent.layout.height;
      if (h > 20 && Math.abs(h - measuredHeroHeight) > 2) {
        setMeasuredHeroHeight(h);
      }
    },
    [measuredHeroHeight],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const handleTouchCapture = useCallback(() => {
    if (keyboardHeightRef.current > 0) {
      scheduleScrollChecks([90, 220]);
    }
    return false;
  }, [scheduleScrollChecks]);

  const isKeyboardOpen = keyboardHeight > 0;
  const lastFocusedInputRef = useRef<unknown>(null);

  // Detect focus changes via soft-keyboard "Next" key or programmatic focus while keyboard is open
  useEffect(() => {
    if (!isKeyboardOpen) {
      lastFocusedInputRef.current = null;
      return;
    }

    lastFocusedInputRef.current =
      TextInput.State?.currentlyFocusedInput?.() ?? null;

    const focusWatchTimer = setInterval(() => {
      const currentFocused =
        TextInput.State?.currentlyFocusedInput?.() ?? null;
      if (
        currentFocused &&
        currentFocused !== lastFocusedInputRef.current
      ) {
        lastFocusedInputRef.current = currentFocused;
        scheduleScrollChecks([50, 180]);
      }
    }, 180);

    return () => {
      clearInterval(focusWatchTimer);
    };
  }, [isKeyboardOpen, scheduleScrollChecks]);

  // Compute uncompensated keyboard overlap on Android:
  // - Android 10 (Redmi Note 7S): OS shrinks containerHeight by ~keyboardHeight -> osShrinkage ≈ keyboardHeight -> uncompensated = 0
  // - Android 15+ (Redmi Note 15): OS keeps containerHeight unchanged -> osShrinkage = 0 -> uncompensated = keyboardHeight
  const osShrinkage =
    baselineHeightRef.current > 0 && containerHeight > 0
      ? Math.max(0, baselineHeightRef.current - containerHeight)
      : 0;

  const uncompensatedKeyboardHeight =
    Platform.OS === "android" && isKeyboardOpen
      ? Math.max(0, keyboardHeight - osShrinkage)
      : 0;

  const resolvedExpandedTopPadding =
    expandedTopPadding ?? (topBar ? 0 : insets.top + 4);
  const resolvedCollapsedTopPadding =
    collapsedTopPadding ?? (topBar ? 8 : insets.top + 12);

  const activeTopPadding = isKeyboardOpen
    ? resolvedCollapsedTopPadding
    : resolvedExpandedTopPadding;

  const content = (
    <View
      style={[
        styles.innerContainer,
        Platform.OS === "android" && uncompensatedKeyboardHeight > 0
          ? { paddingBottom: uncompensatedKeyboardHeight }
          : null,
      ]}
      onLayout={handleContainerLayout}
      onStartShouldSetResponderCapture={handleTouchCapture}
    >
      {topBar}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
          {
            paddingTop: activeTopPadding,
            paddingBottom: isKeyboardOpen
              ? 28
              : Math.max(insets.bottom + 20, 32),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS === "ios"}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {collapsibleHero ? (
          <Animated.View
            style={[
              styles.heroCollapsibleWrapper,
              {
                height: heroProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, measuredHeroHeight],
                }),
                opacity: heroProgress,
              },
            ]}
          >
            <View
              style={styles.heroInnerMeasure}
              onLayout={handleHeroInnerLayout}
            >
              {collapsibleHero}
            </View>
          </Animated.View>
        ) : null}

        {children}
      </ScrollView>
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.iosWrapper}>
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  iosWrapper: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  heroCollapsibleWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  heroInnerMeasure: {
    width: "100%",
    alignItems: "center",
    flexShrink: 0,
  },
});
