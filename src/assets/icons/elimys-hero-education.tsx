import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Rect,
  Circle,
  Path,
  Line,
  Ellipse,
} from "react-native-svg";

interface ElimysHeroEducationSvgProps {
  width?: number | string;
  height?: number | string;
}

export const ElimysHeroEducationSvg = React.memo(
  function ElimysHeroEducationSvg({
    width = "100%",
    height = "100%",
  }: ElimysHeroEducationSvgProps) {
    return (
      <Svg
        viewBox="0 0 1600 900"
        width={width}
        height={height}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <LinearGradient id="buildingFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#dcecff" />
            <Stop offset="0.55" stopColor="#c7def8" />
            <Stop offset="1" stopColor="#a9c8ee" />
          </LinearGradient>

          <LinearGradient id="buildingShadow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#9dbfe8" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#6f9ed5" stopOpacity={0.08} />
          </LinearGradient>

          <LinearGradient id="sunFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffe0a0" />
            <Stop offset="1" stopColor="#f3b44b" />
          </LinearGradient>

          <LinearGradient id="groundFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#d8e6f7" stopOpacity={0.65} />
            <Stop offset="1" stopColor="#edf3fa" stopOpacity={0} />
          </LinearGradient>

          <RadialGradient id="softGlow" cx="72%" cy="36%" r="62%">
            <Stop offset="0" stopColor="#4b88db" stopOpacity={0.12} />
            <Stop offset="0.52" stopColor="#4b88db" stopOpacity={0.05} />
            <Stop offset="1" stopColor="#4b88db" stopOpacity={0} />
          </RadialGradient>

          <RadialGradient id="warmGlow" cx="65%" cy="46%" r="40%">
            <Stop offset="0" stopColor="#e9a23b" stopOpacity={0.16} />
            <Stop offset="1" stopColor="#e9a23b" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <G>
          {/* Transparent ambient glows */}
          <Ellipse cx={1180} cy={260} rx={650} ry={430} fill="url(#softGlow)" />
          <Ellipse cx={1030} cy={430} rx={380} ry={250} fill="url(#warmGlow)" />

          {/* Large soft arcs */}
          <Circle
            cx={1120}
            cy={430}
            r={370}
            fill="none"
            stroke="#dbe8fb"
            strokeWidth={96}
            opacity={0.4}
          />
          <Circle
            cx={1120}
            cy={430}
            r={275}
            fill="none"
            stroke="#d7e6fa"
            strokeWidth={62}
            opacity={0.48}
          />
          <Circle
            cx={1120}
            cy={430}
            r={198}
            fill="none"
            stroke="#d3e3f8"
            strokeWidth={38}
            opacity={0.54}
          />

          {/* Sun */}
          <Circle
            cx={1120}
            cy={490}
            r={180}
            fill="url(#sunFill)"
            opacity={0.78}
          />

          {/* Faint skyline */}
          <G fill="#c9dcf4" opacity={0.58}>
            <Rect x={380} y={455} width={52} height={170} rx={5} />
            <Rect x={396} y={418} width={20} height={42} rx={2} />

            <Rect x={470} y={505} width={84} height={120} rx={5} />
            <Path d="M470 505l42-48 42 48z" />

            <Rect x={585} y={475} width={80} height={150} rx={5} />
            <Rect x={665} y={520} width={64} height={105} rx={5} />

            <Rect x={1290} y={485} width={70} height={140} rx={5} />
            <Rect x={1375} y={515} width={60} height={110} rx={5} />
            <Rect x={1450} y={460} width={74} height={165} rx={5} />
          </G>

          {/* Ground haze */}
          <Ellipse
            cx={1040}
            cy={650}
            rx={650}
            ry={94}
            fill="url(#groundFade)"
          />

          {/* Trees */}
          <G fill="#a9c8ee" opacity={0.92}>
            <Rect x={470} y={570} width={9} height={92} rx={4} />
            <Circle cx={474} cy={545} r={35} />
            <Circle cx={447} cy={562} r={25} />
            <Circle cx={503} cy={562} r={27} />

            <Rect x={625} y={590} width={8} height={72} rx={4} />
            <Circle cx={629} cy={570} r={29} />
            <Circle cx={608} cy={584} r={20} />
            <Circle cx={648} cy={584} r={21} />

            <Rect x={1390} y={515} width={10} height={147} rx={5} />
            <Ellipse cx={1395} cy={455} rx={34} ry={92} />
            <Ellipse cx={1395} cy={540} rx={28} ry={74} />

            <Rect x={1270} y={585} width={8} height={77} rx={4} />
            <Circle cx={1274} cy={564} r={30} />
            <Circle cx={1252} cy={578} r={21} />
            <Circle cx={1296} cy={579} r={22} />
          </G>

          {/* Main building */}
          <G>
            {/* Side wings */}
            <Rect
              x={760}
              y={470}
              width={190}
              height={180}
              rx={8}
              fill="url(#buildingFill)"
            />
            <Rect
              x={1150}
              y={470}
              width={190}
              height={180}
              rx={8}
              fill="url(#buildingFill)"
            />

            {/* Central body */}
            <Rect
              x={925}
              y={395}
              width={250}
              height={255}
              rx={8}
              fill="url(#buildingFill)"
            />

            {/* Roof and pediment */}
            <Rect
              x={885}
              y={385}
              width={330}
              height={24}
              rx={6}
              fill="#a8c8ee"
            />
            <Path d="M925 385L1050 305L1175 385Z" fill="#b8d5f6" />
            <Path d="M954 374L1050 320L1146 374Z" fill="#e5f1ff" />

            {/* Subtle facade wash */}
            <Rect
              x={925}
              y={395}
              width={250}
              height={255}
              rx={8}
              fill="url(#buildingShadow)"
            />

            {/* Clock */}
            <Circle
              cx={1050}
              cy={354}
              r={26}
              fill="#f8fbff"
              stroke="#8fb4df"
              strokeWidth={4}
            />
            <Line
              x1={1050}
              y1={354}
              x2={1050}
              y2={340}
              stroke="#769ccf"
              strokeWidth={3.2}
              strokeLinecap="round"
            />
            <Line
              x1={1050}
              y1={354}
              x2={1062}
              y2={360}
              stroke="#769ccf"
              strokeWidth={3.2}
              strokeLinecap="round"
            />

            {/* Columns */}
            <G fill="#f3f8ff">
              <Rect x={950} y={408} width={24} height={220} rx={4} />
              <Rect x={995} y={408} width={24} height={220} rx={4} />
              <Rect x={1040} y={408} width={24} height={220} rx={4} />
              <Rect x={1085} y={408} width={24} height={220} rx={4} />
              <Rect x={1130} y={408} width={24} height={220} rx={4} />
            </G>

            {/* Column caps */}
            <G fill="#c5dcf8">
              <Rect x={944} y={402} width={36} height={9} rx={2} />
              <Rect x={989} y={402} width={36} height={9} rx={2} />
              <Rect x={1034} y={402} width={36} height={9} rx={2} />
              <Rect x={1079} y={402} width={36} height={9} rx={2} />
              <Rect x={1124} y={402} width={36} height={9} rx={2} />

              <Rect x={944} y={624} width={36} height={10} rx={2} />
              <Rect x={989} y={624} width={36} height={10} rx={2} />
              <Rect x={1034} y={624} width={36} height={10} rx={2} />
              <Rect x={1079} y={624} width={36} height={10} rx={2} />
              <Rect x={1124} y={624} width={36} height={10} rx={2} />
            </G>

            {/* Door */}
            <Rect
              x={1023}
              y={520}
              width={54}
              height={130}
              rx={6}
              fill="#84a9d7"
            />
            <Rect
              x={1033}
              y={535}
              width={34}
              height={115}
              rx={4}
              fill="#739bcf"
            />

            {/* Windows */}
            <G fill="#8fb4df">
              <Rect x={795} y={505} width={30} height={44} rx={3} />
              <Rect x={855} y={505} width={30} height={44} rx={3} />
              <Rect x={795} y={575} width={30} height={44} rx={3} />
              <Rect x={855} y={575} width={30} height={44} rx={3} />

              <Rect x={1215} y={505} width={30} height={44} rx={3} />
              <Rect x={1275} y={505} width={30} height={44} rx={3} />
              <Rect x={1215} y={575} width={30} height={44} rx={3} />
              <Rect x={1275} y={575} width={30} height={44} rx={3} />
            </G>

            {/* Steps */}
            <Rect
              x={995}
              y={650}
              width={110}
              height={10}
              rx={3}
              fill="#c6dcf7"
            />
            <Rect
              x={980}
              y={660}
              width={140}
              height={11}
              rx={3}
              fill="#b8d2f2"
            />
          </G>

          {/* Floating icons */}
          <G>
            {/* Graduation cap */}
            <Circle
              cx={760}
              cy={235}
              r={58}
              fill="#e5f0ff"
              opacity={0.96}
            />
            <Path
              d="M720 229l40-21 40 21-40 21z"
              fill="#1f5baa"
            />
            <Path
              d="M737 240v24c15 11 31 11 46 0v-24l-23 11z"
              fill="#1f5baa"
            />
            <Line
              x1={799}
              y1={229}
              x2={799}
              y2={258}
              stroke="#1f5baa"
              strokeWidth={4}
              strokeLinecap="round"
            />

            {/* User */}
            <Circle
              cx={670}
              cy={405}
              r={54}
              fill="#fff0d3"
              opacity={0.96}
            />
            <Circle cx={670} cy={385} r={16} fill="#d88a00" />
            <Path
              d="M642 429c4-20 15-31 28-31s24 11 28 31z"
              fill="#d88a00"
            />

            {/* Book */}
            <Circle
              cx={1390}
              cy={250}
              r={58}
              fill="#e5f0ff"
              opacity={0.96}
            />
            <Path
              d="M1358 228c16 0 25 4 32 11v36c-9-8-20-11-32-10z"
              fill="#1f5baa"
            />
            <Path
              d="M1422 228c-16 0-25 4-32 11v36c9-8 20-11 32-10z"
              fill="#1f5baa"
            />
          </G>
        </G>
      </Svg>
    );
  }
);
