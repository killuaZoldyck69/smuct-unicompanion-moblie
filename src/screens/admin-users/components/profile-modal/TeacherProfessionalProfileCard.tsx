import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";

import { TeacherProfile } from "../../types";
import { handleOpenUrl } from "../../utils";

interface TeacherProfessionalProfileCardProps {
  profile?: TeacherProfile | null;
}

interface ParsedQualification {
  degree: string;
  details: string;
}

export const TeacherProfessionalProfileCard = React.memo(
  ({ profile }: TeacherProfessionalProfileCardProps) => {
    // Expertise List
    const expertiseList = React.useMemo(() => {
      const raw = profile?.expertiseFields;
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.filter((s) => typeof s === "string" && s.trim().length > 0);
      }
      if (typeof raw === "string" && raw.trim().length > 0) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((s) => typeof s === "string" && s.trim().length > 0);
          }
        } catch {}
        return raw.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    }, [profile?.expertiseFields]);

    // Qualifications List (Supports arrays, objects, JSON strings, or delimited strings)
    const qualificationsList = React.useMemo<ParsedQualification[]>(() => {
      const raw = profile?.academicQualifications;
      if (!raw) return [];

      let data: any = raw;
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
          data = JSON.parse(trimmed);
        } catch {
          return trimmed
            .split(/[\n;]/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
              const parts = line.split(/[-—–]/);
              if (parts.length >= 2) {
                return {
                  degree: parts[0].trim(),
                  details: parts.slice(1).join(" — ").trim(),
                };
              }
              return { degree: line, details: "" };
            });
        }
      }

      // If array
      if (Array.isArray(data)) {
        return data
          .map((q: any) => {
            if (!q) return null;
            if (typeof q === "string") {
              const parts = q.split(/[-—–]/);
              if (parts.length >= 2) {
                return {
                  degree: parts[0].trim(),
                  details: parts.slice(1).join(" — ").trim(),
                };
              }
              return { degree: q.trim(), details: "" };
            }
            if (typeof q === "object") {
              const degree =
                q.degree ||
                q.title ||
                (q.field ? `Degree in ${q.field}` : "") ||
                "Degree";
              const detailsParts = [
                q.field && q.degree && q.degree !== q.field ? q.field : null,
                q.institution || q.institute || q.university,
                q.year || q.passingYear,
                q.honors || q.grade,
              ].filter(Boolean);
              return {
                degree,
                details: detailsParts.join(" — "),
              };
            }
            return null;
          })
          .filter((item): item is ParsedQualification => Boolean(item && item.degree));
      }

      // If object (e.g. Record<string, string>)
      if (typeof data === "object" && data !== null) {
        return Object.entries(data)
          .map(([key, val]) => {
            if (!key) return null;
            if (typeof val === "string") {
              return { degree: key.trim(), details: val.trim() };
            }
            if (typeof val === "object" && val !== null) {
              const v = val as any;
              const detailsParts = [
                v.institution || v.institute || v.university,
                v.year,
                v.honors,
              ].filter(Boolean);
              return {
                degree: v.degree || key.trim(),
                details: detailsParts.join(" — "),
              };
            }
            return { degree: key.trim(), details: String(val) };
          })
          .filter((item): item is ParsedQualification => Boolean(item && item.degree));
      }

      return [];
    }, [profile?.academicQualifications]);

    const linkedInTarget = profile?.linkedInUrl || "https://linkedin.com";
    const portfolioTarget = profile?.personalWebsiteUrl || "https://smuct.ac.bd";

    return (
      <View style={styles.cardContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <FontAwesome5 name="award" size={14} color="#9333EA" />
            </View>
            <Text style={styles.headerTitle}>PROFESSIONAL PROFILE</Text>
          </View>
        </View>

        {/* 1. Research & Expertise */}
        <Text style={styles.sectionSubtitle}>RESEARCH & EXPERTISE</Text>
        {expertiseList.length > 0 ? (
          <View style={styles.chipsWrap}>
            {expertiseList.map((item, index) => (
              <View key={index} style={styles.expertiseChip}>
                <Text style={styles.expertiseChipText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCardBox}>
            <Text style={styles.emptyText}>No research areas specified</Text>
          </View>
        )}

        {/* 2. Qualifications */}
        <Text style={[styles.sectionSubtitle, { marginTop: 16 }]}>
          QUALIFICATIONS
        </Text>
        {qualificationsList.length > 0 ? (
          <View style={styles.streamlinedContainer}>
            {qualificationsList.map((qual, index) => {
              const isLast = index === qualificationsList.length - 1;
              return (
                <View key={index} style={styles.streamlinedRow}>
                  {/* Timeline Node + Vertical Line */}
                  <View style={styles.timelineCol}>
                    <View style={styles.timelineDot}>
                      <FontAwesome5
                        name="graduation-cap"
                        size={10}
                        color="#7C3AED"
                      />
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Qualification Content */}
                  <View
                    style={[
                      styles.streamlinedContent,
                      !isLast && styles.streamlinedContentSpacing,
                    ]}
                  >
                    <Text style={styles.streamlinedDegree}>
                      {qual.degree}
                    </Text>
                    {Boolean(qual.details) && (
                      <Text style={styles.streamlinedDetails}>
                        {qual.details}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCardBox}>
            <Text style={styles.emptyText}>No qualifications listed</Text>
          </View>
        )}

        {/* 3. Links (LinkedIn & Academic Portfolio) */}
        <TouchableOpacity
          style={styles.linkCard}
          activeOpacity={0.8}
          onPress={() => handleOpenUrl(linkedInTarget)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open LinkedIn Profile"
        >
          <View style={styles.linkLeft}>
            <View style={styles.linkIconCircleLinkedIn}>
              <Feather name="linkedin" size={15} color="#0A66C2" />
            </View>
            <Text style={styles.linkLabel}>LinkedIn Profile</Text>
          </View>
          <Feather name="external-link" size={15} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkCard}
          activeOpacity={0.8}
          onPress={() => handleOpenUrl(portfolioTarget)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open Academic Portfolio"
        >
          <View style={styles.linkLeft}>
            <View style={styles.linkIconCirclePortfolio}>
              <Feather name="globe" size={15} color="#0D9488" />
            </View>
            <Text style={styles.linkLabel}>Academic Portfolio</Text>
          </View>
          <Feather name="external-link" size={15} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FAF5FF",
    borderWidth: 1.2,
    borderColor: "#E9D5FF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B21A8",
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#6B21A8",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  expertiseChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expertiseChipText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#7E22CE",
  },
  streamlinedContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.12)",
  },
  streamlinedRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  timelineCol: {
    alignItems: "center",
    width: 22,
    marginRight: 12,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FAF5FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: "#E9D5FF",
    marginVertical: 3,
  },
  streamlinedContent: {
    flex: 1,
    paddingTop: 1,
  },
  streamlinedContentSpacing: {
    paddingBottom: 14,
  },
  streamlinedDegree: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 18,
    marginBottom: 2,
  },
  streamlinedDetails: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 17,
  },
  linkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(233, 213, 255, 0.6)",
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkIconCircleLinkedIn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  linkIconCirclePortfolio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  linkLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptyCardBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(233, 213, 255, 0.6)",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
  },
});
