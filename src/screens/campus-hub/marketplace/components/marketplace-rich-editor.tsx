// src/screens/campus-hub/marketplace/components/marketplace-rich-editor.tsx
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

export interface MarketplaceRichEditorProps {
  value?: string;
  onChangeText: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
  onLengthChange?: (length: number) => void;
}

interface FormatStatus {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  list: boolean;
}

const isWeb = Platform.OS === "web";

const TEMPLATE_HTML = `<p><b>Item Overview</b></p><ul><li><b>Condition:</b> Gently used / tested working</li><li><b>Accessories:</b> Original packaging & accessories included</li></ul><p><b>Handover</b></p><ul><li>SMUCT Main Campus / Library</li><li>Available: Weekdays 10 AM - 4 PM</li></ul>`;

const WEB_STYLES = `
.marketplace-web-editor:empty:before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  display: block;
}
.marketplace-web-editor p {
  margin: 0 0 8px 0;
}
.marketplace-web-editor b, .marketplace-web-editor strong {
  font-weight: bold;
}
.marketplace-web-editor i, .marketplace-web-editor em {
  font-style: italic;
}
.marketplace-web-editor u {
  text-decoration: underline;
}
.marketplace-web-editor ul {
  margin: 6px 0;
  padding-left: 22px;
}
.marketplace-web-editor li {
  margin-bottom: 4px;
}
`;

function getEditorHtml(initialContent: string = "", placeholderText: string = ""): string {
  const safeContent = JSON.stringify(initialContent || "").replace(/<\/script/gi, "<\\/script");
  const safePlaceholder = JSON.stringify(placeholderText || "Describe condition, edition, accessories, campus meetup spot...").replace(/<\/script/gi, "<\\/script");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #131b2e;
    }
    #editor {
      width: 100%;
      min-height: 100%;
      padding: 12px 14px;
      outline: none;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      -webkit-user-select: text;
      user-select: text;
    }
    #editor:empty:before {
      content: attr(data-placeholder);
      color: #94a3b8;
      pointer-events: none;
      display: block;
    }
    b, strong {
      font-weight: bold;
    }
    i, em {
      font-style: italic;
    }
    u {
      text-decoration: underline;
    }
    ul {
      margin: 6px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 3px;
      color: #131b2e;
    }
    p {
      margin: 0 0 8px 0;
      min-height: 1.2em;
    }
  </style>
</head>
<body>
  <div id="editor" contenteditable="true" spellcheck="true" autocomplete="off" autocapitalize="sentences"></div>

  <script>
    var INITIAL_CONTENT = ${safeContent};
    var INITIAL_PLACEHOLDER = ${safePlaceholder};
    var editor = document.getElementById('editor');
    var savedRange = null;
    var isBusy = false;

    if (INITIAL_CONTENT) {
      editor.innerHTML = INITIAL_CONTENT;
    }
    if (INITIAL_PLACEHOLDER) {
      editor.setAttribute('data-placeholder', INITIAL_PLACEHOLDER);
    }

    document.body.addEventListener('click', function(e) {
      if (e.target !== editor && !editor.contains(e.target)) {
        editor.focus();
      }
    });

    function isEditorNode(node) {
      if (!node) return false;
      return node === editor || editor.contains(node);
    }

    function saveCurrentSelection() {
      if (isBusy) return;
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var anchor = sel.anchorNode;
      if (anchor && isEditorNode(anchor)) {
        try {
          savedRange = sel.getRangeAt(0).cloneRange();
        } catch (e) {}
      }
    }

    function restoreSavedSelection() {
      var sel = window.getSelection();
      if (savedRange && sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        } catch (e) {}
      }
    }

    function getActiveRange() {
      var sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        var r = sel.getRangeAt(0);
        if (r.commonAncestorContainer && isEditorNode(r.commonAncestorContainer)) {
          return r;
        }
      }
      if (savedRange && savedRange.commonAncestorContainer && isEditorNode(savedRange.commonAncestorContainer)) {
        return savedRange;
      }
      return null;
    }

    function post(type, data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        var payload = Object.assign({ type: type }, data || {});
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    window.setEditorContent = function(html) {
      if (editor.innerHTML !== (html || '')) {
        editor.innerHTML = html || '';
        checkFormatStatus();
      }
    };

    window.setPlaceholder = function(ph) {
      if (ph) {
        editor.setAttribute('data-placeholder', ph);
      }
    };

    function isNodeBold(node) {
      var curr = node && node.nodeType === 3 ? node.parentElement : node;
      while (curr && curr !== editor && curr !== document.body) {
        var tag = (curr.tagName || '').toUpperCase();
        if (tag === 'B' || tag === 'STRONG') return true;
        if (curr.style && (curr.style.fontWeight === 'bold' || parseInt(curr.style.fontWeight, 10) >= 700)) {
          return true;
        }
        curr = curr.parentElement;
      }
      return false;
    }

    function isNodeItalic(node) {
      var curr = node && node.nodeType === 3 ? node.parentElement : node;
      while (curr && curr !== editor && curr !== document.body) {
        var tag = (curr.tagName || '').toUpperCase();
        if (tag === 'I' || tag === 'EM') return true;
        if (curr.style && curr.style.fontStyle === 'italic') return true;
        curr = curr.parentElement;
      }
      return false;
    }

    function isNodeUnderline(node) {
      var curr = node && node.nodeType === 3 ? node.parentElement : node;
      while (curr && curr !== editor && curr !== document.body) {
        var tag = (curr.tagName || '').toUpperCase();
        if (tag === 'U' || tag === 'INS') return true;
        if (curr.style && curr.style.textDecoration && curr.style.textDecoration.indexOf('underline') !== -1) {
          return true;
        }
        curr = curr.parentElement;
      }
      return false;
    }

    function isNodeList(node) {
      var curr = node && node.nodeType === 3 ? node.parentElement : node;
      while (curr && curr !== editor && curr !== document.body) {
        var tag = (curr.tagName || '').toUpperCase();
        if (tag === 'LI' || tag === 'UL' || tag === 'OL') return true;
        curr = curr.parentElement;
      }
      return false;
    }

    function findEnclosingTag(node, tagNames) {
      var curr = node && node.nodeType === 3 ? node.parentElement : node;
      while (curr && curr !== editor && curr !== document.body) {
        var tag = (curr.tagName || '').toUpperCase();
        for (var i = 0; i < tagNames.length; i++) {
          if (tag === tagNames[i]) return curr;
        }
        curr = curr.parentElement;
      }
      return null;
    }

    var FORMAT_MAP = {
      bold: { tags: ['B', 'STRONG'], tag: 'b', check: isNodeBold },
      italic: { tags: ['I', 'EM'], tag: 'i', check: isNodeItalic },
      underline: { tags: ['U', 'INS'], tag: 'u', check: isNodeUnderline }
    };

    function toggleInline(cmd) {
      var config = FORMAT_MAP[cmd];
      if (!config) return;

      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        var r = document.createRange();
        r.selectNodeContents(editor);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
        savedRange = r.cloneRange();
      }

      var range = sel.getRangeAt(0);

      if (range.collapsed) {
        var enclosing = findEnclosingTag(range.startContainer, config.tags);
        if (enclosing) {
          var text = (enclosing.textContent || '').replace(/\\u200B/g, '');
          if (text.length === 0) {
            var parent = enclosing.parentNode;
            var newR = document.createRange();
            newR.setStartBefore(enclosing);
            newR.collapse(true);
            if (parent) parent.removeChild(enclosing);
            sel.removeAllRanges();
            sel.addRange(newR);
            savedRange = newR.cloneRange();
          } else {
            var newR = document.createRange();
            newR.setStartAfter(enclosing);
            newR.collapse(true);
            var zw = document.createTextNode('\\u200B');
            newR.insertNode(zw);
            newR.setStartAfter(zw);
            newR.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newR);
            savedRange = newR.cloneRange();
          }
        } else {
          var el = document.createElement(config.tag);
          var zw = document.createTextNode('\\u200B');
          el.appendChild(zw);
          range.insertNode(el);
          var newR = document.createRange();
          newR.setStart(zw, 1);
          newR.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newR);
          savedRange = newR.cloneRange();
        }
      } else {
        var isCurrentlyFormatted = config.check(range.commonAncestorContainer);
        document.execCommand(cmd, false, null);

        var stillFormatted = config.check(window.getSelection()?.getRangeAt(0)?.commonAncestorContainer);
        if (isCurrentlyFormatted && stillFormatted) {
          var enclosing = findEnclosingTag(window.getSelection()?.getRangeAt(0)?.commonAncestorContainer, config.tags);
          if (enclosing && enclosing.parentNode) {
            var parent = enclosing.parentNode;
            while (enclosing.firstChild) {
              parent.insertBefore(enclosing.firstChild, enclosing);
            }
            parent.removeChild(enclosing);
          }
        }
        saveCurrentSelection();
      }
    }

    window.execFormat = function(cmd, val) {
      isBusy = true;
      try {
        editor.focus();
        restoreSavedSelection();

        if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline') {
          toggleInline(cmd);
        } else if (cmd === 'insertUnorderedList') {
          document.execCommand('insertUnorderedList', false, null);
          saveCurrentSelection();
        } else if (cmd === 'insertHTML') {
          document.execCommand('insertHTML', false, val || '');
          saveCurrentSelection();
        }
      } finally {
        isBusy = false;
      }

      notifyChange();
      checkFormatStatus();
    };

    function notifyChange() {
      var html = editor.innerHTML || '';
      var text = (editor.innerText || editor.textContent || '').replace(/\\u200B/g, '');
      post('change', {
        html: html.replace(/\\u200B/g, ''),
        text: text
      });
    }

    function checkFormatStatus() {
      var range = getActiveRange();
      var bold = false;
      var italic = false;
      var underline = false;
      var list = false;

      if (range && range.commonAncestorContainer && isEditorNode(range.commonAncestorContainer)) {
        var target = range.commonAncestorContainer;
        bold = isNodeBold(target);
        italic = isNodeItalic(target);
        underline = isNodeUnderline(target);
        list = isNodeList(target);
      }

      post('formatStatus', {
        bold: bold,
        italic: italic,
        underline: underline,
        list: list
      });
    }

    editor.addEventListener('input', function() {
      notifyChange();
      checkFormatStatus();
    });

    document.addEventListener('selectionchange', function() {
      if (!isBusy) {
        saveCurrentSelection();
        checkFormatStatus();
      }
    });

    editor.addEventListener('mouseup', function() {
      saveCurrentSelection();
      checkFormatStatus();
    });

    editor.addEventListener('touchend', function() {
      saveCurrentSelection();
      checkFormatStatus();
    });

    editor.addEventListener('keyup', function() {
      saveCurrentSelection();
      checkFormatStatus();
    });

    function initBridge() {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        post('ready');
      } else {
        setTimeout(initBridge, 50);
      }
    }

    if (document.readyState === 'complete') {
      initBridge();
    } else {
      window.addEventListener('load', initBridge);
    }
  </script>
</body>
</html>
  `;
}

// ---------------------------------------------------------------------------
// Native Rich-Text Viewer for Listing Details
// ---------------------------------------------------------------------------
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
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return !isNaN(code) ? String.fromCharCode(code) : _;
    })
    .replace(/&([a-zA-Z0-9]+);/g, (match, entity) => HTML_ENTITIES[entity] ?? match);
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
  // Combined Bold + Italic
  { regex: /\*\*\*([\s\S]+?)\*\*\*/, bold: true, italic: true },

  // Bold
  { regex: /\*\*([\s\S]+?)\*\*/, bold: true },
  { regex: /<b(?:\s+[^>]*)?>([\s\S]+?)<\/b>/i, bold: true },
  { regex: /<strong(?:\s+[^>]*)?>([\s\S]+?)<\/strong>/i, bold: true },
  {
    regex: /<span[^>]*style="[^"]*font-weight:\s*(?:bold|[789]00)[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    bold: true,
  },

  // Underline
  { regex: /__([\s\S]+?)__/, underline: true },
  { regex: /<u(?:\s+[^>]*)?>([\s\S]+?)<\/u>/i, underline: true },
  { regex: /<ins(?:\s+[^>]*)?>([\s\S]+?)<\/ins>/i, underline: true },
  {
    regex: /<span[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    underline: true,
  },

  // Italic
  { regex: /\*([\s\S]+?)\*/, italic: true },
  { regex: /_([\s\S]+?)_/, italic: true },
  { regex: /<i(?:\s+[^>]*)?>([\s\S]+?)<\/i>/i, italic: true },
  { regex: /<em(?:\s+[^>]*)?>([\s\S]+?)<\/em>/i, italic: true },
  {
    regex: /<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>([\s\S]+?)<\/span>/i,
    italic: true,
  },

  // Generic span wrapper
  { regex: /<span(?:\s+[^>]*)?>([\s\S]+?)<\/span>/i },

  // Generic font/div wrapper
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
        const cleanedBefore = stripRemainingHtml(decodeHtml(before));
        if (cleanedBefore) tokens.push({ text: cleanedBefore, ...flags });
      }

      const newFlags = {
        bold: flags.bold || !!tag.bold,
        italic: flags.italic || !!tag.italic,
        underline: flags.underline || !!tag.underline,
      };

      tokens.push(...parseTokens(inner, newFlags));
      if (after) tokens.push(...parseTokens(after, flags));
      return tokens;
    }
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

  const lines = preprocessed.split("\n");
  const blocks: RichBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== "spacer") {
        blocks.push({ type: "spacer" });
      }
      continue;
    }

    // HTML Heading marker
    if (trimmed.startsWith("###HEADING:") && trimmed.endsWith("###")) {
      const content = trimmed.slice("###HEADING:".length, -3).trim();
      const cleaned = stripRemainingHtml(decodeHtml(content)).trim();
      if (cleaned) blocks.push({ type: "heading", content: cleaned });
      continue;
    }

    // Markdown Heading: ### Heading or ## Heading or # Heading
    const mdHeading = trimmed.match(/^(?:###|##|#)\s+(.*)$/);
    if (mdHeading) {
      const cleaned = stripRemainingHtml(decodeHtml(mdHeading[1])).trim();
      if (cleaned) blocks.push({ type: "heading", content: cleaned });
      continue;
    }

    // HTML Bullet marker
    if (trimmed.startsWith("###BULLET:") && trimmed.endsWith("###")) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type === "spacer") {
        if (blocks.length > 1 && blocks[blocks.length - 2].type === "bullet") {
          blocks.pop();
        }
      }
      const content = trimmed.slice("###BULLET:".length, -3).trim();
      const tokens = parseTokens(content);
      if (tokens.length) blocks.push({ type: "bullet", tokens });
      continue;
    }

    // Markdown or unicode bullet: •, -, *, 1.
    if (
      trimmed.startsWith("• ") ||
      trimmed.startsWith("- ") ||
      (trimmed.startsWith("* ") && !trimmed.endsWith("*")) ||
      /^\d+\.\s+/.test(trimmed)
    ) {
      if (blocks.length > 0 && blocks[blocks.length - 1].type === "spacer") {
        if (blocks.length > 1 && blocks[blocks.length - 2].type === "bullet") {
          blocks.pop();
        }
      }
      const content = trimmed.replace(/^([•\-*]|\d+\.)\s+/, "");
      const tokens = parseTokens(content);
      if (tokens.length) blocks.push({ type: "bullet", tokens });
      continue;
    }

    // Regular paragraph
    const tokens = parseTokens(trimmed);
    if (tokens.length) {
      blocks.push({ type: "paragraph", tokens });
    }
  }

  // Remove trailing spacer
  if (blocks.length > 0 && blocks[blocks.length - 1].type === "spacer") {
    blocks.pop();
  }

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
      {blocks.map((block, idx) => {
        if (block.type === "spacer") {
          return <View key={idx} style={styles.lineSpacer} />;
        }

        if (block.type === "heading") {
          return (
            <View key={idx} style={styles.headingBlock}>
              <View style={styles.headingAccentBar} />
              <Text style={styles.previewH2}>{block.content}</Text>
            </View>
          );
        }

        if (block.type === "bullet") {
          return (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={[styles.previewBody, Boolean(textColor) && { color: textColor }]}>
                {block.tokens.map((t, tIdx) => (
                  <Text
                    key={tIdx}
                    style={[
                      t.bold && styles.previewBold,
                      t.italic && styles.previewItalic,
                      t.underline && styles.previewUnderline,
                    ]}
                  >
                    {t.text}
                  </Text>
                ))}
              </Text>
            </View>
          );
        }

        // Paragraph
        return (
          <Text key={idx} style={[styles.previewBody, Boolean(textColor) && { color: textColor }]}>
            {block.tokens.map((t, tIdx) => (
              <Text
                key={tIdx}
                style={[
                  t.bold && styles.previewBold,
                  t.italic && styles.previewItalic,
                  t.underline && styles.previewUnderline,
                ]}
              >
                {t.text}
              </Text>
            ))}
          </Text>
        );
      })}
    </View>
  );
}

const getPlainTextLength = (html: string) =>
  (html || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\u200B/g, "").trim().length;

// ── Web Platform Helpers ──
function isNodeBoldWeb(node: any, root: any): boolean {
  let curr = node && node.nodeType === 3 ? node.parentElement : node;
  while (curr && curr !== root && curr !== document.body) {
    const tag = (curr.tagName || "").toUpperCase();
    if (tag === "B" || tag === "STRONG") return true;
    if (curr.style && (curr.style.fontWeight === "bold" || parseInt(curr.style.fontWeight, 10) >= 700)) {
      return true;
    }
    curr = curr.parentElement;
  }
  return false;
}

function isNodeItalicWeb(node: any, root: any): boolean {
  let curr = node && node.nodeType === 3 ? node.parentElement : node;
  while (curr && curr !== root && curr !== document.body) {
    const tag = (curr.tagName || "").toUpperCase();
    if (tag === "I" || tag === "EM") return true;
    if (curr.style && curr.style.fontStyle === "italic") return true;
    curr = curr.parentElement;
  }
  return false;
}

function isNodeUnderlineWeb(node: any, root: any): boolean {
  let curr = node && node.nodeType === 3 ? node.parentElement : node;
  while (curr && curr !== root && curr !== document.body) {
    const tag = (curr.tagName || "").toUpperCase();
    if (tag === "U" || tag === "INS") return true;
    if (curr.style && curr.style.textDecoration && curr.style.textDecoration.indexOf("underline") !== -1) {
      return true;
    }
    curr = curr.parentElement;
  }
  return false;
}

function isNodeListWeb(node: any, root: any): boolean {
  let curr = node && node.nodeType === 3 ? node.parentElement : node;
  while (curr && curr !== root && curr !== document.body) {
    const tag = (curr.tagName || "").toUpperCase();
    if (tag === "LI" || tag === "UL" || tag === "OL") return true;
    curr = curr.parentElement;
  }
  return false;
}

function findEnclosingTagWeb(node: any, root: any, tagNames: string[]): any {
  let curr = node && node.nodeType === 3 ? node.parentElement : node;
  while (curr && curr !== root && curr !== document.body) {
    const tag = (curr.tagName || "").toUpperCase();
    for (const t of tagNames) {
      if (tag === t) return curr;
    }
    curr = curr.parentElement;
  }
  return null;
}

const WEB_FORMAT_MAP: Record<string, { tags: string[]; tag: string; check: (n: any, r: any) => boolean }> = {
  bold: { tags: ["B", "STRONG"], tag: "b", check: isNodeBoldWeb },
  italic: { tags: ["I", "EM"], tag: "i", check: isNodeItalicWeb },
  underline: { tags: ["U", "INS"], tag: "u", check: isNodeUnderlineWeb },
};

function toggleInlineWeb(editor: any, cmd: string) {
  if (typeof window === "undefined" || !editor) return;
  const config = WEB_FORMAT_MAP[cmd];
  if (!config) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  if (range.collapsed) {
    const enclosing = findEnclosingTagWeb(range.startContainer, editor, config.tags);
    if (enclosing) {
      const text = (enclosing.textContent || "").replace(/\u200B/g, "");
      if (text.length === 0) {
        const parent = enclosing.parentNode;
        const newR = document.createRange();
        newR.setStartBefore(enclosing);
        newR.collapse(true);
        if (parent) parent.removeChild(enclosing);
        sel.removeAllRanges();
        sel.addRange(newR);
      } else {
        const newR = document.createRange();
        newR.setStartAfter(enclosing);
        newR.collapse(true);
        const zw = document.createTextNode("\u200B");
        newR.insertNode(zw);
        newR.setStartAfter(zw);
        newR.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newR);
      }
    } else {
      const el = document.createElement(config.tag);
      const zw = document.createTextNode("\u200B");
      el.appendChild(zw);
      range.insertNode(el);
      const newR = document.createRange();
      newR.setStart(zw, 1);
      newR.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newR);
    }
  } else {
    const isCurrentlyFormatted = config.check(range.commonAncestorContainer, editor);
    document.execCommand(cmd, false, undefined);
    const stillFormatted = config.check(window.getSelection()?.getRangeAt(0)?.commonAncestorContainer, editor);
    if (isCurrentlyFormatted && stillFormatted) {
      const enclosing = findEnclosingTagWeb(window.getSelection()?.getRangeAt(0)?.commonAncestorContainer, editor, config.tags);
      if (enclosing && enclosing.parentNode) {
        const parent = enclosing.parentNode;
        while (enclosing.firstChild) {
          parent.insertBefore(enclosing.firstChild, enclosing);
        }
        parent.removeChild(enclosing);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// WYSIWYG Formatter Component (Instant Live Formatting with Connected Toolbar)
// ---------------------------------------------------------------------------
export const MarketplaceRichEditor = React.memo(function MarketplaceRichEditor({
  value = "",
  onChangeText,
  placeholder = "Describe condition, edition, accessories, campus meetup spot...",
  maxLength: _maxLength = 3000,
  minHeight = 135,
  onLengthChange,
}: MarketplaceRichEditorProps) {
  const webViewRef = useRef<WebView>(null);
  const webEditorRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  const isTypingRef = useRef(false);
  const currentHtmlRef = useRef("");

  // Initial HTML with initial value embedded directly so it renders immediately on mount
  const webViewSource = useMemo(
    () => ({ html: getEditorHtml(value, placeholder) }),
    []
  );

  const updateLength = useCallback(
    (len: number) => {
      onLengthChange?.(len);
    },
    [onLengthChange]
  );

  const [formatStatus, setFormatStatus] = useState<FormatStatus>({
    bold: false,
    italic: false,
    underline: false,
    list: false,
  });

  useEffect(() => {
    if (isWeb && typeof document !== "undefined") {
      const styleId = "marketplace-web-editor-styles";
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = WEB_STYLES;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "ready") {
          isReadyRef.current = true;
          const contentToInject = currentHtmlRef.current || value || "";
          currentHtmlRef.current = contentToInject;
          const escapedPlaceholder = JSON.stringify(placeholder);
          const escapedContent = JSON.stringify(contentToInject);
          webViewRef.current?.injectJavaScript(`
            if (window.setPlaceholder) window.setPlaceholder(${escapedPlaceholder});
            if (window.setEditorContent) window.setEditorContent(${escapedContent});
            true;
          `);
        } else if (data.type === "change") {
          isTypingRef.current = true;
          currentHtmlRef.current = data.html || "";
          const len = (data.text || "").trim().length;
          updateLength(len);
          onChangeText(data.html || "");
        } else if (data.type === "formatStatus") {
          setFormatStatus({
            bold: !!data.bold,
            italic: !!data.italic,
            underline: !!data.underline,
            list: !!data.list,
          });
        }
      } catch {}
    },
    [placeholder, value, onChangeText, updateLength]
  );

  // Sync external changes
  useEffect(() => {
    if (isWeb) {
      if (!webEditorRef.current) return;

      if (!value) {
        if (webEditorRef.current.innerHTML !== "") {
          webEditorRef.current.innerHTML = "";
          currentHtmlRef.current = "";
          updateLength(0);
        }
        return;
      }

      if (typeof document !== "undefined" && document.activeElement === webEditorRef.current) {
        currentHtmlRef.current = value;
        return;
      }

      if (webEditorRef.current.innerHTML !== value) {
        currentHtmlRef.current = value;
        webEditorRef.current.innerHTML = value;
        updateLength(getPlainTextLength(value));
      }
      return;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }

    if (value !== currentHtmlRef.current) {
      currentHtmlRef.current = value || "";
      updateLength(getPlainTextLength(value));
      if (isReadyRef.current) {
        const escaped = JSON.stringify(value || "");
        webViewRef.current?.injectJavaScript(`
          if (!${escaped} || document.activeElement !== document.getElementById('editor')) {
            if (window.setEditorContent) {
              window.setEditorContent(${escaped});
            }
          }
          true;
        `);
      }
    }
  }, [value, updateLength]);

  const checkWebFormatStatus = useCallback(() => {
    if (typeof document === "undefined" || !webEditorRef.current) return;
    const editor = webEditorRef.current;
    const sel = window.getSelection();
    let bold = false;
    let italic = false;
    let underline = false;
    let list = false;

    if (sel && sel.anchorNode && (sel.anchorNode === editor || editor.contains(sel.anchorNode))) {
      const target = sel.anchorNode;
      bold = isNodeBoldWeb(target, editor);
      italic = isNodeItalicWeb(target, editor);
      underline = isNodeUnderlineWeb(target, editor);
      list = isNodeListWeb(target, editor);
    }

    setFormatStatus({
      bold,
      italic,
      underline,
      list,
    });
  }, []);

  const executeCommand = useCallback(
    (command: string, arg?: string) => {
      if (isWeb) {
        if (typeof document === "undefined") return;
        const editor = webEditorRef.current;
        if (!editor) return;
        editor.focus();

        if (command === "bold" || command === "italic" || command === "underline") {
          toggleInlineWeb(editor, command);
        } else if (command === "insertHTML") {
          document.execCommand("insertHTML", false, arg || "");
        } else if (command === "insertUnorderedList") {
          document.execCommand("insertUnorderedList", false, undefined);
        }

        if (editor) {
          const html = (editor.innerHTML || "").replace(/\u200B/g, "");
          const text = (editor.innerText || editor.textContent || "").replace(/\u200B/g, "");
          currentHtmlRef.current = html;
          updateLength(text.trim().length);
          onChangeText(html);
        }
        checkWebFormatStatus();
        return;
      }

      const escapedCmd = JSON.stringify(command);
      const escapedArg = JSON.stringify(arg || "");
      webViewRef.current?.injectJavaScript(`
        if (window.execFormat) {
          window.execFormat(${escapedCmd}, ${escapedArg});
        }
        true;
      `);
    },
    [checkWebFormatStatus, onChangeText, updateLength]
  );

  const handleBold = useCallback(() => {
    executeCommand("bold");
  }, [executeCommand]);

  const handleItalic = useCallback(() => {
    executeCommand("italic");
  }, [executeCommand]);

  const handleUnderline = useCallback(() => {
    executeCommand("underline");
  }, [executeCommand]);

  const handleList = useCallback(() => {
    executeCommand("insertUnorderedList");
  }, [executeCommand]);

  const handleTemplate = useCallback(() => {
    executeCommand("insertHTML", TEMPLATE_HTML);
  }, [executeCommand]);

  return (
    <View style={styles.container}>
      {/* ── Editor Area (Top Box) ── */}
      <View style={[styles.editorWrap, { minHeight }]}>
        {isWeb ? (
          React.createElement("div", {
            ref: webEditorRef,
            contentEditable: true,
            className: "marketplace-web-editor",
            "data-placeholder": placeholder,
            style: {
              width: "100%",
              minHeight: minHeight - 10,
              padding: "12px 14px",
              fontSize: "14px",
              fontFamily: "system-ui, sans-serif",
              color: "#131b2e",
              backgroundColor: "#ffffff",
              outline: "none",
              overflowY: "auto",
              boxSizing: "border-box",
            },
            onInput: (e: any) => {
              const target = e.currentTarget;
              const html = (target.innerHTML || "").replace(/\u200B/g, "");
              const text = (target.innerText || target.textContent || "").replace(/\u200B/g, "");
              currentHtmlRef.current = html;
              updateLength(text.trim().length);
              onChangeText(html);
              checkWebFormatStatus();
            },
            onKeyUp: checkWebFormatStatus,
            onMouseUp: checkWebFormatStatus,
            onSelect: checkWebFormatStatus,
          })
        ) : (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={webViewSource}
            onMessage={handleMessage}
            onLoadEnd={() => {
              isReadyRef.current = true;
              if (value) {
                const escaped = JSON.stringify(value);
                webViewRef.current?.injectJavaScript(`
                  if (window.setEditorContent) {
                    window.setEditorContent(${escaped});
                  }
                  true;
                `);
              }
            }}
            style={styles.webView}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            keyboardDisplayRequiresUserAction={false}
            hideKeyboardAccessoryView={true}
            overScrollMode="never"
          />
        )}
      </View>

      {/* ── Connected Bottom Toolbar (Instant live formatting + Clear action) ── */}
      <View style={styles.toolbarContainer}>
        {/* Bold Button */}
        <TouchableOpacity
          style={[styles.toolBtn, formatStatus.bold && styles.toolBtnActive]}
          onPress={handleBold}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Bold format"
        >
          <Text style={[styles.toolBtnBoldText, formatStatus.bold && styles.toolBtnActiveText]}>
            B
          </Text>
        </TouchableOpacity>

        {/* Italic Button */}
        <TouchableOpacity
          style={[styles.toolBtn, formatStatus.italic && styles.toolBtnActive]}
          onPress={handleItalic}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Italic format"
        >
          <Text style={[styles.toolBtnItalicText, formatStatus.italic && styles.toolBtnActiveText]}>
            I
          </Text>
        </TouchableOpacity>

        {/* Underline Button */}
        <TouchableOpacity
          style={[styles.toolBtn, formatStatus.underline && styles.toolBtnActive]}
          onPress={handleUnderline}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Underline format"
        >
          <Text style={[styles.toolBtnUnderlineText, formatStatus.underline && styles.toolBtnActiveText]}>
            U
          </Text>
        </TouchableOpacity>

        <View style={styles.toolbarDivider} />

        {/* Bullet List Button */}
        <TouchableOpacity
          style={[styles.toolBtn, formatStatus.list && styles.toolBtnActive]}
          onPress={handleList}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Bullet list"
        >
          <Feather
            name="list"
            size={14}
            color={formatStatus.list ? "#ffffff" : CAMPUS_HUB_COLORS.deepNavy}
          />
          <Text style={[styles.toolBtnLabel, formatStatus.list && styles.toolBtnActiveText]}>
            List
          </Text>
        </TouchableOpacity>

        {/* Template Button */}
        <TouchableOpacity
          style={styles.toolBtnTemplate}
          onPress={handleTemplate}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Insert listing template"
        >
          <Feather
            name="layout"
            size={12}
            color={CAMPUS_HUB_COLORS.marketplaceAccentText}
          />
          <Text style={styles.toolBtnTemplateLabel}>Template</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  editorWrap: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderBottomWidth: 1,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  toolbarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderTopWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  toolBtnActive: {
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccent,
    borderColor: CAMPUS_HUB_COLORS.marketplaceAccent,
  },
  toolBtnActiveText: {
    color: "#ffffff",
  },
  toolBtnBoldText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "900",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  toolBtnItalicText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    fontStyle: "italic",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  toolBtnUnderlineText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  toolBtnLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginLeft: 4,
  },
  toolBtnTemplate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.marketplaceAccentLight,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  toolBtnTemplateLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.marketplaceAccentText,
    marginLeft: 4,
  },
  toolbarDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 2,
  },

  // Native Rich-Text Tokens
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
