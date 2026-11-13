import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { CAMPUS_HUB_COLORS } from "../../shared/design-tokens";
import {
  decodeHtml,
  parseInlineRichTokens,
  stripRemainingHtml,
  type InlineToken,
} from "../../shared/rich-text-snippet";
import { fontFamily } from "@/theme/typography";

type RichBlock =
  | { type: "heading"; content: string }
  | { type: "bullet"; tokens: InlineToken[] }
  | { type: "paragraph"; tokens: InlineToken[] }
  | { type: "spacer" };

const HEADING_MARKER = "\u0001H:";
const BULLET_MARKER = "\u0001B:";

function parseRichBlocks(text: string): RichBlock[] {
  if (!text.trim()) return [];

  const preprocessed = text
    .replace(/\u0001/g, "")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, `\n${HEADING_MARKER}$2\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, `\n${BULLET_MARKER}$1\n`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|blockquote|tr|table|ul|ol)>/gi, "\n")
    .replace(/<(?:p|div|blockquote|tr|table|ul|ol)[^>]*>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n");
  const blocks: RichBlock[] = [];

  for (const line of preprocessed.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== "spacer") {
        blocks.push({ type: "spacer" });
      }
      continue;
    }

    if (trimmed.startsWith(HEADING_MARKER)) {
      const content = stripRemainingHtml(
        decodeHtml(trimmed.slice(HEADING_MARKER.length).trim()),
      ).trim();
      if (content) blocks.push({ type: "heading", content });
      continue;
    }

    const mdHeading = trimmed.match(/^(?:###|##|#)\s+(.*)$/);
    if (mdHeading) {
      const content = stripRemainingHtml(decodeHtml(mdHeading[1])).trim();
      if (content) blocks.push({ type: "heading", content });
      continue;
    }

    const isHtmlBullet = trimmed.startsWith(BULLET_MARKER);
    const isTextBullet =
      trimmed.startsWith("• ") ||
      trimmed.startsWith("- ") ||
      (trimmed.startsWith("* ") && !trimmed.endsWith("*")) ||
      /^\d+\.\s+/.test(trimmed);

    if (isHtmlBullet || isTextBullet) {
      if (
        blocks.length > 1 &&
        blocks[blocks.length - 1].type === "spacer" &&
        blocks[blocks.length - 2].type === "bullet"
      ) {
        blocks.pop();
      }
      const content = isHtmlBullet
        ? trimmed.slice(BULLET_MARKER.length).trim()
        : trimmed.replace(/^([•\-*]|\d+\.)\s+/, "");
      const tokens = parseInlineRichTokens(content).filter((t) => t.text);
      if (tokens.length) blocks.push({ type: "bullet", tokens });
      continue;
    }

    const tokens = parseInlineRichTokens(trimmed).filter((t) => t.text);
    if (tokens.length) blocks.push({ type: "paragraph", tokens });
  }

  if (blocks[blocks.length - 1]?.type === "spacer") blocks.pop();
  return blocks;
}

export function MarketplaceRichTextDisplay({
  text,
  textColor,
}: {
  text: string;
  textColor?: string;
}) {
  if (!text) return null;
  const blocks = parseRichBlocks(text);
  if (!blocks.length) return null;

  return (
    <View style={styles.displayContainer}>
      {blocks.map((block, index) => {
        if (block.type === "spacer") {
          return <View key={index} style={styles.lineSpacer} />;
        }
        if (block.type === "heading") {
          return (
            <View key={index} style={styles.headingBlock}>
              <View style={styles.headingAccentBar} />
              <Text style={styles.previewH2}>{block.content}</Text>
            </View>
          );
        }
        return (
          <View key={index} style={block.type === "bullet" ? styles.bulletRow : undefined}>
            {block.type === "bullet" && <View style={styles.bulletDot} />}
            <Text style={[styles.previewBody, textColor ? { color: textColor } : null]}>
              {block.tokens.map((token, tokenIndex) => (
                <Text
                  key={tokenIndex}
                  style={[
                    token.bold && styles.previewBold,
                    token.italic && styles.previewItalic,
                    token.underline && styles.previewUnderline,
                  ]}
                >
                  {token.text}
                </Text>
              ))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  displayContainer: {
    gap: 4,
  },
  lineSpacer: {
    height: 5,
  },
  headingBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 3,
  },
  headingAccentBar: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent,
    marginRight: 8,
  },
  previewH2: {
    fontSize: 15,
    fontFamily,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  previewBody: {
    fontSize: 13.5,
    fontFamily,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 20,
    flexShrink: 1,
  },
  previewBold: {
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  previewItalic: {
    fontStyle: "italic",
  },
  previewUnderline: {
    textDecorationLine: "underline",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent,
    marginTop: 8,
    marginRight: 8,
  },
});
