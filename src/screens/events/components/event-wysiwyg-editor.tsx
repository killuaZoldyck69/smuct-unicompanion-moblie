import React from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { BENTO_COLORS } from "../constants";

export interface EventWysiwygEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export const EventWysiwygEditor = React.memo(function EventWysiwygEditor({
  initialValue = "",
  onChange,
  placeholder = "Provide a brief overview, agenda, eligibility, rules, or key highlights... Select any text to apply Bold, Italic, Underline, Bullet Lists, and Justify alignment.",
  minHeight = 220,
}: EventWysiwygEditorProps) {
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
