import React from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { BENTO_COLORS } from "../constants";

export interface ForumWysiwygEditorProps {
  initialValue?: string;
  onChange: (html: string, plainText: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export const ForumWysiwygEditor = React.memo(function ForumWysiwygEditor({
  initialValue = "",
  onChange,
  placeholder = "Describe your question, course details, or issue with specifics...",
  minHeight = 220,
}: ForumWysiwygEditorProps) {
  return (
    <RichTextEditor
      initialValue={initialValue}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={minHeight}
      accentColor={BENTO_COLORS.deepNavy}
    />
  );
});
