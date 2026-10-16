import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { FACULTY_COLORS } from "../constants";
import { AddFacultyFormData } from "../types";

interface AccountDetailsSectionProps {
  formData: AddFacultyFormData;
  updateField: <K extends keyof AddFacultyFormData>(
    field: K,
    value: AddFacultyFormData[K],
  ) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  onRegeneratePassword?: () => void;
}

export const AccountDetailsSection = React.memo(function AccountDetailsSection({
  formData,
  updateField,
  showPassword,
  setShowPassword,
  onRegeneratePassword,
}: AccountDetailsSectionProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <View style={styles.card}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBox}>
            <Feather
              name="user"
              size={18}
              color={FACULTY_COLORS.accountIconColor}
            />
          </View>
          <Text style={styles.sectionTitle}>Account Details</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>REQUIRED</Text>
        </View>
      </View>

      {/* Field: Teacher ID (Long Integer) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Teacher ID <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === "teacherId" && styles.inputWrapperFocused,
          ]}
        >
          <Feather
            name="hash"
            size={18}
            color={
              focusedField === "teacherId"
                ? FACULTY_COLORS.accountIconColor
                : FACULTY_COLORS.textMuted
            }
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g. 20240010123"
            placeholderTextColor={FACULTY_COLORS.textMuted}
            value={formData.teacherId}
            onChangeText={(text) => updateField("teacherId", text)}
            onFocus={() => setFocusedField("teacherId")}
            onBlur={() => setFocusedField(null)}
            keyboardType="numeric"
            maxLength={20}
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Teacher ID"
          />
        </View>
      </View>

      {/* Field: Full Name (Auto-formats Title Case) */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Full name <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === "name" && styles.inputWrapperFocused,
          ]}
        >
          <Feather
            name="user"
            size={18}
            color={
              focusedField === "name"
                ? FACULTY_COLORS.accountIconColor
                : FACULTY_COLORS.textMuted
            }
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="e.g. Dr. John Doe"
            placeholderTextColor={FACULTY_COLORS.textMuted}
            value={formData.name}
            onChangeText={(text) => updateField("name", text)}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="words"
            autoCorrect={false}
            accessible={true}
            accessibilityLabel="Full name"
          />
        </View>
      </View>

      {/* Field: Institutional Email */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          Institutional email <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <View
          style={[
            styles.inputWrapper,
            focusedField === "email" && styles.inputWrapperFocused,
          ]}
        >
          <Feather
            name="mail"
            size={18}
            color={
              focusedField === "email"
                ? FACULTY_COLORS.accountIconColor
                : FACULTY_COLORS.textMuted
            }
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="name@smuct.ac.bd"
            placeholderTextColor={FACULTY_COLORS.textMuted}
            value={formData.email}
            onChangeText={(text) => updateField("email", text)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessible={true}
            accessibilityLabel="Institutional email"
          />
        </View>
      </View>

      {/* Field: Temporary Password with Auto-fill */}
      <View style={styles.fieldContainer}>
        <View style={styles.labelRowWithAction}>
          <Text style={styles.fieldLabel}>
            Temporary password <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          {onRegeneratePassword && (
            <TouchableOpacity
              onPress={onRegeneratePassword}
              style={styles.autoFillBadge}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Auto-generate password"
            >
              <Feather
                name="refresh-cw"
                size={11}
                color={FACULTY_COLORS.accountBadgeText}
              />
              <Text style={styles.autoFillBadgeText}>Auto-generate</Text>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={[
            styles.inputWrapper,
            focusedField === "password" && styles.inputWrapperFocused,
          ]}
        >
          <Feather
            name="lock"
            size={18}
            color={
              focusedField === "password"
                ? FACULTY_COLORS.accountIconColor
                : FACULTY_COLORS.textMuted
            }
            style={styles.fieldIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Min 8 chars (e.g. 0123@Doe)"
            placeholderTextColor={FACULTY_COLORS.textMuted}
            value={formData.password}
            onChangeText={(text) => updateField("password", text)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Temporary password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={18}
              color={FACULTY_COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Password Hint */}
      <View style={styles.infoRow}>
        <Feather
          name="info"
          size={16}
          color={FACULTY_COLORS.infoIcon}
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>
          Auto-fills with: Last 4 digits of ID + @ + last 3 characters of last name (e.g. 0123@Doe). Can be changed anytime.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: FACULTY_COLORS.accountCardBg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.accountCardBorder,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: FACULTY_COLORS.accountIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: FACULTY_COLORS.textPrimary,
  },
  badge: {
    backgroundColor: FACULTY_COLORS.accountBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: FACULTY_COLORS.accountBadgeText,
    letterSpacing: 0.4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelRowWithAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  autoFillBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.accountBadgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  autoFillBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: FACULTY_COLORS.accountBadgeText,
    letterSpacing: 0.3,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: FACULTY_COLORS.danger,
    fontWeight: "700",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.inputBorder,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: FACULTY_COLORS.inputFocusBorder,
    backgroundColor: "#FFFFFF",
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: FACULTY_COLORS.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    gap: 8,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: FACULTY_COLORS.textSecondary,
    lineHeight: 18,
  },
});
