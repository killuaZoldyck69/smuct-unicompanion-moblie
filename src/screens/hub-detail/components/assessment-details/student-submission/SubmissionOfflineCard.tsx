import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

import { styles } from "./styles";

export const SubmissionOfflineCard: React.FC = React.memo(() => {
  return (
    <View style={styles.offlineNoticeCard}>
      <View style={styles.offlineIconBox}>
        <Feather name="clipboard" size={20} color="#0f172a" />
      </View>
      <Text style={styles.offlineTitle}>In-Class Physical Submission</Text>
      <Text style={styles.offlineDesc}>
        Submit your hardcopy / paper work directly to the teacher during class. Tap Submit below to declare your physical submission.
      </Text>
    </View>
  );
});
