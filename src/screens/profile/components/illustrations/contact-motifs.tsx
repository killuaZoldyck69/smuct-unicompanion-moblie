/**
 * DropMotif
 *
 * Micro blood drop watermark for the Blood Group card.
 * Very low opacity, decoration only — text remains dominant.
 */
import React from "react";
import Svg, { Path, G } from "react-native-svg";

interface DropMotifProps {
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
}

export const DropMotif = React.memo(function DropMotif({
  width = 48,
  height = 56,
  opacity = 0.10,
  color = "#dc2626",
}: DropMotifProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 48 56"
      accessible={false}
      aria-hidden={true}
    >
      <G opacity={opacity}>
        {/* Drop shape — rounded top, pointed bottom */}
        <Path
          d="M24 4 C24 4 8 22 8 34 C8 43.9 15.2 52 24 52 C32.8 52 40 43.9 40 34 C40 22 24 4 24 4Z"
          fill={color}
        />
        {/* Inner highlight */}
        <Path
          d="M30 26 C28 22 26 20 24 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.4}
          fill="none"
        />
      </G>
    </Svg>
  );
});

/**
 * WaveMotif
 *
 * Micro communication wave watermark for the Phone Number card.
 */
interface WaveMotifProps {
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
}

export const WaveMotif = React.memo(function WaveMotif({
  width = 52,
  height = 52,
  opacity = 0.10,
  color = "#d97706",
}: WaveMotifProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 52 52"
      accessible={false}
      aria-hidden={true}
    >
      <G opacity={opacity}>
        {/* Phone handset */}
        <Path
          d="M16 10 C14 10 12 12 12 14 L12 20 C12 34 18 40 32 40 L38 40 C40 40 42 38 42 36 L42 30 C42 28 40 26 38 26 L34 26 C32 26 31 27 30 29 L28 32 C24 30 22 28 20 24 L23 22 C25 21 26 20 26 18 L26 14 C26 12 24 10 22 10 Z"
          fill={color}
        />
        {/* Radio arcs */}
        <Path
          d="M34 10 A8 8 0 0 1 34 22"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0.5}
        />
        <Path
          d="M38 6 A14 14 0 0 1 38 26"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={0.3}
        />
      </G>
    </Svg>
  );
});
