import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";

interface MemberDestructiveActionProps {
  isSelf: boolean;
  memberName?: string;
  isPending: boolean;
  onConfirm: () => void;
}

export const MemberDestructiveAction = React.memo(function MemberDestructiveAction({
  isSelf,
  memberName,
  isPending,
  onConfirm,
}: MemberDestructiveActionProps) {
  const handlePress = () => {
    const title = isSelf
      ? "Leave Course Hub?"
      : `Remove ${memberName || "Member"}?`;
    const message = isSelf
      ? "Are you sure you want to leave this course hub? You will need the join code to re-enter."
      : `Are you sure you want to remove ${memberName || "this member"} from the hub?`;

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: isSelf ? "Leave" : "Remove",
        style: "destructive",
        onPress: onConfirm,
      },
    ]);
  };

  return (
    <View style={styles.sectionWrap}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={isPending}
        activeOpacity={0.75}
      >
        <View style={styles.left}>
          <Feather
            name={isSelf ? "log-out" : "user-x"}
            size={16}
            color={BENTO.roseText}
            style={styles.icon}
          />
          <Text style={styles.title}>
            {isSelf ? "Leave Course Hub" : "Remove from Course Hub"}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={BENTO.roseText} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionWrap: {
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BENTO.roseSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.roseText,
  },
});
