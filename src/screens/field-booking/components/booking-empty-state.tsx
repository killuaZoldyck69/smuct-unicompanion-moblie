import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../constants";

interface BookingEmptyStateProps {
  iconName: keyof typeof Feather.glyphMap;
  iconColor?: string;
  title: string;
  subtitle: string;
  actionText?: string;
  actionIcon?: keyof typeof Feather.glyphMap;
  onAction?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const BookingEmptyState = memo(function BookingEmptyState({
  iconName,
  iconColor = BENTO.navy,
  title,
  subtitle,
  actionText,
  actionIcon = "plus",
  onAction,
  refreshing = false,
  onRefresh,
}: BookingEmptyStateProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BENTO.navy]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconCircle}>
        <Feather name={iconName} size={32} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {actionText && onAction ? (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Feather
            name={actionIcon}
            size={16}
            color="#ffffff"
            style={styles.actionIcon}
          />
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
