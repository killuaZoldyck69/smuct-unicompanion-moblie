import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/layout";

export interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "inbox",
  title,
  description,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Feather
        name={icon}
        size={44}
        color={colors.outline}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sectionBreak,
    paddingHorizontal: spacing.marginMobile,
  },
  icon: {
    marginBottom: spacing.gutter,
    opacity: 0.6,
  },
  title: {
    ...typography.titleLg,
    color: colors.onSurface,
    textAlign: "center",
    fontWeight: "600",
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.stackSm,
  },
});
