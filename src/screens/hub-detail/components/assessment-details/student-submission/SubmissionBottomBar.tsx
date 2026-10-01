import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { styles } from "./styles";

interface SubmissionBottomBarProps {
  isClosed: boolean;
  isLateActive: boolean;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  hasPreviousSubmission: boolean;
  onSubmit: () => void;
}

export const SubmissionBottomBar: React.FC<SubmissionBottomBarProps> = React.memo(
  ({
    isClosed,
    isLateActive,
    isSubmitDisabled,
    isSubmitting,
    hasPreviousSubmission,
    onSubmit,
  }) => {
    const insets = useSafeAreaInsets();

    return (
      <View
        style={[
          styles.fixedBottomBar,
          { paddingBottom: Math.max(insets.bottom + 12, 20) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            isClosed
              ? styles.submitButtonClosed
              : isLateActive
              ? styles.submitButtonLate
              : undefined,
            isSubmitDisabled && !isClosed && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            isClosed
              ? "Submissions closed"
              : isLateActive
              ? "Submit late"
              : hasPreviousSubmission
              ? "Resubmit coursework"
              : "Submit coursework"
          }
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : isClosed ? (
            <View style={styles.buttonInnerRow}>
              <Feather name="lock" size={15} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText}>Submissions Closed</Text>
            </View>
          ) : isLateActive ? (
            <View style={styles.buttonInnerRow}>
              <Feather name="clock" size={15} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText}>
                {hasPreviousSubmission ? "Resubmit (Late)" : "Submit Late"}
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {hasPreviousSubmission ? "Resubmit" : "Submit"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
);
