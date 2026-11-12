import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { deleteMyAccountAPI } from "@/services/user-service";
import { clearStoredAuthSession } from "@/services/session-storage";
import { extractApiErrorMessage } from "@/features/profile/profile-error-utils";
import { colors } from "@/theme/colors";
import { fontFamily } from "@/theme/typography";
import { SPACING } from "../../constants";
import { ProfileModalFrame } from "./profile-modal-frame";

interface DeleteAccountModalProps {
  visible: boolean;
  isOffline: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  isOffline,
  onClose,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canConfirm = confirmText.trim() === "DELETE" && !isDeleting && !isOffline;

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText("");
    setErrorMsg(null);
    onClose();
  };

  const handleDelete = async () => {
    if (isOffline) {
      setErrorMsg("You appear to be offline. Connect to the internet to delete your account.");
      return;
    }

    if (confirmText.trim() !== "DELETE") {
      setErrorMsg('Please type "DELETE" exactly in uppercase to confirm.');
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const result = await deleteMyAccountAPI("DELETE");

      await clearStoredAuthSession().catch(() => {});
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();

      setConfirmText("");
      onClose();

      Toast.show({
        type: "success",
        text1: "Account Deleted",
        text2: result.isPermanentlyBlocked
          ? "Your account has been permanently removed."
          : `Your data was removed (${result.cooldownDays}-day re-registration cooldown applies).`,
        visibilityTime: 5000,
      });

      router.replace("/(auth)/login");
    } catch (error: unknown) {
      const message = extractApiErrorMessage(
        error,
        "Unable to delete your account right now.",
        isOffline
      );
      setErrorMsg(message);
      Toast.show({
        type: "error",
        text1: "Deletion Blocked",
        text2: message,
        visibilityTime: 4500,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProfileModalFrame
      visible={visible}
      onClose={handleClose}
      dismissDisabled={isDeleting}
      keyboardAvoiding={true}
      scrollable={true}
      horizontalPadding={SPACING.xl}
      cardStyle={styles.modalCard}
      backdropAccessibilityLabel="Cancel account deletion"
    >
      <View style={styles.iconCircle}>
        <Feather name="alert-triangle" size={22} color={colors.semantic.red.accent} />
      </View>

      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.description}>
        This permanently erases your profile, sessions, push tokens, and uploaded
        photo. A non-reversible security hash enforces a 30-day re-registration
        cooldown (or permanent block after repeated deletions).
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          Type <Text style={styles.keyword}>DELETE</Text> to confirm
        </Text>
        <TextInput
          style={styles.input}
          value={confirmText}
          onChangeText={(value) => {
            setConfirmText(value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="DELETE"
          placeholderTextColor={colors.slate400}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isDeleting}
        />
      </View>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Feather name="info" size={14} color={colors.semantic.red.deep} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleClose}
          disabled={isDeleting}
          activeOpacity={0.75}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, !canConfirm && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={!canConfirm}
          activeOpacity={0.8}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.deleteText}>Delete Forever</Text>
          )}
        </TouchableOpacity>
      </View>
    </ProfileModalFrame>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.navyAlpha08,
    shadowColor: colors.navyInk,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.semantic.red.tint,
    borderWidth: 1,
    borderColor: colors.semantic.red.softBorder,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: colors.navyDeep,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.slate600,
    textAlign: "center",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.slate700,
    marginBottom: 6,
  },
  keyword: {
    fontWeight: "800",
    color: colors.semantic.red.accent,
  },
  input: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: colors.navyDeep,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    letterSpacing: 1,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.semantic.red.tint,
    borderWidth: 1,
    borderColor: colors.semantic.red.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontFamily,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.semantic.red.deep,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: colors.slate600,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.semantic.red.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonDisabled: {
    backgroundColor: colors.semantic.red.light,
    opacity: 0.75,
  },
  deleteText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: colors.white,
  },
});
