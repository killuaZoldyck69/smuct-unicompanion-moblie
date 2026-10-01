import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import { formatDueDate } from "../utils";
import { styles } from "./styles";

interface SubmissionClosedCardProps {
  deadline?: string;
}

export const SubmissionClosedCard: React.FC<SubmissionClosedCardProps> = React.memo(
  ({ deadline }) => {
    return (
      <View style={styles.closedEmptyCard}>
        <View style={styles.closedLargeIconBox}>
          <Feather name="lock" size={26} color="#dc2626" />
        </View>
        <Text style={styles.closedEmptyTitle}>Submission Window Closed</Text>
        <Text style={styles.closedEmptyDesc}>
          You have not submitted work for this assessment before the deadline ({formatDueDate(deadline)}). Late submissions are disabled for this coursework.
        </Text>
      </View>
    );
  }
);
