import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";
import { AttachmentItem, LinkItem } from "./types";
import { BENTO, fontFamily } from "./constants";
import { formatFileSize, getFileIcon } from "./utils";
import { uploadMultipleFilesToCloudinary } from "@/services/cloudinary-service";

interface Props {
  attachments: AttachmentItem[];
  onAddAttachments: (items: AttachmentItem[]) => void;
  onRemoveAttachment: (idx: number) => void;
  links: LinkItem[];
  onAddLink: (link: LinkItem) => void;
  onRemoveLink: (idx: number) => void;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
}

export const CourseworkAttachmentsSection: React.FC<Props> = ({
  attachments,
  onAddAttachments,
  onRemoveAttachment,
  links,
  onAddLink,
  onRemoveLink,
  isUploading,
  setIsUploading,
}) => {
  const [isLinkDrawerOpen, setIsLinkDrawerOpen] = useState(false);
  const [tempLinkUrl, setTempLinkUrl] = useState("");
  const [tempLinkTitle, setTempLinkTitle] = useState("");

  const handlePickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      if (attachments.length + res.assets.length > 5) {
        Toast.show({
          type: "error",
          text1: "Maximum 5 files",
          text2: "You can attach up to 5 files to coursework.",
        });
        return;
      }

      setIsUploading(true);
      const uploaded = await uploadMultipleFilesToCloudinary(
        res.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || undefined,
          size: asset.size || undefined,
        })),
      );

      const newItems: AttachmentItem[] = uploaded.map((u) => ({
        name: u.name,
        url: u.secureUrl,
        size: u.size,
        type: u.type,
      }));

      onAddAttachments(newItems);
      Toast.show({ type: "success", text1: "Files Attached" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "File Upload Failed",
        text2: err.message || "Failed to upload attached files.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveLink = () => {
    if (!tempLinkUrl.trim()) return;
    const formattedUrl =
      tempLinkUrl.startsWith("http://") || tempLinkUrl.startsWith("https://")
        ? tempLinkUrl.trim()
        : `https://${tempLinkUrl.trim()}`;

    onAddLink({
      title: tempLinkTitle.trim() || formattedUrl,
      url: formattedUrl,
    });
    setTempLinkUrl("");
    setTempLinkTitle("");
    setIsLinkDrawerOpen(false);
  };

  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderBetween}>
        <View style={styles.labelRow}>
          <Feather
            name="paperclip"
            size={12}
            color={BENTO.slate}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.fieldLabel}>ATTACHMENTS & MATERIALS</Text>
        </View>
        {(attachments.length > 0 || links.length > 0) && (
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {attachments.length + links.length} attached
            </Text>
          </View>
        )}
      </View>

      {/* Dual Action Buttons (Files & Links) */}
      <View style={styles.attachmentActionsRow}>
        {/* Attach Files Button */}
        <TouchableOpacity
          style={[
            styles.attachmentActionBtn,
            { backgroundColor: BENTO.mintSoft, borderColor: BENTO.mintBorder },
          ]}
          onPress={handlePickFiles}
          disabled={isUploading || attachments.length >= 5}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: "#dcfce7" }]}>
            {isUploading ? (
              <ActivityIndicator size="small" color={BENTO.mintText} />
            ) : (
              <Feather name="file-plus" size={15} color={BENTO.mintText} />
            )}
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionBtnTitle, { color: BENTO.mintText }]}>
              {isUploading ? "Uploading..." : "Attach Files"}
            </Text>
            <Text style={[styles.actionBtnSubtitle, { color: "#166534" }]}>
              PDF, PPT, Word, Images
            </Text>
          </View>
        </TouchableOpacity>

        {/* Add Link Button */}
        <TouchableOpacity
          style={[
            styles.attachmentActionBtn,
            { backgroundColor: BENTO.blueSoft, borderColor: BENTO.blueBorder },
          ]}
          onPress={() => setIsLinkDrawerOpen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: "#dbeafe" }]}>
            <Feather name="link-2" size={15} color={BENTO.blueText} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionBtnTitle, { color: BENTO.blueText }]}>
              {isLinkDrawerOpen ? "Close Drawer" : "Add Link"}
            </Text>
            <Text style={[styles.actionBtnSubtitle, { color: "#1e40af" }]}>
              Drive, Repo, Web
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Inline Link Drawer */}
      {isLinkDrawerOpen && (
        <View style={styles.linkDrawer}>
          <View style={styles.linkDrawerHeader}>
            <Text style={styles.linkDrawerTitle}>Add Resource Link</Text>
            <TouchableOpacity
              onPress={() => setIsLinkDrawerOpen(false)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={15} color={BENTO.slate} />
            </TouchableOpacity>
          </View>

          <View style={styles.linkInputField}>
            <Feather name="globe" size={14} color={BENTO.slate} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.linkTextInput}
              placeholder="https://drive.google.com/... or web URL"
              placeholderTextColor="#94a3b8"
              value={tempLinkUrl}
              onChangeText={setTempLinkUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={[styles.linkInputField, { marginTop: 8 }]}>
            <Feather name="type" size={14} color={BENTO.slate} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.linkTextInput}
              placeholder="Title (e.g. Lab Sheet, Problem Set PDF)"
              placeholderTextColor="#94a3b8"
              value={tempLinkTitle}
              onChangeText={setTempLinkTitle}
            />
          </View>

          <View style={styles.linkDrawerActions}>
            <TouchableOpacity
              style={styles.linkDrawerCancelBtn}
              onPress={() => setIsLinkDrawerOpen(false)}
            >
              <Text style={styles.linkDrawerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.linkDrawerDoneBtn,
                !tempLinkUrl.trim() && { opacity: 0.5 },
              ]}
              disabled={!tempLinkUrl.trim()}
              onPress={handleSaveLink}
            >
              <Text style={styles.linkDrawerDoneText}>Attach Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <View style={styles.filesGrid}>
          {attachments.map((file, idx) => (
            <View key={idx} style={styles.fileCard}>
              <View style={styles.fileCardIcon}>
                <Feather
                  name={getFileIcon(file.type, file.name)}
                  size={14}
                  color={BENTO.navy}
                />
              </View>
              <View style={styles.fileCardTextCol}>
                <Text style={styles.fileCardName} numberOfLines={1}>
                  {file.name}
                </Text>
                {file.size ? (
                  <Text style={styles.fileCardSize}>
                    {formatFileSize(file.size)}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={() => onRemoveAttachment(idx)}
                style={styles.removeChipBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="x" size={13} color={BENTO.slate} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Attached Links List */}
      {links.length > 0 && (
        <View style={styles.linksGrid}>
          {links.map((item, idx) => (
            <View key={idx} style={styles.linkCard}>
              <View style={styles.linkCardIcon}>
                <Feather name="link-2" size={14} color={BENTO.blueText} />
              </View>
              <View style={styles.fileCardTextCol}>
                <Text style={styles.linkCardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.linkCardUrl} numberOfLines={1}>
                  {item.url}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onRemoveLink(idx)}
                style={styles.removeChipBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="x" size={13} color={BENTO.slate} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionBlock: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
  },
  sectionHeaderBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  countPill: {
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.navy,
  },
  attachmentActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  attachmentActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  actionTextCol: {
    flex: 1,
  },
  actionBtnTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
  },
  actionBtnSubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 1,
  },
  filesGrid: {
    gap: 6,
    marginTop: 6,
  },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fileCardIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: BENTO.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fileCardTextCol: {
    flex: 1,
    marginRight: 8,
  },
  fileCardName: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  fileCardSize: {
    fontFamily,
    fontSize: 10,
    color: BENTO.slate,
    marginTop: 1,
  },
  linksGrid: {
    gap: 6,
    marginTop: 6,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkCardIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: BENTO.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  linkCardTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  linkCardUrl: {
    fontFamily,
    fontSize: 10,
    color: BENTO.blueText,
    marginTop: 1,
  },
  removeChipBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: BENTO.canvas,
  },
  linkDrawer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 12,
    marginBottom: 8,
  },
  linkDrawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  linkDrawerTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  linkInputField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  linkTextInput: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: BENTO.navy,
  },
  linkDrawerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  linkDrawerCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  linkDrawerCancelText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  linkDrawerDoneBtn: {
    backgroundColor: BENTO.navy,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  linkDrawerDoneText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
