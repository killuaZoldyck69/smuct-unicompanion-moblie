import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../../constants";

export const GuidelinesCard = memo(function GuidelinesCard() {
  return (
    <View style={styles.guidelinesCard}>
      <View style={styles.guidelinesHeader}>
        <Feather
          name="info"
          size={15}
          color={BENTO.navy}
          style={styles.headerIcon}
        />
        <Text style={styles.guidelinesTitle}>Campus Ground Guidelines</Text>
      </View>
      <Text style={styles.guidelinesItem}>
        • Ground lights shut down at 10:00 PM sharp.
      </Text>
      <Text style={styles.guidelinesItem}>
        • Reservations require sports committee or admin approval.
      </Text>
      <Text style={styles.guidelinesItem}>
        • Please keep the ground clean and bring your student ID.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  guidelinesCard: {
    backgroundColor: BENTO.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginTop: 6,
  },
  guidelinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 6,
  },
  guidelinesTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: BENTO.navy,
  },
  guidelinesItem: {
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 18,
  },
});
