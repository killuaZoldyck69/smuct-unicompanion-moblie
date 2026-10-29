import React, { memo, useMemo } from "react";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";

export interface RichTextSnippetProps {
  text?: string | null;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
}

interface InlineToken {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  nbsp: " ",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  ndash: "–",
  mdash: "—",
  bull: "•",
  hellip: "…",
  copy: "©",
  reg: "®",
};

export function decodeHtml(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return !isNaN(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&([a-zA-Z0-9]+);/g, (match, entity) => HTML_ENTITIES[entity] ?? match);
}

function stripRemainingHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "");
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
  // Generic span, font, or div wrapper — unwrap inner text
  { regex: /<span(?:\s+[^>]*)?>([\s\S]+?)<\/span>/i },
  { regex: /<font(?:\s+[^>]*)?>([\s\S]+?)<\/font>/i },
  { regex: /<div(?:\s+[^>]*)?>([\s\S]+?)<\/div>/i },
];

function parseTokens(
  raw: string,
  flags: { bold?: boolean; italic?: boolean; underline?: boolean } = {}
): InlineToken[] {
  if (!raw) return [];

  for (const tag of INLINE_TAGS) {
    const match = tag.regex.exec(raw);
    if (match) {
      const before = raw.slice(0, match.index);
      const inner = match[1];
      const after = raw.slice(match.index + match[0].length);

      const tokens: InlineToken[] = [];
      if (before) {
        tokens.push({ text: stripRemainingHtml(decodeHtml(before)), ...flags });
      }

      const newFlags = {
        bold: flags.bold || !!tag.bold,
        italic: flags.italic || !!tag.italic,
        underline: flags.underline || !!tag.underline,
      };

      tokens.push(...parseTokens(inner, newFlags));
      if (after) {
        tokens.push(...parseTokens(after, flags));
      }
      return tokens;
    }
  }

  return [{ text: stripRemainingHtml(decodeHtml(raw)), ...flags }];
}

/**
 * Preprocesses markdown and HTML into a clean single-line inline string with inline formatting markers.
 * - Flattens headings (e.g. `### Heading` -> `**Heading** •`)
 * - Normalizes bullets (`- item`, `* item`, `<li>item</li>` -> `• item`)
 * - Converts paragraph & break tags into single spaces or bullet transitions
 */
export function normalizeRichSnippet(raw?: string | null): string {
  if (!raw || !raw.trim()) return "";

  // 1. Convert block tags into newlines
  const withBreaks = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote|tr)>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n");

  const lines = withBreaks.split("\n");
  const processedSegments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if heading: ### Title or <h1-6>Title</h1-6>
    const hMatch =
      line.match(/^(?:#{1,6})\s+(.*)$/) ||
      line.match(/^<h[1-6](?:\s+[^>]*)?>(.*?)(?:<\/h[1-6]>)?$/i);
    if (hMatch) {
      const title = hMatch[1].replace(/<[^>]+>/g, "").trim();
      if (title) {
        processedSegments.push(`**${title}**`);
      }
      continue;
    }

    // Check if bullet: • item, - item, * item, 1. item, or <li>item
    const bMatch =
      line.match(/^(?:[•\-*+]|\d+\.)\s+(.*)$/) ||
      line.match(/^<li(?:\s+[^>]*)?>(.*?)(?:<\/li>)?$/i);
    if (bMatch) {
      const itemContent = bMatch[1].replace(/<\/?li>/gi, "").trim();
      if (itemContent) {
        processedSegments.push(`• ${itemContent}`);
      }
      continue;
    }

    // Normal line
    processedSegments.push(line);
  }

  return processedSegments.join(" ");
}

/**
 * Lightweight, high-performance rich text snippet renderer for list/feed cards.
 * Truncates cleanly across `numberOfLines` while rendering inline bold, italic,
 * underline and formatted list bullets without raw markup symbols or breaking View blocks.
 */
export const RichTextSnippet = memo(function RichTextSnippet({
  text,
  numberOfLines = 2,
  style,
  ellipsizeMode = "tail",
}: RichTextSnippetProps) {
  const tokens = useMemo(() => {
    if (!text || !text.trim()) return [];
    const normalized = normalizeRichSnippet(text);
    return parseTokens(normalized);
  }, [text]);

  if (!tokens.length) return null;

  return (
    <Text style={style} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>
      {tokens.map((token, idx) => {
        const hasFormat = token.bold || token.italic || token.underline;
        if (!hasFormat) {
          return <React.Fragment key={idx}>{token.text}</React.Fragment>;
        }
        return (
          <Text
            key={idx}
            style={[
              token.bold && styles.bold,
              token.italic && styles.italic,
              token.underline && styles.underline,
            ]}
          >
            {token.text}
          </Text>
        );
      })}
    </Text>
  );
});

const styles = StyleSheet.create({
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecorationLine: "underline",
  },
});

