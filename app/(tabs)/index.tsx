import React from "react";
import { View, Text } from "react-native";
import { typography } from "../../src/theme/typography";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={typography.headlineMd}>Home Dashboard</Text>
    </View>
  );
}
