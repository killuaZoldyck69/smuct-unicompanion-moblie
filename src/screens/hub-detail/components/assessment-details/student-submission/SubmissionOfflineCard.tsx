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
      <Text style={styles.offlineTitle}>In-Class Physical Coursework</Text>
      <Text style={styles.offlineDesc}>
        This coursework is completed in person during class (e.g. physical test, presentation, or handwritten paper). No online submission is required. Your teacher will record your marks and feedback directly here.
      </Text>
    </View>
  );
});
