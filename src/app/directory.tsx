import React from "react";
import { View, StyleSheet } from "react-native";
import { FacultyDirectoryView } from "@/screens/directory";
import { THEME } from "@/screens/directory/constants";

export default function FacultyDirectoryScreen() {
  return (
    <View style={styles.container}>
      <FacultyDirectoryView isModal={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
});
