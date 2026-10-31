import React from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { CAMPUS_HUB_COLORS } from "../../shared/design-tokens";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  nbsp: " ",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  bull: "•",
  ndash: "–",
  mdash: "—",
};

function decodeHtml(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/&#(\d+);/g, (match, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCharCode(code) : match;
    })
    .replace(
      /&([a-zA-Z0-9]+);/g,
      (match, entity) => HTML_ENTITIES[entity] ?? match,
    );
}

function stripRemainingHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "");
}

interface InlineToken {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const INLINE_TAGS = [
  { regex: /\*\*\*([\s\S]+?)\*\*\*/, bold: true, italic: true },
  { regex: /\*\*([\s\S]+?)\*\*/, bold: true },
  { regex: /<b(?:\s+[^>]*)?>([\s\S]+?)<\/b>/i, bold: true },
  { regex: /<strong(?:\s+[^>]*)?>([\s\S]+?)<\/strong>/i, bold: true },
  {
    regex: /<span[^>]*style="[^"]*font-weight:\s*(?:bold|[789]00)[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    bold: true,
  },
  { regex: /__([\s\S]+?)__/, underline: true },
  { regex: /<u(?:\s+[^>]*)?>([\s\S]+?)<\/u>/i, underline: true },
  { regex: /<ins(?:\s+[^>]*)?>([\s\S]+?)<\/ins>/i, underline: true },
  {
    regex: /<span[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    underline: true,
  },
  { regex: /\*([\s\S]+?)\*/, italic: true },
  { regex: /_([\s\S]+?)_/, italic: true },
  { regex: /<i(?:\s+[^>]*)?>([\s\S]+?)<\/i>/i, italic: true },
  { regex: /<em(?:\s+[^>]*)?>([\s\S]+?)<\/em>/i, italic: true },
  {
    regex: /<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    italic: true,
  },
  { regex: /<span(?:\s+[^>]*)?>([\s\S]+?)<\/span>/i },
  { regex: /<font(?:\s+[^>]*)?>([\s\S]+?)<\/font>/i },
  { regex: /<div(?:\s+[^>]*)?>([\s\S]+?)<\/div>/i },
];

function parseTokens(
  raw: string,
  flags: { bold?: boolean; italic?: boolean; underline?: boolean } = {},
): InlineToken[] {
  if (!raw) return [];

  for (const tag of INLINE_TAGS) {
    const match = tag.regex.exec(raw);
    if (!match) continue;

    const before = raw.slice(0, match.index);
    const after = raw.slice(match.index + match[0].length);
    const tokens: InlineToken[] = [];
    if (before) {
      const cleanedBefore = stripRemainingHtml(decodeHtml(before));
      if (cleanedBefore) tokens.push({ text: cleanedBefore, ...flags });
    }

    tokens.push(
      ...parseTokens(match[1], {
        bold: flags.bold || !!tag.bold,
        italic: flags.italic || !!tag.italic,
        underline: flags.underline || !!tag.underline,
      }),
    );
    if (after) tokens.push(...parseTokens(after, flags));
    return tokens;
  }

  const cleanedRaw = stripRemainingHtml(decodeHtml(raw));
  return cleanedRaw ? [{ text: cleanedRaw, ...flags }] : [];
}

type RichBlock =
  | { type: "heading"; content: string }
  | { type: "bullet"; tokens: InlineToken[] }
  | { type: "paragraph"; tokens: InlineToken[] }
  | { type: "spacer" };

function parseRichBlocks(text: string): RichBlock[] {
  if (!text || !text.trim()) return [];

  const preprocessed = text
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, "\n###HEADING:$2###\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n###BULLET:$1###\n")
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

    if (trimmed.startsWith("###HEADING:") && trimmed.endsWith("###")) {
      const content = stripRemainingHtml(
        decodeHtml(trimmed.slice("###HEADING:".length, -3).trim()),
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

    const isHtmlBullet =
      trimmed.startsWith("###BULLET:") && trimmed.endsWith("###");
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
        ? trimmed.slice("###BULLET:".length, -3).trim()
        : trimmed.replace(/^([•\-*]|\d+\.)\s+/, "");
      const tokens = parseTokens(content);
      if (tokens.length) blocks.push({ type: "bullet", tokens });
      continue;
    }

    const tokens = parseTokens(trimmed);
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
  if (!text || !text.trim()) return null;
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
