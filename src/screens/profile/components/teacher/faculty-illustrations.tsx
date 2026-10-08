import React from "react";
import Svg, {
  Rect,
  Circle,
  Line,
  Path,
  G,
  Polygon,
  Ellipse,
  Text as SvgText,
} from "react-native-svg";

/**
 * 1. Minimal University Faculty / Academic Building
 * Minimal geometric university building with clock tower, academic arch, and trees.
 * Opacity: 10-18%, positioned bottom-right behind academic position details.
 */
interface IllustrationProps {
  width?: number;
  height?: number;
  opacity?: number;
  color?: string;
  style?: any;
}

export const CampusBuildingWatermark = React.memo(
  function CampusBuildingWatermark({
    width = 140,
    height = 120,
    opacity = 0.14,
    color = "#3b82f6",
    style,
  }: IllustrationProps) {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 140 120"
        style={style}
        accessible={false}
        aria-hidden={true}
      >
        <G opacity={opacity}>
          {/* Ground baseline */}
          <Line
            x1="8"
            y1="108"
            x2="132"
            y2="108"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Left Wing Trees */}
          <Rect x="14" y="90" width="3.5" height="18" rx="1.5" fill={color} />
          <Circle cx="16" cy="84" r="10" fill={color} />
          <Circle cx="12" cy="90" r="7" fill={color} />
          <Circle cx="20" cy="89" r="6" fill={color} />

          {/* Right Wing Trees */}
          <Rect x="122" y="90" width="3.5" height="18" rx="1.5" fill={color} />
          <Circle cx="124" cy="83" r="10" fill={color} />
          <Circle cx="120" cy="89" r="6.5" fill={color} />
          <Circle cx="128" cy="88" r="6" fill={color} />

          {/* Main Academic Wing Blocks */}
          <Rect x="30" y="70" width="80" height="38" rx="3" fill={color} />

          {/* Left Wing Windows */}
          <Rect x="36" y="78" width="10" height="11" rx="2" fill="#ffffff" opacity={0.5} />
          <Rect x="36" y="93" width="10" height="9" rx="2" fill="#ffffff" opacity={0.5} />

          {/* Right Wing Windows */}
          <Rect x="94" y="78" width="10" height="11" rx="2" fill="#ffffff" opacity={0.5} />
          <Rect x="94" y="93" width="10" height="9" rx="2" fill="#ffffff" opacity={0.5} />

          {/* Central Clock Tower */}
          <Rect x="56" y="44" width="28" height="46" rx="3" fill={color} />

          {/* Belfry & Clock Section */}
          <Rect x="59" y="28" width="22" height="18" rx="2" fill={color} />
          <Circle cx="70" cy="37" r="6" fill="#ffffff" opacity={0.65} />
          <Line x1="70" y1="37" x2="70" y2="33" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <Line x1="70" y1="37" x2="73.5" y2="39" stroke={color} strokeWidth="1.2" strokeLinecap="round" />

          {/* Spire & Academic Finial */}
          <Polygon points="70,8 64,28 76,28" fill={color} />
          <Line x1="70" y1="8" x2="70" y2="3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <Polygon points="70,3 78,6.5 70,10" fill={color} />

          {/* Grand Academic Entrance Archway */}
          <Path
            d="M63 108 L63 88 Q70 78 77 88 L77 108 Z"
            fill="#ffffff"
            opacity={0.75}
          />

          {/* Arch steps */}
          <Rect x="52" y="101" width="36" height="4" rx="1.5" fill={color} opacity={0.4} />
          <Rect x="48" y="105" width="44" height="3" rx="1.5" fill={color} opacity={0.4} />
        </G>
      </Svg>
    );
  }
);

/**
 * 2. Connected Knowledge Technical Illustration
 * Central </> circle with satellite nodes and connections.
 * Soft teal/mint at 10-18% opacity.
 */
export const ConnectedKnowledgeWatermark = React.memo(
  function ConnectedKnowledgeWatermark({
    width = 110,
    height = 100,
    opacity = 0.14,
    color = "#10b981",
    style,
  }: IllustrationProps) {
    const cx = 55;
    const cy = 50;
    const hubR = 19;

    const satellites: Array<[number, number, number]> = [
      [0, 42, 7],     // right
      [55, 40, 6.5],  // lower-right
      [125, 41, 7],   // lower-left
      [180, 42, 6],   // left
      [235, 40, 6.5], // upper-left
      [305, 40, 7.5], // upper-right
    ];

    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 110 100"
        style={style}
        accessible={false}
        aria-hidden={true}
      >
        <G opacity={opacity}>
          {/* Subtle outer orbit ring */}
          <Circle
            cx={cx}
            cy={cy}
            r={46}
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            strokeDasharray="4 4"
            opacity={0.3}
          />

          {/* Connection vectors */}
          {satellites.map(([angle, dist], idx) => {
            const rad = (angle * Math.PI) / 180;
            const sx = cx + dist * Math.cos(rad);
            const sy = cy + dist * Math.sin(rad);
            return (
              <Line
                key={`link-${idx}`}
                x1={cx + hubR * Math.cos(rad)}
                y1={cy + hubR * Math.sin(rad)}
                x2={sx}
                y2={sy}
                stroke={color}
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity={0.65}
              />
            );
          })}

          {/* Node circles */}
          {satellites.map(([angle, dist, nr], idx) => {
            const rad = (angle * Math.PI) / 180;
            const sx = cx + dist * Math.cos(rad);
            const sy = cy + dist * Math.sin(rad);
            return (
              <Circle
                key={`node-${idx}`}
                cx={sx}
                cy={sy}
                r={nr}
                fill={color}
                opacity={0.8}
              />
            );
          })}

          {/* Central hub */}
          <Circle cx={cx} cy={cy} r={hubR} fill={color} />

          {/* </> symbol inside hub */}
          <SvgText
            x={cx}
            y={cy + 5.5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#ffffff"
            opacity={0.95}
          >
            {"</>"}
          </SvgText>
        </G>
      </Svg>
    );
  }
);

/**
 * 3. Digital Professional Presence Watermark
 * Minimal browser window, profile card layout, and globe lines.
 * Powder blue / indigo at 10-15% opacity.
 */
export const DigitalPresenceWatermark = React.memo(
  function DigitalPresenceWatermark({
    width = 135,
    height = 95,
    opacity = 0.12,
    color = "#3b82f6",
    style,
  }: IllustrationProps) {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 135 95"
        style={style}
        accessible={false}
        aria-hidden={true}
      >
        <G opacity={opacity}>
          {/* Browser Window Body */}
          <Rect
            x="12"
            y="12"
            width="90"
            height="68"
            rx="8"
            fill={color}
            opacity={0.25}
          />
          {/* Top header bar */}
          <Rect x="12" y="12" width="90" height="15" rx="8" fill={color} opacity={0.6} />
          <Circle cx="21" cy="19.5" r="2.2" fill="#ffffff" />
          <Circle cx="27" cy="19.5" r="2.2" fill="#ffffff" />
          <Circle cx="33" cy="19.5" r="2.2" fill="#ffffff" />

          {/* Profile card preview inside window */}
          <Circle cx="30" cy="45" r="9" fill={color} opacity={0.5} />
          <Rect x="44" y="38" width="46" height="5.5" rx="2.5" fill={color} opacity={0.5} />
          <Rect x="44" y="47" width="34" height="4" rx="2" fill={color} opacity={0.4} />
          <Rect x="44" y="54" width="22" height="3.5" rx="1.5" fill={color} opacity={0.3} />

          {/* Connecting digital globe on the right */}
          <Circle
            cx="105"
            cy="56"
            r="20"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            opacity={0.8}
          />
          <Ellipse
            cx="105"
            cy="56"
            rx="12"
            ry="20"
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            opacity={0.6}
          />
          <Line
            x1="85"
            y1="56"
            x2="125"
            y2="56"
            stroke={color}
            strokeWidth="1.2"
            opacity={0.6}
          />
          <Line
            x1="89"
            y1="46"
            x2="121"
            y2="46"
            stroke={color}
            strokeWidth="1"
            opacity={0.4}
          />
          <Line
            x1="89"
            y1="66"
            x2="121"
            y2="66"
            stroke={color}
            strokeWidth="1"
            opacity={0.4}
          />
        </G>
      </Svg>
    );
  }
);

/**
 * 4. Personal Academic Halo Watermark
 * Soft circular geometry, subtle academic arcs, and tiny dots behind avatar.
 */
export const AcademicHaloWatermark = React.memo(
  function AcademicHaloWatermark({
    width = 110,
    height = 110,
    opacity = 0.35,
    color = "#10b981",
    style,
  }: IllustrationProps) {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 110 110"
        style={style}
        accessible={false}
        aria-hidden={true}
      >
        <G opacity={opacity}>
          {/* Subtle concentric rings */}
          <Circle cx="55" cy="55" r="50" fill={color} opacity={0.08} />
          <Circle
            cx="55"
            cy="55"
            r="44"
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity={0.25}
          />
          <Circle
            cx="55"
            cy="55"
            r="38"
            fill="none"
            stroke={color}
            strokeWidth="1.2"
            opacity={0.15}
          />
          {/* Subtle accent dots */}
          <Circle cx="55" cy="8" r="2" fill={color} opacity={0.4} />
          <Circle cx="102" cy="55" r="2" fill={color} opacity={0.4} />
          <Circle cx="55" cy="102" r="2" fill={color} opacity={0.4} />
          <Circle cx="8" cy="55" r="2" fill={color} opacity={0.4} />
        </G>
      </Svg>
    );
  }
);

/**
 * 5. Blood Droplet Micro-Motif
 * Muted coral droplet watermark for the Blood Group card.
 */
export const DropletWatermark = React.memo(
  function DropletWatermark({
    width = 54,
    height = 62,
    opacity = 0.12,
    color = "#ef4444",
    style,
  }: IllustrationProps) {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 54 62"
        style={style}
        accessible={false}
        aria-hidden={true}
      >
        <G opacity={opacity}>
          <Path
            d="M27 4 C27 4 9 24 9 38 C9 49 17 58 27 58 C37 58 45 49 45 38 C45 24 27 4 27 4Z"
            fill={color}
          />
          <Path
            d="M34 30 C32 25 30 22 27 20"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={0.5}
            fill="none"
          />
        </G>
      </Svg>
    );
  }
);

/**
 * 6. Communication Wave Micro-Motif
 * Muted peach communication wave watermark for the Phone Number card.
 */
export const CommunicationWaveWatermark = React.memo(
  function CommunicationWaveWatermark({
    width = 58,
    height = 58,
    opacity = 0.12,
    color = "#f97316",
    style,
  }: IllustrationProps) {
    return (
      <Svg
        width={width}
        height={height}
        viewBox="0 0 58 58"
        style={style}
        accessible={false}
        aria-hidden={true}
      >
        <G opacity={opacity}>
          {/* Radio concentric arcs */}
          <Path
            d="M26 12 A18 18 0 0 1 44 30"
            fill="none"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <Path
            d="M26 20 A10 10 0 0 1 36 30"
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <Path
            d="M26 27 A3 3 0 0 1 29 30"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Subtle broadcast nodes */}
          <Circle cx="26" cy="30" r="3" fill={color} />
          <Circle cx="44" cy="30" r="1.5" fill={color} opacity={0.6} />
          <Circle cx="26" cy="12" r="1.5" fill={color} opacity={0.6} />
        </G>
      </Svg>
    );
  }
);
