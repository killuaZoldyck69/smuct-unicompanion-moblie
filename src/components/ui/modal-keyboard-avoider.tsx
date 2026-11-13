import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { computeAndroidKeyboardOverlap } from "./modal-keyboard-logic";

const ModalKeyboardContext = createContext<boolean>(false);

/** Returns true while the soft keyboard is open inside a ModalKeyboardAvoidingView. */
export function useModalKeyboardOpen(): boolean {
  return useContext(ModalKeyboardContext);
}

/** Tracks soft-keyboard visibility for modal screens/footers, resetting when inactive. */
export function useSoftKeyboardOpen(active = true): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      setIsOpen(false);
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setIsOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [active]);

  return isOpen;
}

export interface ModalKeyboardAvoidingViewProps extends Omit<ViewProps, "style"> {
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
  keyboardVerticalOffset?: number;
  statusBarTranslucent?: boolean;
  children: React.ReactNode;
}

/**
 * Cross-device modal keyboard avoider replacing React Native's KeyboardAvoidingView
 * inside Modals. Works around the Android RN bug where keyboardDidHide leaves a
 * stale ~50dp gap after closing the IME, and avoids both hidden footers (when
 * Modal Dialogs ignore adjustResize on Android 15+ edge-to-edge) and double-shrinking
 * (when OEMs/Android versions do resize the Modal Dialog).
 */
export function ModalKeyboardAvoidingView({
  style,
  enabled = true,
  keyboardVerticalOffset = 0,
  statusBarTranslucent = true,
  pointerEvents,
  children,
  ...rest
}: ModalKeyboardAvoidingViewProps) {
  const insets = useSafeAreaInsets();
  const outerRef = useRef<View>(null);
  const activeKeyboardRef = useRef<{ screenY: number; height: number } | null>(
    null,
  );
  const baselineHeightRef = useRef<number>(0);
  const currentHeightRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [androidOverlap, setAndroidOverlap] = useState(0);

  const clearPendingRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const recomputeOverlap = useCallback(
    (layoutHeightOverride?: number) => {
      if (Platform.OS !== "android") return;
      const kb = activeKeyboardRef.current;
      if (!kb || !enabled) {
        setAndroidOverlap(0);
        return;
      }

      if (!outerRef.current) {
        setAndroidOverlap(
          computeAndroidKeyboardOverlap({
            baselineHeight: baselineHeightRef.current,
            currentHeight: layoutHeightOverride ?? currentHeightRef.current,
            containerBottomInWindow: 0,
            keyboardScreenY: kb.screenY,
            keyboardHeight: kb.height,
            screenHeight: Dimensions.get("screen").height,
            statusBarTranslucent,
            statusBarInset: insets.top,
          }),
        );
        return;
      }

      outerRef.current.measureInWindow((_x, y, _width, measuredHeight) => {
        if (!isMountedRef.current || !activeKeyboardRef.current || !enabled) {
          return;
        }
        const effectiveHeight =
          measuredHeight > 0
            ? measuredHeight
            : (layoutHeightOverride ?? currentHeightRef.current);
        const nextOverlap = computeAndroidKeyboardOverlap({
          baselineHeight: baselineHeightRef.current,
          currentHeight: effectiveHeight,
          containerBottomInWindow: y + effectiveHeight,
          keyboardScreenY: activeKeyboardRef.current.screenY,
          keyboardHeight: activeKeyboardRef.current.height,
          screenHeight: Dimensions.get("screen").height,
          statusBarTranslucent,
          statusBarInset: insets.top,
        });
        setAndroidOverlap(nextOverlap);
      });
    },
    [enabled, insets.top, statusBarTranslucent],
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearPendingRaf();
    };
  }, [clearPendingRaf]);

  useEffect(() => {
    if (!enabled) {
      clearPendingRaf();
      activeKeyboardRef.current = null;
      setIsKeyboardOpen(false);
      setAndroidOverlap(0);
    }
  }, [clearPendingRaf, enabled]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      if (!enabled) return;
      setIsKeyboardOpen(true);
      if (Platform.OS !== "android") return;

      activeKeyboardRef.current = {
        screenY: e?.endCoordinates?.screenY ?? 0,
        height: e?.endCoordinates?.height ?? 0,
      };
      clearPendingRaf();
      // Wait 1 frame so OS adjustResize layout commits before measuring.
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        recomputeOverlap();
      });
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      clearPendingRaf();
      activeKeyboardRef.current = null;
      setIsKeyboardOpen(false);
      setAndroidOverlap(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [clearPendingRaf, enabled, recomputeOverlap]);

  const handleOuterLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const nextHeight = e.nativeEvent.layout.height;
      currentHeightRef.current = nextHeight;

      if (!activeKeyboardRef.current || !Keyboard.isVisible()) {
        if (activeKeyboardRef.current && !Keyboard.isVisible()) {
          activeKeyboardRef.current = null;
          setIsKeyboardOpen(false);
          setAndroidOverlap(0);
        }
        baselineHeightRef.current = nextHeight;
        return;
      }

      recomputeOverlap(nextHeight);
    },
    [recomputeOverlap],
  );

  const innerStyle = useMemo<StyleProp<ViewStyle>>(() => {
    if (Platform.OS !== "android" || !enabled || androidOverlap <= 0) {
      return [styles.flexOne, style];
    }
    const basePaddingBottom =
      Number(StyleSheet.flatten(style)?.paddingBottom) || 0;
    return [
      styles.flexOne,
      style,
      { paddingBottom: Math.max(basePaddingBottom, androidOverlap) },
    ];
  }, [androidOverlap, enabled, style]);

  if (Platform.OS === "ios") {
    return (
      <ModalKeyboardContext.Provider value={isKeyboardOpen}>
        <KeyboardAvoidingView
          behavior="padding"
          enabled={enabled}
          keyboardVerticalOffset={keyboardVerticalOffset}
          style={style}
          pointerEvents={pointerEvents}
          {...rest}
        >
          {children}
        </KeyboardAvoidingView>
      </ModalKeyboardContext.Provider>
    );
  }

  return (
    <ModalKeyboardContext.Provider value={isKeyboardOpen}>
      <View
        ref={outerRef}
        onLayout={handleOuterLayout}
        style={styles.outerRuler}
        pointerEvents="box-none"
      >
        <View style={innerStyle} pointerEvents={pointerEvents} {...rest}>
          {children}
        </View>
      </View>
    </ModalKeyboardContext.Provider>
  );
}

const styles = StyleSheet.create({
  outerRuler: {
    flex: 1,
    width: "100%",
  },
  flexOne: {
    flex: 1,
  },
});
