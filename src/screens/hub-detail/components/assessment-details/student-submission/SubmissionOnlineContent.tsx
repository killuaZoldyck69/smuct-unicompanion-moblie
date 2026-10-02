import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { AssessmentAttachment } from "../types";
import { formatFileSize } from "../utils";
import { SubmissionLink, ActiveDrawerType, StagedSubmissionAttachment } from "./types";
import { styles } from "./styles";

interface SubmissionOnlineContentProps {
  files: (AssessmentAttachment | StagedSubmissionAttachment)[];

  links: SubmissionLink[];
  noteContent: string;
  activeDrawer: ActiveDrawerType;
  tempLinkUrl: string;
  tempLinkTitle: string;
  tempNoteText: string;
  isUploadingFiles: boolean;
  onPickFiles: () => void;
  onOpenDrawer: (type: ActiveDrawerType) => void;
  onOpenTextDrawer: () => void;
  onChangeTempLinkUrl: (text: string) => void;
  onChangeTempLinkTitle: (text: string) => void;
  onChangeTempNoteText: (text: string) => void;
  onSaveLink: () => void;
  onSaveNote: () => void;
  onRemoveFile: (idx: number) => void;
  onRemoveLink: (idx: number) => void;
  onRemoveNote: () => void;
}

export const SubmissionOnlineContent: React.FC<SubmissionOnlineContentProps> = React.memo(
  ({
    files,
    links,
    noteContent,
    activeDrawer,
    tempLinkUrl,
    tempLinkTitle,
    tempNoteText,
    isUploadingFiles,
    onPickFiles,
    onOpenDrawer,
    onOpenTextDrawer,
    onChangeTempLinkUrl,
    onChangeTempLinkTitle,
    onChangeTempNoteText,
    onSaveLink,
    onSaveNote,
    onRemoveFile,
    onRemoveLink,
    onRemoveNote,
  }) => {
    return (
      <View style={styles.addSubmissionSection}>
        <Text style={styles.sectionHeading}>Add your submission</Text>

        {/* 3 Action Tab Buttons */}
        <View style={styles.actionButtonsRow}>
          {/* Button 1: Upload Files */}
          <TouchableOpacity
            style={styles.actionTabBtn}
            activeOpacity={0.8}
            onPress={onPickFiles}
            disabled={isUploadingFiles}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Upload Files"
          >
            {isUploadingFiles ? (
              <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 6 }} />
            ) : (
              <Feather name="upload-cloud" size={16} color="#2563eb" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.actionTabBtnText}>
              {isUploadingFiles ? "Uploading..." : "Upload Files"}
            </Text>
          </TouchableOpacity>

          {/* Button 2: Add Link */}
          <TouchableOpacity
            style={[
              styles.actionTabBtn,
              activeDrawer === "LINK" && styles.actionTabBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => onOpenDrawer(activeDrawer === "LINK" ? null : "LINK")}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add Link"
          >
            <Feather name="link-2" size={16} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={styles.actionTabBtnText}>Add Link</Text>
          </TouchableOpacity>

          {/* Button 3: Add Text */}
          <TouchableOpacity
            style={[
              styles.actionTabBtn,
              activeDrawer === "TEXT" && styles.actionTabBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={onOpenTextDrawer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add Text Note"
          >
            <Feather name="file-text" size={16} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={styles.actionTabBtnText}>Add Text</Text>
          </TouchableOpacity>
        </View>

        {/* Inline Link Drawer */}
        {activeDrawer === "LINK" && (
          <View style={styles.drawerCard}>
            <Text style={styles.drawerTitle}>Attach Web / Drive Link</Text>
            <TextInput
              style={styles.drawerInput}
              placeholder="https://drive.google.com/... or GitHub link"
              placeholderTextColor="#94a3b8"
              value={tempLinkUrl}
              onChangeText={onChangeTempLinkUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TextInput
              style={[styles.drawerInput, { marginTop: 8 }]}
              placeholder="Title (optional, e.g. Project Repository)"
              placeholderTextColor="#94a3b8"
              value={tempLinkTitle}
              onChangeText={onChangeTempLinkTitle}
            />
            <View style={styles.drawerActions}>
              <TouchableOpacity
                style={styles.drawerCancelBtn}
                onPress={() => onOpenDrawer(null)}
              >
                <Text style={styles.drawerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.drawerSaveBtn,
                  !tempLinkUrl.trim() && { opacity: 0.5 },
                ]}
                disabled={!tempLinkUrl.trim()}
                onPress={onSaveLink}
              >
                <Text style={styles.drawerSaveText}>Attach Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Inline Text Drawer */}
        {activeDrawer === "TEXT" && (
          <View style={styles.drawerCard}>
            <Text style={styles.drawerTitle}>Submission Notes / Text</Text>
            <TextInput
              style={[styles.drawerInput, { height: 80, textAlignVertical: "top" }]}
              placeholder="Write your notes, submission summary, or answers here..."
              placeholderTextColor="#94a3b8"
              value={tempNoteText}
              onChangeText={onChangeTempNoteText}
              multiline
            />
            <View style={styles.drawerActions}>
              <TouchableOpacity
                style={styles.drawerCancelBtn}
                onPress={() => onOpenDrawer(null)}
              >
                <Text style={styles.drawerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.drawerSaveBtn}
                onPress={onSaveNote}
              >
                <Text style={styles.drawerSaveText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Uploaded Files List */}
        {files.map((file, idx) => (
          <View key={`file-${idx}-${file.name}`} style={styles.itemCard}>
            <View style={styles.fileIconBox}>
              <Feather name="file-text" size={18} color="#2563eb" />
            </View>
            <View style={styles.fileInfoCol}>
              <Text style={styles.fileNameText} numberOfLines={1}>
                {file.name}
              </Text>
              {file.size ? (
                <Text style={styles.fileSizeText}>
                  {formatFileSize(file.size)}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemoveFile(idx)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Remove file ${file.name}`}
            >
              <Feather name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Attached Links List */}
        {links.map((link, idx) => (
          <View key={`link-${idx}-${link.url}`} style={styles.itemCard}>
            <View style={styles.fileIconBox}>
              <Feather name="link-2" size={18} color="#2563eb" />
            </View>
            <View style={styles.fileInfoCol}>
              <Text style={styles.fileNameText} numberOfLines={1}>
                {link.title || link.url}
              </Text>
              <Text style={styles.fileSizeText} numberOfLines={1}>
                {link.url}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemoveLink(idx)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Remove link"
            >
              <Feather name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Attached Note Preview */}
        {noteContent ? (
          <View style={styles.itemCard}>
            <View style={styles.fileIconBox}>
              <Feather name="edit-3" size={18} color="#2563eb" />
            </View>
            <View style={styles.fileInfoCol}>
              <Text style={styles.fileNameText} numberOfLines={1}>
                Text Submission Note
              </Text>
              <Text style={styles.fileSizeText} numberOfLines={2}>
                {noteContent}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={onRemoveNote}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Remove submission note"
            >
              <Feather name="x" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Helper Information */}
        <View style={styles.helperTextContainer}>
          <Text style={styles.helperText}>
            You can upload up to 5 files (max 10MB each).
          </Text>
          <Text style={styles.helperText}>
            Allowed types: pdf, doc, docx, zip, rar, jpg, png.
          </Text>
        </View>
      </View>
    );
  }
);
