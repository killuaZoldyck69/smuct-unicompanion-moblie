import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { editHubStyles as s } from "../styles";

interface Props {
  isFormValid: boolean;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function FooterActions({ isFormValid, isPending, onSave, onCancel }: Props) {
  const saveDisabled = !isFormValid || isPending;

  return (
    <View style={s.footer}>
      <TouchableOpacity
        style={[s.saveBtn, saveDisabled && s.saveBtnDisabled]}
        onPress={onSave}
        disabled={saveDisabled}
        activeOpacity={0.85}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Save hub changes"
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Feather name="check" size={16} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={s.saveBtnText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={s.cancelBtn}
        onPress={onCancel}
        activeOpacity={0.75}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Cancel editing"
      >
        <Text style={s.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
