import React from "react";
import {
  CampusBuildingWatermark,
  ConnectedKnowledgeWatermark,
  DigitalPresenceWatermark,
  DropletWatermark,
  CommunicationWaveWatermark,
  AcademicHaloWatermark,
} from "./faculty-illustrations";

export type FacultySectionType =
  | "identity"
  | "academicPosition"
  | "expertise"
  | "qualifications"
  | "contactBlood"
  | "contactPhone"
  | "social";

export interface FacultySectionThemeConfig {
  iconName: string;
  badgeBg: string;
  badgeBorder: string;
  iconColor: string;
  titleColor: string;
  accentColor: string;
  watermarkOpacity: number;
  renderWatermark?: (props?: any) => React.ReactNode;
}

/**
 * FacultyIllustrationThemeResolver
 * Determines iconography, accents, typography colors, and SVG illustrations
 * dynamically for any section of the Faculty Profile.
 */
export const FacultyIllustrationThemeResolver = {
  getTheme(section: FacultySectionType): FacultySectionThemeConfig {
    switch (section) {
      case "identity":
        return {
          iconName: "award",
          badgeBg: "#ecfdf5",
          badgeBorder: "rgba(5, 150, 105, 0.2)",
          iconColor: "#047857",
          titleColor: "#131b2e",
          accentColor: "#10b981",
          watermarkOpacity: 0.35,
          renderWatermark: (props) => <AcademicHaloWatermark {...props} />,
        };

      case "academicPosition":
        return {
          iconName: "award",
          badgeBg: "#eff6ff",
          badgeBorder: "rgba(37, 99, 235, 0.16)",
          iconColor: "#2563eb",
          titleColor: "#1e3a8a",
          accentColor: "#3b82f6",
          watermarkOpacity: 0.14,
          renderWatermark: (props) => <CampusBuildingWatermark {...props} />,
        };

      case "expertise":
        return {
          iconName: "code",
          badgeBg: "#ecfdf5",
          badgeBorder: "rgba(16, 185, 129, 0.20)",
          iconColor: "#059669",
          titleColor: "#065f46",
          accentColor: "#10b981",
          watermarkOpacity: 0.15,
          renderWatermark: (props) => <ConnectedKnowledgeWatermark {...props} />,
        };

      case "qualifications":
        return {
          iconName: "book-open",
          badgeBg: "#eff6ff",
          badgeBorder: "rgba(37, 99, 235, 0.16)",
          iconColor: "#2563eb",
          titleColor: "#1e3a8a",
          accentColor: "#3b82f6",
          watermarkOpacity: 0.12,
        };

      case "contactBlood":
        return {
          iconName: "droplet",
          badgeBg: "#fef2f2",
          badgeBorder: "rgba(239, 68, 68, 0.16)",
          iconColor: "#dc2626",
          titleColor: "#64748b",
          accentColor: "#ef4444",
          watermarkOpacity: 0.10,
          renderWatermark: (props) => <DropletWatermark {...props} />,
        };

      case "contactPhone":
        return {
          iconName: "phone",
          badgeBg: "#fff7ed",
          badgeBorder: "rgba(249, 115, 22, 0.16)",
          iconColor: "#ea580c",
          titleColor: "#64748b",
          accentColor: "#f97316",
          watermarkOpacity: 0.10,
          renderWatermark: (props) => <CommunicationWaveWatermark {...props} />,
        };

      case "social":
        return {
          iconName: "link",
          badgeBg: "#eff6ff",
          badgeBorder: "rgba(37, 99, 235, 0.16)",
          iconColor: "#2563eb",
          titleColor: "#1e3a8a",
          accentColor: "#3b82f6",
          watermarkOpacity: 0.12,
          renderWatermark: (props) => <DigitalPresenceWatermark {...props} />,
        };

      default:
        return {
          iconName: "info",
          badgeBg: "#f1f5f9",
          badgeBorder: "rgba(15, 23, 42, 0.08)",
          iconColor: "#131b2e",
          titleColor: "#131b2e",
          accentColor: "#3b82f6",
          watermarkOpacity: 0.10,
        };
    }
  },
};
