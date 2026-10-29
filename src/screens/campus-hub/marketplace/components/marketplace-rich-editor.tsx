// src/screens/campus-hub/marketplace/components/marketplace-rich-editor.tsx
import React, { useRef, useState, useCallback, useEffect } from "react";
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
  heading: boolean;
  list: boolean;
}

const isWeb = Platform.OS === "web";

const TEMPLATE_HTML = `<h3>Item Overview</h3><ul><li><b>Condition:</b> Gently used / tested working</li><li><b>Accessories:</b> Original packaging & accessories included</li></ul><h3>Handover</h3><ul><li>SMUCT Main Campus / Library</li><li>Available: Weekdays 10 AM - 4 PM</li></ul>`;

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
.marketplace-web-editor ul {
  margin: 6px 0;
  padding-left: 22px;
}
.marketplace-web-editor li {
  margin-bottom: 4px;
}
.marketplace-web-editor h3 {
  margin: 10px 0 4px 0;
  font-size: 15px;
  font-weight: 800;
  color: #131b2e;
}
`;

const STATIC_EDITOR_HTML = `
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
      font-weight: 800;
      color: #0f172a;
    }
    i, em {
      font-style: italic;
    }
    u {
      text-decoration: underline;
    }
    h1, h2, h3 {
      margin: 8px 0 4px 0;
      font-weight: 800;
      color: #131b2e;
      line-height: 1.3;
    }
    h3 {
      font-size: 15px;
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
    }
  </style>
</head>
<body>
  <div id="editor" contenteditable="true" spellcheck="true" autocomplete="off" autocapitalize="sentences" data-placeholder="Describe condition, edition, accessories, campus meetup spot..."></div>

  <script>
    var editor = document.getElementById('editor');
    var savedSelectionRange = null;

    document.body.addEventListener('click', function(e) {
      if (e.target !== editor && !editor.contains(e.target)) {
        editor.focus();
      }
    });

    function saveCurrentSelection() {
      var sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedSelectionRange = sel.getRangeAt(0).cloneRange();
      }
    }

    function restoreSavedSelection() {
      var sel = window.getSelection();
      if (savedSelectionRange && sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRange);
        } catch (e) {}
      }
    }

    function post(type, data) {
      if (window.ReactNativeWebView) {
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

    window.execFormat = function(cmd, val) {
      editor.focus();
      restoreSavedSelection();
      if (cmd === 'heading') {
        var isH = false;
        var sel = window.getSelection();
        if (sel && sel.anchorNode) {
          var el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentNode : sel.anchorNode;
          while (el && el !== editor && el !== document.body) {
            if (/^H[1-6]$/i.test(el.tagName)) {
              isH = true;
              break;
            }
            el = el.parentElement;
          }
        }
        try {
          var targetTag = isH ? '<p>' : '<h3>';
          var ok = document.execCommand('formatBlock', false, targetTag);
          if (!ok) {
            document.execCommand('formatBlock', false, isH ? 'p' : 'h3');
          }
        } catch (e) {
          try {
            document.execCommand('formatBlock', false, isH ? 'p' : 'h3');
          } catch (e2) {}
        }
      } else if (cmd === 'insertHTML') {
        document.execCommand('insertHTML', false, val || '');
      } else {
        document.execCommand(cmd, false, val || null);
      }
      saveCurrentSelection();
      checkFormatStatus();
      notifyChange();
    };

    function notifyChange() {
      var html = editor.innerHTML || '';
      var text = editor.innerText || editor.textContent || '';
      post('change', { html: html, text: text });
    }

    function checkFormatStatus() {
      var isHeading = false;
      var sel = window.getSelection();
      if (sel && sel.anchorNode) {
        var el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentNode : sel.anchorNode;
        while (el && el !== editor && el !== document.body) {
          if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
            isHeading = true;
            break;
          }
          el = el.parentElement;
        }
      }

      post('formatStatus', {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        heading: isHeading,
        list: document.queryCommandState('insertUnorderedList')
      });
    }

    editor.addEventListener('input', function() {
      notifyChange();
      checkFormatStatus();
    });

    document.addEventListener('selectionchange', function() {
      saveCurrentSelection();
      checkFormatStatus();
    });

    window.onload = function() {
      post('ready');
    };
  </script>
</body>
</html>
`;

const STATIC_WEBVIEW_SOURCE = { html: STATIC_EDITOR_HTML };

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

  // Generic span wrapper (e.g. <span style="font-size: 14px;">...</span>) — unwrap inner content
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
  (html || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim().length;

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
  const currentHtmlRef = useRef(value);

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
    heading: false,
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
          const escapedPlaceholder = JSON.stringify(placeholder);
          const contentToInject = currentHtmlRef.current || value || "";
          currentHtmlRef.current = contentToInject;
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
            heading: !!data.heading,
            list: !!data.list,
          });
        }
      } catch {}
    },
    [placeholder, value, onChangeText, updateLength]
  );

  // Sync external changes (e.g. form reset)
  useEffect(() => {
    if (isWeb) {
      if (webEditorRef.current && value !== currentHtmlRef.current) {
        currentHtmlRef.current = value;
        webEditorRef.current.innerHTML = value || "";
        updateLength(getPlainTextLength(value));
      }
      return;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }
    if (value !== currentHtmlRef.current) {
      currentHtmlRef.current = value;
      updateLength(getPlainTextLength(value));
      if (isReadyRef.current) {
        const escaped = JSON.stringify(value);
        webViewRef.current?.injectJavaScript(`
          if (window.setEditorContent) {
            window.setEditorContent(${escaped});
          }
          true;
        `);
      }
    }
  }, [value, updateLength]);

  const executeCommand = useCallback(
    (command: string, arg?: string) => {
      if (isWeb) {
        if (typeof document === "undefined") return;
        webEditorRef.current?.focus();
        if (command === "heading") {
          let isH = false;
          if (typeof window !== "undefined") {
            const sel = window.getSelection();
            if (sel && sel.anchorNode) {
              let el: any = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentNode : sel.anchorNode;
              while (el && el !== webEditorRef.current && el !== document.body) {
                if (/^H[1-6]$/i.test(el.tagName)) {
                  isH = true;
                  break;
                }
                el = el.parentElement;
              }
            }
          }
          document.execCommand("formatBlock", false, isH ? "<p>" : "<h3>");
        } else if (command === "insertHTML") {
          document.execCommand("insertHTML", false, arg || "");
        } else {
          document.execCommand(command, false, arg || undefined);
        }
        if (webEditorRef.current) {
          const html = webEditorRef.current.innerHTML || "";
          const text = webEditorRef.current.innerText || "";
          currentHtmlRef.current = html;
          updateLength(text.trim().length);
          onChangeText(html);
        }
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
    [onChangeText, updateLength]
  );

  const handleBold = useCallback(() => executeCommand("bold"), [executeCommand]);
  const handleItalic = useCallback(() => executeCommand("italic"), [executeCommand]);
  const handleUnderline = useCallback(() => executeCommand("underline"), [executeCommand]);
  const handleHeading = useCallback(() => executeCommand("heading"), [executeCommand]);
  const handleList = useCallback(() => executeCommand("insertUnorderedList"), [executeCommand]);
  const handleTemplate = useCallback(() => executeCommand("insertHTML", TEMPLATE_HTML), [executeCommand]);

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
              const html = target.innerHTML || "";
              const text = target.innerText || target.textContent || "";
              currentHtmlRef.current = html;
              updateLength(text.trim().length);
              onChangeText(html);
            },
          })
        ) : (
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={STATIC_WEBVIEW_SOURCE}
            onMessage={handleMessage}
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

      {/* ── Connected Bottom Toolbar (No toggle buttons — instant live formatting) ── */}
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

        {/* Heading Button */}
        <TouchableOpacity
          style={[styles.toolBtn, formatStatus.heading && styles.toolBtnActive]}
          onPress={handleHeading}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Apply heading format"
        >
          <Text style={[styles.toolBtnHeadingText, formatStatus.heading && styles.toolBtnActiveText]}>
            H
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
  toolBtnHeadingText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
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
