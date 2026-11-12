import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { SPACING } from "../../constants";

interface ProfileModalFrameProps {
  visible: boolean;
  onClose: () => void;
  dismissDisabled?: boolean;
  keyboardAvoiding?: boolean;
  scrollable?: boolean;
  backdropColor?: string;
  horizontalPadding?: number;
  maxHeightRatio?: number;
  backdropAccessibilityLabel?: string;
  cardStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Shared edge-to-edge modal container for Profile dialogs.
 * Draws the dimmed backdrop under Android status/navigation bars while
 * keeping card bounds and keyboard-interactive inputs inside safe insets.
 */
export const ProfileModalFrame: React.FC<ProfileModalFrameProps> = ({
  visible,
  onClose,
  dismissDisabled = false,
  keyboardAvoiding = false,
  scrollable = false,
  backdropColor = colors.scrimDark,
  horizontalPadding = SPACING.xl,
  maxHeightRatio,
  backdropAccessibilityLabel = "Close modal",
  cardStyle,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const topPadding = insets.top + SPACING.lg;
  const bottomPadding = insets.bottom + SPACING.lg;
  const leftPadding = Math.max(insets.left, horizontalPadding);
  const rightPadding = Math.max(insets.right, horizontalPadding);
  const availableSafeHeight = Math.max(240, windowHeight - topPadding - bottomPadding);
  const maxCardHeight = maxHeightRatio
    ? Math.min(windowHeight * maxHeightRatio, availableSafeHeight)
    : availableSafeHeight;

  const content = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const centeredContainer = (
    <View
      style={[
        styles.centerContainer,
        {
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingLeft: leftPadding,
          paddingRight: rightPadding,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.cardBase, { maxHeight: maxCardHeight }, cardStyle]}>
        {content}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={dismissDisabled ? undefined : onClose}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
    >
      <View
        style={[styles.overlay, { backgroundColor: backdropColor }]}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={dismissDisabled ? undefined : onClose}
          disabled={dismissDisabled}
          accessibilityRole="button"
          accessibilityLabel={backdropAccessibilityLabel}
          accessible={false}
        />

        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "web" ? undefined : "padding"}
            style={styles.flexOne}
            pointerEvents="box-none"
          >
            {centeredContainer}
          </KeyboardAvoidingView>
        ) : (
          centeredContainer
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBase: {
    width: "100%",
    backgroundColor: colors.white,
    flexShrink: 1,
  },
});
