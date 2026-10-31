import React from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { NOTICE_COLORS } from "../constants";

export interface OfficialWysiwygEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export const OfficialWysiwygEditor = React.memo(function OfficialWysiwygEditor({
  initialValue = "",
  onChange,
  placeholder = "Enter the official announcement body text... Select any text to apply Bold, Italic, Underline, Bullet Lists, and Justify alignment.",
  minHeight = 240,
}: OfficialWysiwygEditorProps) {
  return (
    <RichTextEditor
      initialValue={initialValue}
      onChange={onChange}
      placeholder={placeholder}
      minHeight={minHeight}
      accentColor={NOTICE_COLORS.deepNavy}
    />
  );
});
