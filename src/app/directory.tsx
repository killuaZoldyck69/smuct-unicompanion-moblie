import React from "react";
import { StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FacultyDirectoryView } from "@/screens/directory";
import { DIRECTORY_COLORS } from "@/screens/directory/constants";

export default function FacultyDirectoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={DIRECTORY_COLORS.surface}
      />
      <FacultyDirectoryView isModal={false} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DIRECTORY_COLORS.background,
  },
});
