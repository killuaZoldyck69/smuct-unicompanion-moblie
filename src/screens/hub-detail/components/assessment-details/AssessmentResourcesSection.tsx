import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AssessmentAttachment, AssessmentLink } from "./types";
import { formatFileSize, openSafeUrl } from "./utils";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface AssessmentResourcesSectionProps {
  attachments?: AssessmentAttachment[] | null;
  links?: AssessmentLink[] | null;
}

export const AssessmentResourcesSection: React.FC<AssessmentResourcesSectionProps> = React.memo(
  ({ attachments, links }) => {
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasLinks = Array.isArray(links) && links.length > 0;

    return (
      <View style={styles.container}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Resources</Text>
        </View>

        {/* Files / Attachments */}
        {hasAttachments &&
          attachments!.map((att, idx) => (
            <TouchableOpacity
              key={`att-${idx}`}
              style={styles.resourceCard}
              activeOpacity={0.7}
              onPress={() => openSafeUrl(att.url)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Download ${att.name}`}
            >
              <View style={styles.resourceIconBox}>
                <Feather name="file-text" size={18} color="#2563eb" />
              </View>
              <View style={styles.resourceInfoCol}>
                <Text style={styles.resourceFileName} numberOfLines={1}>
                  {att.name || "Resource File"}
                </Text>
                {att.size ? (
                  <Text style={styles.resourceFileSize}>{formatFileSize(att.size)}</Text>
                ) : null}
              </View>
              <View style={styles.resourceActionBtn}>
                <Feather name="download" size={16} color="#64748b" />
              </View>
            </TouchableOpacity>
          ))}

        {/* Links */}
        {hasLinks &&
          links!.map((lnk, idx) => (
            <TouchableOpacity
              key={`lnk-${idx}`}
              style={styles.resourceCard}
              activeOpacity={0.7}
              onPress={() => openSafeUrl(lnk.url)}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel={`Open link ${lnk.title || lnk.url}`}
            >
              <View style={styles.resourceIconBox}>
                <Feather name="link-2" size={18} color="#2563eb" />
              </View>
              <View style={styles.resourceInfoCol}>
                <Text style={styles.resourceFileName} numberOfLines={1}>
                  {lnk.title || lnk.url}
                </Text>
                <Text style={styles.resourceFileSize} numberOfLines={1}>
                  {lnk.url}
                </Text>
              </View>
              <View style={styles.resourceActionBtn}>
                <Feather name="external-link" size={16} color="#64748b" />
              </View>
            </TouchableOpacity>
          ))}

        {/* Empty State */}
        {!hasAttachments && !hasLinks && (
          <View style={styles.emptyResourceBox}>
            <Text style={styles.emptyResourceText}>
              No reference files or links attached to this coursework.
            </Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    marginBottom: 8,
  },
  resourceIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  resourceInfoCol: {
    flex: 1,
  },
  resourceFileName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  resourceFileSize: {
    fontFamily,
    fontSize: 11,
    color: "#64748b",
  },
  resourceActionBtn: {
    padding: 6,
  },
  emptyResourceBox: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  emptyResourceText: {
    fontFamily,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});
