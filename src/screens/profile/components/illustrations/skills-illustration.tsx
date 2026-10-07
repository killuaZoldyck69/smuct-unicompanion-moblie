/**
 * SkillsIllustration
 *
 * Connected skill nodes around a central code symbol "</>"
 * Used as a watermark in the Professional Skills card.
 *
 * Design: geometric, minimal, 2D flat, rounded, no cartoon characters.
 */
import React from "react";
import Svg, { Circle, Line, Text as SvgText, G } from "react-native-svg";

interface SkillsIllustrationProps {
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
}

export const SkillsIllustration = React.memo(function SkillsIllustration({
  width = 90,
  height = 90,
  opacity = 0.13,
  color = "#0D9488",
}: SkillsIllustrationProps) {
  // Central hub position
  const cx = 45;
  const cy = 45;
  const hubR = 18;

  // Satellite nodes: [angle degrees, radius from center, node radius]
  const nodes: Array<[number, number, number]> = [
    [0,   38, 7],   // right
    [60,  38, 6],   // lower-right
    [120, 38, 7],   // lower-left
    [180, 38, 5],   // left
    [240, 36, 6],   // upper-left
    [300, 36, 7],   // upper-right
  ];

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 90 90"
      accessible={false}
      aria-hidden={true}
    >
      <G opacity={opacity}>
        {/* Connection lines from hub to satellites */}
        {nodes.map(([angle, r], i) => {
          const rad = (angle * Math.PI) / 180;
          const nx = cx + r * Math.cos(rad);
          const ny = cy + r * Math.sin(rad);
          return (
            <Line
              key={`line-${i}`}
              x1={cx + hubR * Math.cos(rad)}
              y1={cy + hubR * Math.sin(rad)}
              x2={nx}
              y2={ny}
              stroke={color}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity={0.6}
            />
          );
        })}

        {/* Satellite nodes */}
        {nodes.map(([angle, r, nr], i) => {
          const rad = (angle * Math.PI) / 180;
          const nx = cx + r * Math.cos(rad);
          const ny = cy + r * Math.sin(rad);
          return (
            <Circle
              key={`node-${i}`}
              cx={nx}
              cy={ny}
              r={nr}
              fill={color}
              opacity={0.7}
            />
          );
        })}

        {/* Central hub circle */}
        <Circle cx={cx} cy={cy} r={hubR} fill={color} />

        {/* Central code symbol </> */}
        <SvgText
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="white"
          opacity={0.9}
        >
          {"</>"}
        </SvgText>

        {/* Outer orbit ring (very faint) */}
        <Circle
          cx={cx}
          cy={cy}
          r={44}
          fill="none"
          stroke={color}
          strokeWidth="0.6"
          opacity={0.2}
          strokeDasharray="3 4"
        />
      </G>
    </Svg>
  );
});
