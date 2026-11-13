import React, { memo, useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { BENTO_COLORS, fontFamily } from "../constants";
import type { AuthorAcademicInfo } from "../utils";

export interface ForumAvatarProps {
  uri?: string | null;
  name?: string | null;
  size: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: TextStyle["fontWeight"];
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const ForumAvatar = memo(function ForumAvatar({
  uri,
  name,
  size,
  backgroundColor = BENTO_COLORS.slateBg,
  textColor = BENTO_COLORS.deepNavy,
  fontSize,
  fontWeight = "700",
  accessibilityLabel,
  style,
}: ForumAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = name?.trim().charAt(0).toUpperCase() || "U";
  const radius = size / 2;

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  if (uri && !failed) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor,
            overflow: "hidden",
          },
          style,
        ]}
      >
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: radius }}
          onError={() => setFailed(true)}
          accessible={Boolean(accessibilityLabel)}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.initialText,
          {
            color: textColor,
            fontSize: fontSize ?? Math.round(size * 0.4),
            fontWeight,
          },
        ]}
      >
        {initial}
      </Text>
    </View>
  );
});

export interface ForumAuthorSubtitleProps {
  academicInfo: AuthorAcademicInfo;
  style?: StyleProp<TextStyle>;
  superscriptStyle?: StyleProp<TextStyle>;
}

export const ForumAuthorSubtitle = memo(function ForumAuthorSubtitle({
  academicInfo,
  style,
  superscriptStyle,
}: ForumAuthorSubtitleProps) {
  if (academicInfo.isStudent && academicInfo.semesterNum) {
    return (
      <Text style={[styles.subtitle, style]} numberOfLines={1}>
        {academicInfo.semesterNum}
        <Text style={[styles.superscript, superscriptStyle]}>
          {academicInfo.superSuffix}
        </Text>
        {academicInfo.deptShort
          ? ` Semester • ${academicInfo.deptShort}`
          : " Semester"}
      </Text>
    );
  }

  return (
    <Text style={[styles.subtitle, style]} numberOfLines={1}>
      {academicInfo.fullText}
    </Text>
  );
});

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    fontFamily,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  superscript: {
    fontFamily,
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    includeFontPadding: false,
  },
});
