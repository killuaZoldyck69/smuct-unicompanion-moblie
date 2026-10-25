// src/screens/notices/components/rich-notice-text.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { NOTICE_COLORS, fontFamily } from "../constants";

export interface RichNoticeTextProps {
  content: string;
  defaultJustified?: boolean;
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

interface InlineToken {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface TagPattern {
  name: string;
  regex: RegExp;
  flag: "bold" | "italic" | "underline";
  bothFlags?: ("bold" | "italic" | "underline")[];
}

const HTML_ENTITIES_MAP: Record<string, string> = {
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
  trade: "™",
  deg: "°",
  plusmn: "±",
  times: "×",
  divide: "÷",
  euro: "€",
  pound: "£",
  yen: "¥",
  cent: "¢",
  eacute: "é",
  Eacute: "É",
  egrave: "è",
  Egrave: "È",
  ecirc: "ê",
  Ecirc: "Ê",
  euml: "ë",
  Euml: "Ë",
  aacute: "á",
  Aacute: "Á",
  agrave: "à",
  Agrave: "À",
  acirc: "â",
  Acirc: "Â",
  auml: "ä",
  Auml: "Ä",
  iacute: "í",
  Iacute: "Í",
  igrave: "ì",
  Igrave: "Ì",
  icirc: "î",
  Icirc: "Î",
  iuml: "ï",
  Iuml: "Ï",
  oacute: "ó",
  Oacute: "Ó",
  ograve: "ò",
  Ograve: "Ò",
  ocirc: "ô",
  Ocirc: "Ô",
  ouml: "ö",
  Ouml: "Ö",
  uacute: "ú",
  Uacute: "Ú",
  ugrave: "ù",
  Ugrave: "Ù",
  ucirc: "û",
  Ucirc: "Û",
  uuml: "ü",
  Uuml: "Ü",
  ntilde: "ñ",
  Ntilde: "Ñ",
  ccedil: "ç",
  Ccedil: "Ç",
};

/**
 * Fully decodes all common HTML and XML numeric / named entities.
 */
export const decodeHtmlEntities = (raw?: string | null): string => {
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
    .replace(/&([a-zA-Z0-9]+);/g, (match, entity) => {
      return HTML_ENTITIES_MAP[entity] ?? match;
    });
};

/**
 * Strips any remaining unhandled or stray HTML tags so they never leak as raw markup in React Native Text.
 */
function stripStrayTags(text: string): string {
  return text.replace(/<[^>]+>/g, "");
}

const TAG_PATTERNS: TagPattern[] = [
  // Combined Bold + Italic
  {
    name: "bold_italic",
    regex: /\*\*\*([\s\S]+?)\*\*\*/,
    flag: "bold",
    bothFlags: ["bold", "italic"],
  },
  // Bold (Markdown asterisks, HTML <b> or <strong> with arbitrary attributes like font size/style, or styled spans)
  {
    name: "bold_asterisks",
    regex: /\*\*([\s\S]+?)\*\*/,
    flag: "bold",
  },
  {
    name: "bold_html",
    regex: /<b(?:\s+[^>]*)?>([\s\S]+?)<\/b>/i,
    flag: "bold",
  },
  {
    name: "bold_strong",
    regex: /<strong(?:\s+[^>]*)?>([\s\S]+?)<\/strong>/i,
    flag: "bold",
  },
  {
    name: "bold_span",
    regex: /<span[^>]*style="[^"]*font-weight:\s*(?:bold|[789]00)[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    flag: "bold",
  },
  // Underline (HTML <u>, <ins>, Markdown __, or styled spans)
  {
    name: "underline_html",
    regex: /<u(?:\s+[^>]*)?>([\s\S]+?)<\/u>/i,
    flag: "underline",
  },
  {
    name: "underline_ins",
    regex: /<ins(?:\s+[^>]*)?>([\s\S]+?)<\/ins>/i,
    flag: "underline",
  },
  {
    name: "underline_double",
    regex: /__([\s\S]+?)__/,
    flag: "underline",
  },
  {
    name: "underline_span",
    regex: /<span[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    flag: "underline",
  },
  // Italic (Markdown *, HTML <i>, <em>, Markdown _, or styled spans)
  {
    name: "italic_asterisk",
    regex: /\*([\s\S]+?)\*/,
    flag: "italic",
  },
  {
    name: "italic_html",
    regex: /<i(?:\s+[^>]*)?>([\s\S]+?)<\/i>/i,
    flag: "italic",
  },
  {
    name: "italic_em",
    regex: /<em(?:\s+[^>]*)?>([\s\S]+?)<\/em>/i,
    flag: "italic",
  },
  {
    name: "italic_underscore",
    regex: /_([\s\S]+?)_/,
    flag: "italic",
  },
  {
    name: "italic_span",
    regex: /<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    flag: "italic",
  },
];

/**
 * Recursively parses inline rich text tokens (bold, italic, underline).
 */
function parseInlineFormatting(
  raw: string,
  flags: { bold?: boolean; italic?: boolean; underline?: boolean } = {}
): InlineToken[] {
  if (!raw) return [];

  // Find the earliest matching pattern in raw
  let earliestMatch: {
    pattern: TagPattern;
    match: RegExpExecArray;
    index: number;
  } | null = null;

  for (const pattern of TAG_PATTERNS) {
    const res = pattern.regex.exec(raw);
    if (res && res.index !== undefined) {
      if (!earliestMatch || res.index < earliestMatch.index) {
        earliestMatch = { pattern, match: res, index: res.index };
      }
    }
  }

  // If no tags matched, return the text with any stray unclosed tags stripped and all HTML entities decoded
  if (!earliestMatch) {
    const cleanedText = decodeHtmlEntities(stripStrayTags(raw));
    return [{ text: cleanedText, ...flags }];
  }

  const { pattern, match, index } = earliestMatch;
  const fullMatchText = match[0];
  const innerContent = match[1];

  const beforeText = raw.substring(0, index);
  const afterText = raw.substring(index + fullMatchText.length);

  const tokens: InlineToken[] = [];

  // Add text before match
  if (beforeText.length > 0) {
    tokens.push(...parseInlineFormatting(beforeText, flags));
  }

  // Update flags for inner content
  const updatedFlags = { ...flags };
  if (pattern.bothFlags) {
    pattern.bothFlags.forEach((f) => {
      updatedFlags[f] = true;
    });
  } else {
    updatedFlags[pattern.flag] = true;
  }

  // Recurse inside the tag
  tokens.push(...parseInlineFormatting(innerContent, updatedFlags));

  // Recurse after the match
  if (afterText.length > 0) {
    tokens.push(...parseInlineFormatting(afterText, flags));
  }

  return tokens;
}

/**
 * Rich Text Component for Notice Announcement Bodies
 *
 * Supports:
 * - Bold (**text** or <b>text</b>)
 * - Italic (*text* or <i>text</i>)
 * - Underline (<u>text</u> or __text__)
 * - Bullet lists (• list, - list, * list)
 * - Numbered lists (1. list, 2) list)
 * - Justified text ([justify]text[/justify])
 */
export const RichNoticeText = React.memo(function RichNoticeText({
  content,
  defaultJustified = false,
  style,
  containerStyle,
}: RichNoticeTextProps) {
  const elements = useMemo(() => {
    if (!content) return null;

    // Normalize escaped line breaks and HTML block tags
    const normalized = content
      .replace(/\\r\\n|\\n|\\r/g, "\n")
      .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "\n\n<b>$1</b>\n\n")
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n• $1\n")
      .replace(/<\/?ul[^>]*>/gi, "\n")
      .replace(/<\/?ol[^>]*>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(
        /<(?:p|div)[^>]*(?:align=["']justify["']|style=["'][^"']*text-align:\s*justify[^"']*["'])[^>]*>([\s\S]*?)<\/(?:p|div)>/gi,
        "\n\n[justify]$1[/justify]\n\n"
      )
      .replace(/<\/(?:p|div)>/gi, "\n\n")
      .replace(/<(?:p|div)[^>]*>/gi, "\n");

    // Split into paragraphs by blank lines or preserve single newlines
    const rawParagraphs = normalized.split(/\n\s*\n/);

    return rawParagraphs.map((para, pIdx) => {
      const trimmedPara = para.trim();
      if (!trimmedPara) return null;

      // Check if paragraph contains [justify] ... [/justify]
      const hasJustifyTag =
        trimmedPara.includes("[justify]") || trimmedPara.includes("[/justify]");
      const isJustified =
        defaultJustified || hasJustifyTag || trimmedPara.startsWith("[justify]");

      // Clean justify tags, unstyled wrappers, and stray formatting artifacts
      const cleanPara = trimmedPara
        .replace(/\[\/?justify\]/gi, "")
        .replace(/\[•\s*\/justify\]/gi, "• ")
        .replace(/\*{4,}/g, "**")
        .replace(/_{4,}/g, "__")
        .replace(/<\/?font[^>]*>/gi, "")
        .replace(/<span(?![^>]*style="[^"]*(?:font-weight|font-style|text-decoration))[^>]*>/gi, "")
        .replace(/<\/span>/gi, "")
        .trim();

      // Check if this paragraph contains bullet or numbered list lines
      const lines = cleanPara.split("\n");
      const hasListLines = lines.some((l) =>
        /^\s*(?:[•\-*]|\d+[\.\)])\s+/.test(l)
      );

      if (hasListLines) {
        return (
          <View key={pIdx} style={styles.paragraphContainer}>
            {lines.map((line, lIdx) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;

              // Bullet list item
              const bulletMatch = /^\s*[•\-*]\s+(.*)$/.exec(trimmedLine);
              if (bulletMatch) {
                const itemContent = bulletMatch[1];
                const tokens = parseInlineFormatting(itemContent);
                return (
                  <View key={lIdx} style={styles.listRow}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text
                      style={[
                        styles.listText,
                        style,
                        isJustified && styles.justified,
                      ]}
                    >
                      {tokens.map((token, tIdx) => (
                        <Text
                          key={tIdx}
                          style={[
                            token.bold && styles.bold,
                            token.italic && styles.italic,
                            token.underline && styles.underline,
                          ]}
                        >
                          {token.text}
                        </Text>
                      ))}
                    </Text>
                  </View>
                );
              }

              // Numbered list item
              const numMatch = /^\s*(\d+)[\.\)]\s+(.*)$/.exec(trimmedLine);
              if (numMatch) {
                const num = numMatch[1];
                const itemContent = numMatch[2];
                const tokens = parseInlineFormatting(itemContent);
                return (
                  <View key={lIdx} style={styles.listRow}>
                    <Text style={styles.listNumber}>{num}.</Text>
                    <Text
                      style={[
                        styles.listText,
                        style,
                        isJustified && styles.justified,
                      ]}
                    >
                      {tokens.map((token, tIdx) => (
                        <Text
                          key={tIdx}
                          style={[
                            token.bold && styles.bold,
                            token.italic && styles.italic,
                            token.underline && styles.underline,
                          ]}
                        >
                          {token.text}
                        </Text>
                      ))}
                    </Text>
                  </View>
                );
              }

              // Regular line within this paragraph block
              const tokens = parseInlineFormatting(trimmedLine);
              return (
                <Text
                  key={lIdx}
                  style={[
                    styles.bodyParagraph,
                    style,
                    isJustified && styles.justified,
                  ]}
                >
                  {tokens.map((token, tIdx) => (
                    <Text
                      key={tIdx}
                      style={[
                        token.bold && styles.bold,
                        token.italic && styles.italic,
                        token.underline && styles.underline,
                      ]}
                    >
                      {token.text}
                    </Text>
                  ))}
                </Text>
              );
            })}
          </View>
        );
      }

      // Normal paragraph
      const tokens = parseInlineFormatting(cleanPara);

      return (
        <Text
          key={pIdx}
          style={[
            styles.bodyParagraph,
            style,
            isJustified && styles.justified,
          ]}
        >
          {tokens.map((token, tIdx) => (
            <Text
              key={tIdx}
              style={[
                token.bold && styles.bold,
                token.italic && styles.italic,
                token.underline && styles.underline,
              ]}
            >
              {token.text}
            </Text>
          ))}
        </Text>
      );
    });
  }, [content, defaultJustified, style]);

  return <View style={containerStyle}>{elements}</View>;
});

const styles = StyleSheet.create({
  paragraphContainer: {
    marginBottom: 14,
  },
  bodyParagraph: {
    fontFamily,
    fontSize: 15.5,
    color: NOTICE_COLORS.bodyText,
    lineHeight: 26,
    marginBottom: 14,
    letterSpacing: 0.1,
  },
  justified: {
    textAlign: "justify",
  },
  bold: {
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecorationLine: "underline",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 4,
  },
  listBullet: {
    fontSize: 18,
    color: NOTICE_COLORS.deepNavy,
    marginRight: 10,
    lineHeight: 24,
    fontWeight: "800",
  },
  listNumber: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    marginRight: 8,
    lineHeight: 25,
  },
  listText: {
    flex: 1,
    fontFamily,
    fontSize: 15.5,
    color: NOTICE_COLORS.bodyText,
    lineHeight: 25,
    letterSpacing: 0.1,
  },
});
