import React from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { CAMPUS_HUB_COLORS } from "../../shared/design-tokens";

export interface MarketplaceRichEditorProps {
  value?: string;
  onChangeText: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
  onLengthChange?: (length: number) => void;
}

const TEMPLATE_HTML =
  "<p><b>Item Overview</b></p><ul><li><b>Condition:</b> Gently used / tested working</li><li><b>Accessories:</b> Original packaging &amp; accessories included</li></ul><p><b>Handover</b></p><ul><li>SMUCT Main Campus / Library</li><li>Available: Weekdays 10 AM - 4 PM</li></ul>";

export const MarketplaceRichEditor = React.memo(function MarketplaceRichEditor({
  value = "",
  onChangeText,
  placeholder = "Describe condition, edition, accessories, campus meetup spot...",
  minHeight = 135,
  onLengthChange,
}: MarketplaceRichEditorProps) {
  return (
    <RichTextEditor
      initialValue={value}
      onChange={onChangeText}
      placeholder={placeholder}
      minHeight={minHeight}
      accentColor={CAMPUS_HUB_COLORS.marketplaceAccent}
      editorFontSize={14}
      editorLineHeight="1.6"
      editorPadding="12px 14px"
      showJustify={false}
      templateHtml={TEMPLATE_HTML}
      templateLabel="Template"
      showHelperText={false}
      onLengthChange={onLengthChange}
    />
  );
});

export { MarketplaceRichTextDisplay } from "./marketplace-rich-text-display";
