import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialItem } from "./types";
import { formatDate } from "@/utils/date-formatter";
import {
  getMaterialTheme,
  getMaterialSubtitle,
  getFileTheme,
  formatFileSize,
} from "./utils";
import {
  openDocumentOrLink,
  downloadAndSaveDocument,
} from "./file-actions";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface MaterialCardProps {
  item: MaterialItem;
  canManage: boolean;
  currentUserId?: string;
  onDelete: (id: string, title: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const MaterialCard: React.FC<MaterialCardProps> = React.memo(
  ({ item, canManage, currentUserId, onDelete, isFirst = true, isLast = true }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

    const isUploader = currentUserId && item.uploaderId === currentUserId;
    const canDelete = Boolean(isUploader || canManage);
    const attachments = Array.isArray(item.attachments) ? item.attachments : [];
    const links = Array.isArray(item.links) ? item.links : [];

    const theme = getMaterialTheme(item);
    const subtitle = getMaterialSubtitle(item);

    const hasMultiFiles = attachments.length > 1;
    const hasBothFilesAndLinks = attachments.length > 0 && links.length > 0;
    const hasMultipleLinks = links.length > 1;
    const hasDescription = Boolean(item.description && item.description.trim());
    const isExpandable =
      hasMultiFiles || hasBothFilesAndLinks || hasMultipleLinks || hasDescription;

    const primaryAttachment = attachments.length > 0 ? attachments[0] : null;
    const primaryLink = links.length > 0 ? links[0] : null;

    const handleDownload = async (url: string, name?: string, type?: string) => {
      if (!url || downloadingUrl) return;
      try {
        setDownloadingUrl(url);
        await downloadAndSaveDocument(url, name, type);
      } finally {
        setDownloadingUrl(null);
      }
    };

    const handleOpen = async (
      url: string,
      name?: string,
      isExplicitLink?: boolean
    ) => {
      if (!url) return;
      await openDocumentOrLink(url, name, isExplicitLink);
    };

    const handleCardPress = () => {
      if (isExpandable) {
        setIsExpanded((prev) => !prev);
        return;
      }

      // Single item: open directly
      if (primaryAttachment?.url) {
        handleOpen(primaryAttachment.url, primaryAttachment.name);
        return;
      }
      if (primaryLink?.url) {
        handleOpen(primaryLink.url, primaryLink.title || undefined, true);
        return;
      }
      if (item.driveUrl && item.driveUrl !== "https://drive.google.com") {
        handleOpen(item.driveUrl, undefined, true);
        return;
      }
    };

    return (
      <View
        style={[
          styles.cardRow,
          isFirst && styles.cardRowFirst,
          isLast && styles.cardRowLast,
        ]}
      >
        <TouchableOpacity
          style={styles.rowMain}
          activeOpacity={0.7}
          onPress={handleCardPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${subtitle}, ${formatDate(item.createdAt)}`}
        >
          {/* File Icon Badge */}
          <View
            style={[
              styles.badgeContainer,
              {
                backgroundColor: theme.badgeBg,
                borderColor: theme.badgeBorder,
              },
            ]}
          >
            {theme.iconFamily === "MaterialCommunityIcons" ? (
              <MaterialCommunityIcons
                name={theme.iconName as any}
                size={23}
                color={theme.iconColor}
              />
            ) : (
              <Feather
                name={theme.iconName as any}
                size={20}
                color={theme.iconColor}
              />
            )}
          </View>

          {/* Title & Metadata Column */}
          <View style={styles.textCol}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
              {isExpandable && (
                <Feather
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={12}
                  color="#94a3b8"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>

          {/* Date & Actions Column */}
          <View style={styles.rightCol}>
            <Text style={styles.dateText}>
              {formatDate(item.createdAt)}
            </Text>

            <View style={styles.actionsRow}>
              {primaryAttachment ? (
                <TouchableOpacity
                  style={styles.downloadIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDownload(
                      primaryAttachment.url,
                      primaryAttachment.name,
                      primaryAttachment.type
                    );
                  }}
                  disabled={downloadingUrl === primaryAttachment.url}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Download ${primaryAttachment.name || "file"}`}
                >
                  {downloadingUrl === primaryAttachment.url ? (
                    <ActivityIndicator size="small" color="#0284c7" />
                  ) : (
                    <Feather name="download" size={13} color="#0284c7" />
                  )}
                </TouchableOpacity>
              ) : primaryLink ? (
                <TouchableOpacity
                  style={styles.linkIconBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleOpen(
                      primaryLink.url,
                      primaryLink.title || undefined,
                      true
                    );
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Open link ${primaryLink.title || primaryLink.url}`}
                >
                  <Feather name="external-link" size={13} color="#0284c7" />
                </TouchableOpacity>
              ) : null}

              {canDelete && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(item.id, item.title);
                  }}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete material ${item.title}`}
                >
                  <Feather name="trash-2" size={13} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Expandable Details for items with multiple attachments/links or description */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.description ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>{item.description}</Text>
              </View>
            ) : null}

            {/* Sub-attachments */}
            {attachments.length > 0 && (
              <View style={styles.subFilesContainer}>
                {attachments.map((att, idx) => {
                  const subTheme = getFileTheme(att.type, att.name);
                  const isDownloadingThis = downloadingUrl === att.url;
                  return (
                    <View key={`sub-att-${idx}`} style={styles.subFileCard}>
                      <View
                        style={[
                          styles.subFileIconDot,
                          { backgroundColor: subTheme.badgeBg },
                        ]}
                      >
                        {subTheme.iconFamily === "MaterialCommunityIcons" ? (
                          <MaterialCommunityIcons
                            name={subTheme.iconName as any}
                            size={16}
                            color={subTheme.iconColor}
                          />
                        ) : (
                          <Feather
                            name={subTheme.iconName as any}
                            size={14}
                            color={subTheme.iconColor}
                          />
                        )}
                      </View>

                      <View style={styles.subFileInfo}>
                        <Text style={styles.subFileName} numberOfLines={1}>
                          {att.name || `Attachment ${idx + 1}`}
                        </Text>
                        {att.size ? (
                          <Text style={styles.subFileSize}>
                            {formatFileSize(att.size)}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.subFileActions}>
                        <TouchableOpacity
                          style={styles.subActionBtn}
                          activeOpacity={0.7}
                          onPress={() => handleOpen(att.url, att.name)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`View attachment ${att.name || `File ${idx + 1}`}`}
                        >
                          <Feather name="eye" size={12} color="#475569" />
                          <Text style={styles.subActionText}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.subActionBtn, styles.subDownloadBtn]}
                          activeOpacity={0.7}
                          onPress={() =>
                            handleDownload(att.url, att.name, att.type)
                          }
                          disabled={isDownloadingThis}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Download attachment ${att.name || `File ${idx + 1}`}`}
                        >
                          {isDownloadingThis ? (
                            <ActivityIndicator size="small" color="#0284c7" />
                          ) : (
                            <>
                              <Feather
                                name="download"
                                size={12}
                                color="#0284c7"
                              />
                              <Text style={styles.subDownloadText}>Save</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Sub-links */}
            {links.length > 0 && (
              <View style={styles.subLinksContainer}>
                {links.map((lnk, idx) => (
                  <TouchableOpacity
                    key={`sub-lnk-${idx}`}
                    style={styles.subLinkCard}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleOpen(lnk.url, lnk.title || undefined, true)
                    }
                    accessible={true}
                    accessibilityRole="link"
                    accessibilityLabel={`Open link ${lnk.title || lnk.url}`}
                  >
                    <View style={styles.subLinkIconDot}>
                      <Feather name="link-2" size={13} color="#0284c7" />
                    </View>
                    <Text style={styles.subLinkText} numberOfLines={1}>
                      {lnk.title || lnk.url}
                    </Text>
                    <Feather
                      name="external-link"
                      size={12}
                      color="#0284c7"
                      style={{ marginLeft: "auto" }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Fallback Drive URL */}
            {item.driveUrl &&
              item.driveUrl !== "https://drive.google.com" &&
              links.length === 0 && (
                <TouchableOpacity
                  style={styles.openDriveBtn}
                  activeOpacity={0.75}
                  onPress={() => handleOpen(item.driveUrl, undefined, true)}
                >
                  <Feather
                    name="link-2"
                    size={12}
                    color="#0284c7"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.openDriveText}>
                    Open Primary Resource Link
                  </Text>
                  <Feather
                    name="arrow-up-right"
                    size={12}
                    color="#0284c7"
                    style={{ marginLeft: 3 }}
                  />
                </TouchableOpacity>
              )}

            {/* Uploader Attribution */}
            <View style={styles.uploaderRow}>
              <Text style={styles.uploaderText}>
                Uploaded by {item.uploader?.name || "Member"}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  cardRow: {
    backgroundColor: "#ffffff",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.07)",
    overflow: "hidden",
  },
  cardRowFirst: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardRowLast: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  rowMain: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  badgeContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textCol: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 10,
  },
  title: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 2,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748b",
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  dateText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 3,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  downloadIconBtn: {
    width: 27,
    height: 27,
    borderRadius: 7,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  linkIconBtn: {
    width: 27,
    height: 27,
    borderRadius: 7,
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 27,
    height: 27,
    borderRadius: 7,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  expandedContent: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.05)",
  },
  descriptionBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  descriptionText: {
    fontFamily,
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },
  subFilesContainer: {
    gap: 7,
    marginBottom: 8,
  },
  subFileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  subFileIconDot: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  subFileInfo: {
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  subFileName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
  },
  subFileSize: {
    fontFamily,
    fontSize: 10.5,
    color: "#64748b",
    marginTop: 1,
  },
  subFileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  subActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  subActionText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  subDownloadBtn: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.2)",
  },
  subDownloadText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#0284c7",
  },
  subLinksContainer: {
    gap: 6,
    marginBottom: 8,
  },
  subLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.15)",
  },
  subLinkIconDot: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#f0f9ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  subLinkText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#0369a1",
    flex: 1,
    marginRight: 8,
  },
  openDriveBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.15)",
    marginBottom: 8,
  },
  openDriveText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#0284c7",
  },
  uploaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  uploaderText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "500",
    color: "#94a3b8",
  },
});
