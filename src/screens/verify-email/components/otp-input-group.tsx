import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { VERIFY_EMAIL_COLORS, OTP_LENGTH } from "../constants";

interface Props {
  otp: string[];
  setOtpDigit: (index: number, digit: string) => void;
  setFullOtp: (code: string) => void;
  disabled?: boolean;
}

export function OtpInputGroup({
  otp,
  setOtpDigit,
  setFullOtp,
  disabled = false,
}: Props) {
  const inputsRef = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const handleChangeText = (text: string, index: number) => {
    // If user pasted a multi-character string (e.g. 6-digit code)
    if (text.length > 1) {
      const sanitized = text.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
      setFullOtp(sanitized);
      const nextFocus = Math.min(sanitized.length, OTP_LENGTH - 1);
      inputsRef.current[nextFocus]?.focus();
      return;
    }

    const cleanDigit = text.replace(/[^0-9]/g, "");
    setOtpDigit(index, cleanDigit);

    if (cleanDigit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        setOtpDigit(index - 1, "");
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = !!otp[index];

        return (
          <TextInput
            key={index}
            ref={(ref) => {
              inputsRef.current[index] = ref;
            }}
            value={otp[index] || ""}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            editable={!disabled}
            selectTextOnFocus
            style={[
              styles.inputBox,
              isFocused && styles.inputBoxFocused,
              hasValue && !isFocused && styles.inputBoxFilled,
            ]}
            autoCapitalize="none"
            autoCorrect={false}
            accessible={true}
            accessibilityLabel={`Verification digit ${index + 1}`}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 14,
  },
  inputBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D3DFEE",
    backgroundColor: "#EFF4FA",
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  inputBoxFocused: {
    borderColor: "#1E293B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputBoxFilled: {
    borderColor: "#CBD5E1",
    backgroundColor: "#F0F4FA",
  },
});
