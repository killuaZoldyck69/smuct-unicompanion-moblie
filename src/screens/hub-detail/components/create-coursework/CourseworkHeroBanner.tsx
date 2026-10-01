import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "./constants";

interface Props {
  title?: string;
  subtitle?: string;
}

export const CourseworkHeroBanner: React.FC<Props> = ({
  title = "Academic Assessment",
  subtitle = "Set assignment goals, submission format, marks, and resources",
}) => {
  return (
    <View style={styles.heroBanner}>
      <View style={styles.heroIconBox}>
        <Feather name="book-open" size={16} color={BENTO.blueText} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  heroIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  heroTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#1e3a8a",
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#3b82f6",
    marginTop: 2,
    lineHeight: 15,
  },
});
