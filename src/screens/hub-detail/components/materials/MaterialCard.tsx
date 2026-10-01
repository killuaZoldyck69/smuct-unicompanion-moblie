import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialItem } from "./types";
import { formatDate } from "@/utils/date-formatter";

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
}

export const MaterialCard: React.FC<MaterialCardProps> = React.memo(
  ({ item, canManage, currentUserId, onDelete }) => {
    const isUploader = currentUserId && item.uploaderId === currentUserId;
    const canDelete = isUploader || canManage;
    const isStudent = item.isStudentNote;
    const attachments = Array.isArray(item.attachments) ? item.attachments : [];

    const handleOpenLink = (url: string) => {
      if (!url) return;
      Linking.openURL(url).catch(() => {});
    };

    return (
      <View style={styles.card}>
        {/* Card Header Row */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isStudent ? "#f0fdf4" : "#eff6ff" },
            ]}
          >
            <Feather
              name={isStudent ? "file-text" : "book-open"}
              size={18}
              color={isStudent ? "#16a34a" : "#2563eb"}
            />
          </View>

          <View style={styles.titleCol}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.uploaderText}>
              By {item.uploader?.name || "Member"} • {formatDate(item.createdAt)}
            </Text>
          </View>

          {canDelete && (
            <TouchableOpacity
              onPress={() => onDelete(item.id, item.title)}
              style={styles.deleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Delete material ${item.title}`}
            >
              <Feather name="trash-2" size={14} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Optional Description */}
        {item.description ? (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {attachments.map((att, idx) => (
              <TouchableOpacity
                key={`att-${idx}`}
                style={styles.attachmentPill}
                activeOpacity={0.7}
                onPress={() => handleOpenLink(att.url)}
                accessible={true}
                accessibilityRole="link"
                accessibilityLabel={`Open attachment ${att.name || `File ${idx + 1}`}`}
              >
                <Feather
                  name="paperclip"
                  size={12}
                  color="#2563eb"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {att.name || `Attachment ${idx + 1}`}
                </Text>
                <Feather
                  name="external-link"
                  size={11}
                  color="#64748b"
                  style={{ marginLeft: 5 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Footer: External Drive / Web link (if provided) */}
        {item.driveUrl && item.driveUrl !== "https://drive.google.com" ? (
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.openUrlBtn}
              activeOpacity={0.75}
              onPress={() => handleOpenLink(item.driveUrl)}
              accessible={true}
              accessibilityRole="link"
              accessibilityLabel="Open document link"
            >
              <Feather
                name="link-2"
                size={12}
                color="#0284c7"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.openUrlText} numberOfLines={1}>
                Open Resource Link
              </Text>
              <Feather
                name="arrow-up-right"
                size={12}
                color="#0284c7"
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 20,
    marginBottom: 3,
  },
  uploaderText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748b",
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },
  description: {
    fontFamily,
    fontSize: 12.5,
    color: "#475569",
    lineHeight: 18,
    marginTop: 10,
  },
  attachmentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(37, 99, 235, 0.12)",
    maxWidth: "100%",
  },
  attachmentName: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#1e40af",
    maxWidth: 220,
  },
  footerRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(15, 23, 42, 0.04)",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  openUrlBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.15)",
  },
  openUrlText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0284c7",
  },
});
