import React, { memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, PURPOSE_SUGGESTIONS } from "../../constants";

interface PurposeSectionProps {
  purpose: string;
  onChangePurpose: (text: string) => void;
}

export const PurposeSection = memo(function PurposeSection({
  purpose,
  onChangePurpose,
}: PurposeSectionProps) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.sectionLabel}>EVENT PURPOSE / MATCH NAME</Text>
      <View style={styles.inputWrapper}>
        <Feather
          name="award"
          size={18}
          color={BENTO.slate}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          value={purpose}
          onChangeText={onChangePurpose}
          placeholder="e.g. CSE Dept Cricket Final"
          placeholderTextColor={BENTO.slateLight}
          accessible={true}
          accessibilityLabel="Event Purpose or Match Name"
        />
      </View>

      <View style={styles.presetChipsWrapper}>
        <Text style={styles.presetHeading}>Quick Select:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetScrollRow}
        >
          {PURPOSE_SUGGESTIONS.map((item) => {
            const isActive = purpose === item;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => onChangePurpose(item)}
                style={[styles.presetTag, isActive && styles.presetTagActive]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.presetTagText,
                    isActive && styles.presetTagTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
    padding: 0,
  },
  presetChipsWrapper: {
    marginTop: 10,
  },
  presetHeading: {
    fontSize: 11,
    color: BENTO.slateLight,
    marginBottom: 6,
    fontWeight: "600",
  },
  presetScrollRow: {
    flexDirection: "row",
    gap: 6,
  },
  presetTag: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  presetTagActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  presetTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.navySecondary,
  },
  presetTagTextActive: {
    color: "#ffffff",
  },
});
