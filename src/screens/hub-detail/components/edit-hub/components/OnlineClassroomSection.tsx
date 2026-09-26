import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_THEME } from "@/screens/hubs/components/create-hub";
import { editHubStyles as s } from "../styles";
import type { EditHubFormState } from "../types";

interface Props {
  meetUrl: EditHubFormState["meetUrl"];
  onMeetUrlChange: (v: string) => void;
}

export function OnlineClassroomSection({ meetUrl, onMeetUrlChange }: Props) {
  const hasUrl = meetUrl.trim().length > 0;

  return (
    <View style={[s.bentoCard, s.blueBentoCard]}>
      {/* Card Header */}
      <View style={s.cardHeaderRow}>
        <View style={[s.cardHeaderIcon, { backgroundColor: BENTO_THEME.blueHeaderBg }]}>
          <Feather name="video" size={16} color={BENTO_THEME.blueIcon} />
        </View>
        <View style={s.cardHeaderTextGroup}>
          <Text style={s.cardHeaderTitle}>Online Classroom</Text>
          <Text style={[s.cardHeaderSub, { color: BENTO_THEME.blueSub }]}>
            Google Meet or Zoom lecture deep link
          </Text>
        </View>
        {hasUrl ? (
          <View style={[s.statusBadge, { backgroundColor: BENTO_THEME.mintHeaderBg }]}>
            <Text style={[s.statusBadgeText, { color: BENTO_THEME.mintIcon }]}>ACTIVE</Text>
          </View>
        ) : (
          <View style={[s.statusBadge, { backgroundColor: "rgba(19, 27, 46, 0.06)" }]}>
            <Text style={[s.statusBadgeText, { color: BENTO_THEME.slateMuted }]}>OPTIONAL</Text>
          </View>
        )}
      </View>

      {/* URL Input */}
      <View style={s.inputGroup}>
        <Text style={[s.inputLabel, { color: BENTO_THEME.blueLabel }]}>MEETING URL</Text>
        <View style={[s.inputRow, s.blueInputRow]}>
          <Feather name="link" size={15} color={BENTO_THEME.blueIcon} style={s.leadingIcon} />
          <TextInput
            style={s.textInput}
            value={meetUrl}
            onChangeText={onMeetUrlChange}
            placeholder="https://meet.google.com/abc-defg-hij"
            placeholderTextColor={BENTO_THEME.slateLight}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            accessible
            accessibilityLabel="Google Meet or Zoom link"
          />
          {hasUrl && (
            <TouchableOpacity
              onPress={() => onMeetUrlChange("")}
              style={s.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Clear meeting URL"
            >
              <Feather name="x" size={14} color={BENTO_THEME.slateMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Helper Note */}
      <View style={s.helperRow}>
        <Feather
          name="info"
          size={13}
          color={BENTO_THEME.blueIcon}
          style={{ marginRight: 6, marginTop: 1 }}
        />
        <Text style={s.helperText}>
          Students and faculty can launch or join live lectures directly with 1 tap from the hub
          banner.
        </Text>
      </View>
    </View>
  );
}
