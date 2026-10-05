import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MenuItemConfig } from "../constants";
import {
  FeatureVisualThemeResolver,
  FeatureVisualTheme,
} from "../theme/feature-visual-theme-resolver";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface FeatureCardProps {
  item: MenuItemConfig;
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Unique per-feature background decorations
// Each renders meaningful geometric shapes relating to the feature
// ─────────────────────────────────────────────────────────────
const CardBgDecoration = React.memo(function CardBgDecoration({
  featureId,
  color,
}: {
  featureId: string;
  color: string;
}) {
  const c = color;

  switch (featureId) {
    // ── Exam Routines: ruled paper lines ──────────────────────
    case "exam_routines":
      return (
        <View style={d.wrap} pointerEvents="none">
          {[0, 10, 20, 30].map((t) => (
            <View
              key={t}
              style={[d.hLine, { top: t, backgroundColor: c, opacity: 0.12 }]}
            />
          ))}
          {/* Pencil tick mark */}
          <View style={[d.diagLine, { backgroundColor: c, opacity: 0.18 }]} />
        </View>
      );

    // ── Class Routines: clock arcs ────────────────────────────
    case "class_routines":
      return (
        <View style={d.wrap} pointerEvents="none">
          <View style={[d.clockRing, { borderColor: c, opacity: 0.14 }]} />
          <View style={[d.clockRingSm, { borderColor: c, opacity: 0.1 }]} />
          {/* Clock hands */}
          <View style={[d.clockHandH, { backgroundColor: c, opacity: 0.2 }]} />
          <View style={[d.clockHandM, { backgroundColor: c, opacity: 0.2 }]} />
        </View>
      );

    // ── Academic Calendar: calendar grid ─────────────────────
    case "academic_calendar":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Calendar header bar */}
          <View style={[d.calHeader, { backgroundColor: c, opacity: 0.15 }]} />
          {/* Dot grid */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <View
                key={`${row}-${col}`}
                style={[
                  d.calDot,
                  {
                    top: 18 + row * 12,
                    left: 4 + col * 12,
                    backgroundColor: c,
                    opacity: row === 0 && col === 0 ? 0.25 : 0.1,
                  },
                ]}
              />
            ))
          )}
        </View>
      );

    // ── Course Hub: stacked layer rings ──────────────────────
    case "course_eval":
      return (
        <View style={d.wrap} pointerEvents="none">
          {[60, 44, 28].map((size, i) => (
            <View
              key={size}
              style={[
                d.layerRing,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderColor: c,
                  opacity: 0.08 + i * 0.05,
                  bottom: -size / 2 + 20,
                  right: -size / 2 + 20,
                },
              ]}
            />
          ))}
        </View>
      );

    // ── CGPA Calculator: bar chart bars ──────────────────────
    case "cgpa_calculator":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Base line */}
          <View style={[d.chartBase, { backgroundColor: c, opacity: 0.14 }]} />
          {/* Bars */}
          {[
            { h: 28, l: 4 },
            { h: 40, l: 16 },
            { h: 20, l: 28 },
            { h: 34, l: 40 },
          ].map(({ h, l }) => (
            <View
              key={l}
              style={[
                d.chartBar,
                {
                  height: h,
                  left: l,
                  bottom: 6,
                  backgroundColor: c,
                  opacity: 0.13,
                },
              ]}
            />
          ))}
        </View>
      );

    // ── Noticeboard: bell + wave arcs ────────────────────────
    case "noticeboard":
      return (
        <View style={d.wrap} pointerEvents="none">
          {[48, 34, 20].map((size, i) => (
            <View
              key={size}
              style={[
                d.waveArc,
                {
                  width: size,
                  height: size / 2,
                  borderColor: c,
                  opacity: 0.1 + i * 0.04,
                  bottom: 6 + i * 8,
                  right: 4,
                },
              ]}
            />
          ))}
          {/* Bell dot */}
          <View style={[d.bellDot, { backgroundColor: c, opacity: 0.2 }]} />
        </View>
      );

    // ── Bus Schedule: road path arcs ─────────────────────────
    case "bus_schedule":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Road curve */}
          <View style={[d.roadArc1, { borderColor: c, opacity: 0.13 }]} />
          <View style={[d.roadArc2, { borderColor: c, opacity: 0.09 }]} />
          {/* Road dashes */}
          {[0, 10, 20].map((t) => (
            <View
              key={t}
              style={[d.roadDash, { top: t + 12, backgroundColor: c, opacity: 0.15 }]}
            />
          ))}
        </View>
      );

    // ── Campus Events: star + concentric rings ────────────────
    case "campus_events":
      return (
        <View style={d.wrap} pointerEvents="none">
          {[56, 40, 24].map((size, i) => (
            <View
              key={size}
              style={[
                d.eventRing,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderColor: c,
                  opacity: 0.08 + i * 0.05,
                  bottom: -size / 2 + 22,
                  right: -size / 2 + 22,
                },
              ]}
            />
          ))}
          {/* Star dot center */}
          <View style={[d.starDot, { backgroundColor: c, opacity: 0.22 }]} />
        </View>
      );

    // ── Campus Forum: chat speech bubbles ────────────────────
    case "campus_forum":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Large bubble */}
          <View
            style={[d.bubbleLg, { borderColor: c, opacity: 0.13 }]}
          />
          {/* Small bubble */}
          <View
            style={[d.bubbleSm, { borderColor: c, opacity: 0.18 }]}
          />
          {/* Bubble tail dot */}
          <View style={[d.bubbleDot, { backgroundColor: c, opacity: 0.15 }]} />
        </View>
      );

    // ── Book Field: sports field lines ───────────────────────
    case "field_booking":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Outer field boundary */}
          <View style={[d.fieldOuter, { borderColor: c, opacity: 0.13 }]} />
          {/* Center circle */}
          <View style={[d.fieldCenter, { borderColor: c, opacity: 0.18 }]} />
          {/* Half-field line */}
          <View style={[d.fieldMidLine, { backgroundColor: c, opacity: 0.12 }]} />
        </View>
      );

    // ── Blood Aid: drop shape ─────────────────────────────────
    case "blood_donation":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Large soft drop/blob */}
          <View
            style={[d.dropOuter, { backgroundColor: c, opacity: 0.12 }]}
          />
          <View
            style={[d.dropInner, { backgroundColor: c, opacity: 0.1 }]}
          />
          {/* Heart dot */}
          <View style={[d.heartDot, { backgroundColor: c, opacity: 0.22 }]} />
        </View>
      );

    // ── Alumni Network: connected nodes ──────────────────────
    case "alumni":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Node circles */}
          {[
            { top: 6, left: 20, size: 8 },
            { top: 18, left: 4, size: 6 },
            { top: 18, left: 36, size: 6 },
            { top: 32, left: 16, size: 5 },
          ].map(({ top, left, size }, i) => (
            <View
              key={i}
              style={[
                d.networkNode,
                {
                  top,
                  left,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: c,
                  opacity: 0.18,
                },
              ]}
            />
          ))}
          {/* Connection lines */}
          <View style={[d.netLine1, { backgroundColor: c, opacity: 0.1 }]} />
          <View style={[d.netLine2, { backgroundColor: c, opacity: 0.1 }]} />
        </View>
      );

    // ── My Complaints: document / form lines ─────────────────
    case "complaints":
      return (
        <View style={d.wrap} pointerEvents="none">
          {/* Document outline */}
          <View style={[d.docOutline, { borderColor: c, opacity: 0.13 }]} />
          {/* Document text lines */}
          {[14, 22, 30].map((t) => (
            <View
              key={t}
              style={[
                d.docLine,
                { top: t, width: t === 30 ? 20 : 32, backgroundColor: c, opacity: 0.13 },
              ]}
            />
          ))}
        </View>
      );

    // ── Default fallback: concentric circles ─────────────────
    default:
      return (
        <View style={d.wrap} pointerEvents="none">
          <View
            style={[d.defRing1, { borderColor: c, opacity: 0.1 }]}
          />
          <View
            style={[d.defRing2, { borderColor: c, opacity: 0.08 }]}
          />
        </View>
      );
  }
});

// ─────────────────────────────────────────────────────────────
// Decoration shape styles
// ─────────────────────────────────────────────────────────────
const d = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 70,
    height: 70,
    overflow: "hidden",
  },

  // exam_routines — ruled lines
  hLine: { position: "absolute", left: 0, right: 0, height: 1.5, borderRadius: 1 },
  diagLine: {
    position: "absolute",
    bottom: 10,
    right: 4,
    width: 2,
    height: 28,
    borderRadius: 1,
    transform: [{ rotate: "30deg" }],
  },

  // class_routines — clock
  clockRing: {
    position: "absolute",
    bottom: -12,
    right: -12,
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
  },
  clockRingSm: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
  clockHandH: {
    position: "absolute",
    bottom: 20,
    right: 18,
    width: 1.5,
    height: 10,
    borderRadius: 1,
    transform: [{ rotate: "-30deg" }],
  },
  clockHandM: {
    position: "absolute",
    bottom: 17,
    right: 21,
    width: 1.5,
    height: 13,
    borderRadius: 1,
    transform: [{ rotate: "60deg" }],
  },

  // academic_calendar — calendar grid
  calHeader: { position: "absolute", top: 4, left: 0, right: 0, height: 10, borderRadius: 3 },
  calDot: { position: "absolute", width: 5, height: 5, borderRadius: 2.5 },

  // course_eval — layer rings (dynamic, no static styles needed beyond shared)
  layerRing: { position: "absolute", borderWidth: 1.5 },

  // cgpa_calculator — bar chart
  chartBase: { position: "absolute", bottom: 4, left: 0, right: 0, height: 1.5, borderRadius: 1 },
  chartBar: { position: "absolute", width: 8, borderRadius: 2 },

  // noticeboard — wave arcs
  waveArc: {
    position: "absolute",
    borderTopWidth: 1.5,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // bus_schedule — road
  roadArc1: {
    position: "absolute",
    bottom: -20,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  roadArc2: {
    position: "absolute",
    bottom: -8,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  roadDash: { position: "absolute", right: 6, width: 6, height: 1.5, borderRadius: 1 },

  // campus_events — rings
  eventRing: { position: "absolute", borderWidth: 1.5 },
  starDot: {
    position: "absolute",
    bottom: 18,
    right: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // campus_forum — chat bubbles
  bubbleLg: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 50,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  bubbleSm: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  bubbleDot: {
    position: "absolute",
    bottom: 2,
    right: 14,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  // field_booking — sports field
  fieldOuter: {
    position: "absolute",
    bottom: -10,
    right: -10,
    width: 60,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  fieldCenter: {
    position: "absolute",
    bottom: 8,
    right: 18,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  fieldMidLine: {
    position: "absolute",
    bottom: 0,
    right: 27,
    width: 1.5,
    height: 50,
    borderRadius: 1,
  },

  // blood_donation — drop blob
  dropOuter: {
    position: "absolute",
    bottom: -18,
    right: -18,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  dropInner: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  heartDot: {
    position: "absolute",
    bottom: 18,
    right: 18,
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // alumni — network nodes
  networkNode: { position: "absolute" },
  netLine1: {
    position: "absolute",
    top: 11,
    left: 10,
    width: 18,
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: "25deg" }],
  },
  netLine2: {
    position: "absolute",
    top: 24,
    left: 8,
    width: 22,
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: "-20deg" }],
  },

  // complaints — document
  docOutline: {
    position: "absolute",
    bottom: -8,
    right: -6,
    width: 42,
    height: 54,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  docLine: { position: "absolute", left: 8, height: 1.5, borderRadius: 1 },

  // default fallback
  defRing1: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
  },
  defRing2: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
  },
});

// ─────────────────────────────────────────────────────────────
// FeatureCard
// ─────────────────────────────────────────────────────────────
export const FeatureCard = React.memo(function FeatureCard({
  item,
  fullWidth = false,
}: FeatureCardProps) {
  const router = useRouter();
  const theme: FeatureVisualTheme = FeatureVisualThemeResolver.resolve(
    item.id,
    item.category,
    item.fallbackIcon,
  );

  // ── Full-width horizontal layout ──
  if (fullWidth) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          styles.cardFullWidth,
          { backgroundColor: theme.iconBackground },
        ]}
        onPress={() => router.push(item.route)}
        activeOpacity={0.75}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${item.title}: ${item.desc}. Double tap to open.`}
      >
        <CardBgDecoration featureId={item.id} color={theme.accentColor} />

        <View style={[styles.iconContainer, styles.iconContainerFull]}>
          <Image source={item.assetIcon} style={styles.iconImage} resizeMode="contain" />
        </View>

        <View style={styles.textBlockFull}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.desc}</Text>
        </View>

        <View style={styles.chevronCircle}>
          <Feather name="chevron-right" size={14} color="#94a3b8" />
        </View>
      </TouchableOpacity>
    );
  }

  // ── Grid card (half-width, vertical layout) ──
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.iconBackground }]}
      onPress={() => router.push(item.route)}
      activeOpacity={0.75}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${item.title}: ${item.desc}. Double tap to open.`}
    >
      <CardBgDecoration featureId={item.id} color={theme.accentColor} />

      <View style={styles.chevronWrap}>
        <Feather name="chevron-right" size={15} color="#94a3b8" />
      </View>

      <View style={styles.iconContainer}>
        <Image source={item.assetIcon} style={styles.iconImage} resizeMode="contain" />
      </View>

      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.desc}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.06)",
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    overflow: "hidden",
    position: "relative",
    minHeight: 142,
  },
  cardFullWidth: {
    flex: undefined,
    width: "100%",
    minHeight: undefined,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  textBlockFull: { flex: 1 },
  chevronWrap: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    zIndex: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    zIndex: 2,
  },
  iconContainerFull: {
    marginBottom: 0,
    flexShrink: 0,
  },
  iconImage: { width: 30, height: 30 },
  title: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#131b2e",
    letterSpacing: -0.2,
    lineHeight: 19,
    marginBottom: 4,
    zIndex: 2,
  },
  desc: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "400",
    color: "#475569",
    lineHeight: 16,
    zIndex: 2,
  },
});
