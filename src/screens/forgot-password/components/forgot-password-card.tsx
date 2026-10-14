import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FORGOT_PASSWORD_COLORS, FORGOT_PASSWORD_STRINGS } from "../constants";

interface ForgotPasswordCardProps {
  email: string;
  setEmail: (email: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onFocus?: () => void;
}

export const ForgotPasswordCard = React.memo(function ForgotPasswordCard({
  email,
  setEmail,
  isSubmitting,
  onSubmit,
  onFocus,
}: ForgotPasswordCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.card}>
      {/* 1. EMAIL LABEL */}
      <Text style={styles.label}>{FORGOT_PASSWORD_STRINGS.EMAIL_LABEL}</Text>

      {/* 2. INPUT BOX */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name="mail"
          size={20}
          color={
            isFocused
              ? FORGOT_PASSWORD_COLORS.iconFocused
              : FORGOT_PASSWORD_COLORS.iconMuted
          }
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder={FORGOT_PASSWORD_STRINGS.EMAIL_PLACEHOLDER}
          placeholderTextColor={FORGOT_PASSWORD_COLORS.inputPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          editable={!isSubmitting}
          accessible={true}
          accessibilityLabel="Email Address input"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </View>

      {/* 3. SEND RESET LINK (PILL BUTTON WITH ARROW) */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting}
        activeOpacity={0.88}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Send Password Reset Link"
      >
        {isSubmitting ? (
          <ActivityIndicator color={FORGOT_PASSWORD_COLORS.primaryButtonText} size="small" />
        ) : (
          <Text style={styles.buttonText}>
            {FORGOT_PASSWORD_STRINGS.BUTTON_TEXT}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: FORGOT_PASSWORD_COLORS.cardBackground,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: FORGOT_PASSWORD_COLORS.cardBorder,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
    shadowColor: FORGOT_PASSWORD_COLORS.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: FORGOT_PASSWORD_COLORS.titleText,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FORGOT_PASSWORD_COLORS.inputBackground,
    borderWidth: 1.2,
    borderColor: FORGOT_PASSWORD_COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: FORGOT_PASSWORD_COLORS.inputBorderFocused,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "400",
    color: FORGOT_PASSWORD_COLORS.inputText,
    paddingVertical: 0,
  },
  submitButton: {
    backgroundColor: FORGOT_PASSWORD_COLORS.primaryButton,
    borderRadius: 999,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: FORGOT_PASSWORD_COLORS.primaryButton,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: FORGOT_PASSWORD_COLORS.primaryButtonText,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
