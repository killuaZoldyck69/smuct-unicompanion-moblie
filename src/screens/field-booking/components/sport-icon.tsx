import React from "react";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import type { SportType } from "../types";

interface SportIconProps {
  type: SportType;
  size?: number;
  color?: string;
  style?: any;
}

export const SportIcon = React.memo(function SportIcon({
  type,
  size = 14,
  color = "#64748b",
  style,
}: SportIconProps) {
  switch (type) {
    case "cricket":
      return (
        <MaterialCommunityIcons
          name="cricket"
          size={size}
          color={color}
          style={style}
        />
      );
    case "football":
      return (
        <MaterialCommunityIcons
          name="soccer"
          size={size}
          color={color}
          style={style}
        />
      );
    case "racket":
      return (
        <MaterialCommunityIcons
          name="badminton"
          size={size}
          color={color}
          style={style}
        />
      );
    case "athletics":
      return (
        <MaterialCommunityIcons
          name="run"
          size={size}
          color={color}
          style={style}
        />
      );
    case "event":
      return (
        <MaterialCommunityIcons
          name="party-popper"
          size={size}
          color={color}
          style={style}
        />
      );
    case "media":
      return (
        <Feather
          name="camera"
          size={size}
          color={color}
          style={style}
        />
      );
    default:
      return (
        <MaterialCommunityIcons
          name="flag-variant-outline"
          size={size}
          color={color}
          style={style}
        />
      );
  }
});
