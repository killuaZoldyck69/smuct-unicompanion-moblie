import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Platform,
} from "react-native";
import {
  universityPrograms,
  DEPARTMENT_SHORT_NAMES,
} from "@/data/programs";

const CAMPUS_BG = require("@/assets/login-screen-bg.png");

export const AcademicStatsBanner = React.memo(function AcademicStatsBanner() {
  const { totalPrograms, totalDepartments, totalFaculties } = useMemo(() => {
    const programsCount = universityPrograms.length;
    const uniqueDepartments = new Set(
      universityPrograms.map((p) => p.department),
    );
    const uniqueFaculties = new Set(universityPrograms.map((p) => p.faculty));

    return {
      totalPrograms: programsCount,
      totalDepartments:
        uniqueDepartments.size || Object.keys(DEPARTMENT_SHORT_NAMES).length,
      totalFaculties: uniqueFaculties.size,
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>ACADEMIC OVERVIEW</Text>

      <View style={styles.cardWrapper}>
        <ImageBackground
          source={CAMPUS_BG}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          {/* Dark semi-transparent backdrop overlay to ensure crisp contrast */}
          <View style={styles.overlay}>
            <View style={styles.row}>
              {/* Column 1: Academic Programs */}
              <View style={styles.statColumn}>
                <Text style={styles.statLabel} numberOfLines={2}>
                  ACADEMIC PROGRAMS
                </Text>
                <Text style={styles.statValue}>{totalPrograms}</Text>
              </View>

              {/* Column 2: Department */}
              <View style={styles.statColumn}>
                <Text style={styles.statLabel} numberOfLines={2}>
                  DEPARTMENT
                </Text>
                <Text style={styles.statValue}>{totalDepartments}</Text>
              </View>

              {/* Column 3: Faculties */}
              <View style={styles.statColumn}>
                <Text style={styles.statLabel} numberOfLines={2}>
                  FACULTIES
                </Text>
                <Text style={styles.statValue}>{totalFaculties}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8E9BAE",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0F172A",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  imageBackground: {
    width: "100%",
  },
  imageStyle: {
    borderRadius: 20,
  },
  overlay: {
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  statLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 6,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.7)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
      android: {
        textShadowColor: "rgba(0, 0, 0, 0.7)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
    }),
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        textShadowColor: "rgba(0, 0, 0, 0.7)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      android: {
        textShadowColor: "rgba(0, 0, 0, 0.7)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    }),
  },
});

