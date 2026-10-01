import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { SubmissionMethod } from "./types";
import { styles } from "./styles";

interface SubmissionMethodRadioProps {
  method: SubmissionMethod;
  disabled?: boolean;
  onSelect: (method: SubmissionMethod) => void;
}

export const SubmissionMethodRadio: React.FC<SubmissionMethodRadioProps> = React.memo(
  ({ method, disabled, onSelect }) => {
    return (
      <>
        <Text style={styles.sectionHeading}>Submission Method</Text>

        <View style={styles.radioGroupCard}>
          {/* Option 1: Online */}
          <TouchableOpacity
            style={styles.radioOptionRow}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={() => onSelect("ONLINE")}
          >
            <View
              style={[
                styles.radioOuter,
                method === "ONLINE" && styles.radioOuterSelected,
              ]}
            >
              {method === "ONLINE" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioTextCol}>
              <Text style={styles.radioTitle}>Online (Files/Links/Text)</Text>
              <Text style={styles.radioSubtitle}>Upload files or add links</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.radioDivider} />

          {/* Option 2: Offline */}
          <TouchableOpacity
            style={styles.radioOptionRow}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={() => onSelect("OFFLINE")}
          >
            <View
              style={[
                styles.radioOuter,
                method === "OFFLINE" && styles.radioOuterSelected,
              ]}
            >
              {method === "OFFLINE" && <View style={styles.radioInner} />}
            </View>
            <View style={styles.radioTextCol}>
              <Text style={styles.radioTitle}>Offline</Text>
              <Text style={styles.radioSubtitle}>Submit manually (e.g. in class)</Text>
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  }
);
