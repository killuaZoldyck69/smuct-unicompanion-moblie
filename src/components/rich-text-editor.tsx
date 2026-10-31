// Shared rich-text editor used by event, notice, forum, and marketplace forms.
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
const EDITOR_COLORS = {
  white: "#ffffff",
  deepNavy: "#131b2e",
  subtleText: "#64748b",
};
const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export interface RichTextEditorProps {
  initialValue?: string;
  onChange: (html: string, plainText: string) => void;
  placeholder?: string;
  minHeight?: number;
  accentColor?: string;
  editorFontSize?: number;
  editorLineHeight?: string;
  editorPadding?: string;
  showJustify?: boolean;
  templateHtml?: string;
  templateLabel?: string;
  showHelperText?: boolean;
  helperText?: string;
  onLengthChange?: (length: number) => void;
}

interface FormatStatus {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  list: boolean;
  justify: boolean;
}

const isWeb = Platform.OS === "web";

const WEB_STYLES = `
.shared-rich-text-editor:empty:before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  display: block;
}
.shared-rich-text-editor p {
  margin: 0 0 10px 0;
  min-height: 1.2em;
}
.shared-rich-text-editor b, .shared-rich-text-editor strong {
  font-weight: bold;
}
.shared-rich-text-editor i, .shared-rich-text-editor em {
  font-style: italic;
}
.shared-rich-text-editor u {
  text-decoration: underline;
}
.shared-rich-text-editor ul {
  margin: 8px 0;
  padding-left: 24px;
}
.shared-rich-text-editor li {
  margin-bottom: 4px;
}
`;

// Static HTML document for WebView to ensure it NEVER reloads during typing
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
      font-size: 15px;
      line-height: 1.65;
      color: #131b2e;
    }
    #editor {
      width: 100%;
      min-height: 100%;
      padding: 14px 16px;
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
      margin: 8px 0;
      padding-left: 24px;
    }
    li {
      margin-bottom: 4px;
      color: #131b2e;
    }
    p {
      margin: 0 0 10px 0;
      min-height: 1.2em;
    }
    div[align="justify"], p[align="justify"], div[style*="text-align: justify"], p[style*="text-align: justify"] {
      text-align: justify;
      text-justify: inter-word;
    }
  </style>
</head>
<body>
  <div id="editor" contenteditable="true" spellcheck="true" autocomplete="off" autocapitalize="sentences" data-placeholder="Provide a brief overview, agenda, eligibility, rules, or key highlights..."></div>

  <script>
    var editor = document.getElementById('editor');
    var savedRange = null;
    var isBusy = false;

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

    function isNodeJustified(node) {
      var curr = node && node.nodeType === 3 ? node.parentElement : node;
      while (curr && curr !== editor && curr !== document.body) {
        if (
          (curr.getAttribute && curr.getAttribute('align') === 'justify') ||
          (curr.style && curr.style.textAlign === 'justify')
        ) {
          return true;
        }
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

    function toggleJustify() {
      if (editor.hasAttribute('align')) editor.removeAttribute('align');
      if (editor.style && editor.style.textAlign) editor.style.textAlign = '';

      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var range = sel.getRangeAt(0);

      var isJustified = isNodeJustified(range.commonAncestorContainer);
      if (isJustified) {
        var curr = range.commonAncestorContainer && range.commonAncestorContainer.nodeType === 3
          ? range.commonAncestorContainer.parentElement
          : range.commonAncestorContainer;
        while (curr && curr !== editor && curr !== document.body) {
          if (
            (curr.getAttribute && curr.getAttribute('align') === 'justify') ||
            (curr.style && curr.style.textAlign === 'justify')
          ) {
            curr.style.textAlign = '';
            if (curr.hasAttribute('align')) curr.removeAttribute('align');
          }
          curr = curr.parentElement;
        }
      } else {
        if (!sel.isCollapsed) {
          var commonParent = range.commonAncestorContainer;
          var block = commonParent.nodeType === 3 ? commonParent.parentElement : commonParent;
          if (block && block !== editor && (block.tagName === 'P' || block.tagName === 'DIV' || block.tagName === 'LI')) {
            block.style.textAlign = 'justify';
          } else {
            try {
              document.execCommand('justifyFull', false, null);
            } catch (err) {}
          }
        } else {
          var block = sel.anchorNode && sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
          if (block && block !== editor) {
            block.style.textAlign = 'justify';
          } else {
            try {
              document.execCommand('justifyFull', false, null);
            } catch (err) {}
          }
        }
      }

      if (editor.hasAttribute('align')) editor.removeAttribute('align');
      if (editor.style && editor.style.textAlign) editor.style.textAlign = '';
      saveCurrentSelection();
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

    window.formatCommand = function(cmd, value) {
      isBusy = true;
      try {
        editor.focus();
        restoreSavedSelection();

        if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline') {
          toggleInline(cmd);
        } else if (cmd === 'justify') {
          toggleJustify();
        } else if (cmd === 'insertUnorderedList') {
          document.execCommand('insertUnorderedList', false, null);
          saveCurrentSelection();
        } else if (cmd === 'insertHTML') {
          document.execCommand('insertHTML', false, value || '');
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
      var justify = false;

      if (range && range.commonAncestorContainer && isEditorNode(range.commonAncestorContainer)) {
        var target = range.commonAncestorContainer;
        bold = isNodeBold(target);
        italic = isNodeItalic(target);
        underline = isNodeUnderline(target);
        list = isNodeList(target);
        justify = isNodeJustified(target);
      }

      post('formatStatus', {
        bold: bold,
        italic: italic,
        underline: underline,
        list: list,
        justify: justify
      });
    }

    var timeoutId;
    editor.addEventListener('input', function() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function() {
        notifyChange();
        checkFormatStatus();
      }, 50);
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

    window.onload = function() {
      post('ready');
    };
  </script>
</body>
</html>
`;

const STATIC_WEBVIEW_SOURCE = { html: STATIC_EDITOR_HTML };

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

function isNodeJustifiedWeb(node: any, root: any): boolean {
  let curr = node && node.nodeType === 3 ? node.parentElement : node;
  while (curr && curr !== root && curr !== document.body) {
    if (
      (curr.getAttribute && curr.getAttribute("align") === "justify") ||
      (curr.style && curr.style.textAlign === "justify")
    ) {
      return true;
    }
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

export const RichTextEditor = React.memo(function RichTextEditor({
  initialValue = "",
  onChange,
  placeholder = "",
  minHeight = 220,
  accentColor = EDITOR_COLORS.deepNavy,
  editorFontSize = 15,
  editorLineHeight = "1.65",
  editorPadding = "14px 16px",
  showJustify = true,
  templateHtml,
  templateLabel = "Template",
  showHelperText = true,
  helperText = "Select any text to apply Bold, Italic, Underline, Bullet List, or Justify alignment directly in the field.",
  onLengthChange,
}: RichTextEditorProps) {
  const webViewRef = useRef<WebView>(null);
  const webEditorRef = useRef<any>(null);
  const isReadyRef = useRef(false);
  const isTypingRef = useRef(false);
  const currentHtmlRef = useRef(initialValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [formatStatus, setFormatStatus] = useState<FormatStatus>({
    bold: false,
    italic: false,
    underline: false,
    list: false,
    justify: false,
  });

  useEffect(() => {
    if (isWeb && typeof document !== "undefined") {
      const styleId = "shared-rich-text-editor-styles";
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = WEB_STYLES;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const checkWebFormatStatus = useCallback(() => {
    if (typeof document === "undefined" || !webEditorRef.current) return;
    const editor = webEditorRef.current;
    const sel = window.getSelection();
    let bold = false;
    let italic = false;
    let underline = false;
    let list = false;
    let justify = false;

    if (sel && sel.anchorNode && (sel.anchorNode === editor || editor.contains(sel.anchorNode))) {
      const target = sel.anchorNode;
      bold = isNodeBoldWeb(target, editor);
      italic = isNodeItalicWeb(target, editor);
      underline = isNodeUnderlineWeb(target, editor);
      list = isNodeListWeb(target, editor);
      justify = isNodeJustifiedWeb(target, editor);
    }

    setFormatStatus({
      bold,
      italic,
      underline,
      list,
      justify,
    });
  }, []);

  // Handle messages from WebView
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "ready") {
        isReadyRef.current = true;
        const escapedPlaceholder = JSON.stringify(placeholder);
        const contentToInject = currentHtmlRef.current || initialValue || "";
        currentHtmlRef.current = contentToInject;
        const escapedContent = JSON.stringify(contentToInject);
        webViewRef.current?.injectJavaScript(`
          if (window.setPlaceholder) window.setPlaceholder(${escapedPlaceholder});
          if (window.setEditorContent) window.setEditorContent(${escapedContent});
          true;
        `);
      } else if (data.type === "change") {
        isTypingRef.current = true;
        const html = data.html || "";
        const plainText = (data.text || "").replace(/\u200B/g, "");
        currentHtmlRef.current = html;
        onChangeRef.current(html, plainText);
        onLengthChange?.(plainText.trim().length);
      } else if (data.type === "formatStatus") {
        setFormatStatus({
          bold: !!data.bold,
          italic: !!data.italic,
          underline: !!data.underline,
          list: !!data.list,
          justify: !!data.justify,
        });
      }
    } catch {
      // ignore JSON parse error
    }
  }, [placeholder, initialValue, onLengthChange]);

  // Sync external changes (e.g., reset form or edit another event)
  useEffect(() => {
    if (isWeb) {
      if (webEditorRef.current && initialValue !== currentHtmlRef.current) {
        currentHtmlRef.current = initialValue;
        if (webEditorRef.current.innerHTML !== initialValue) {
          webEditorRef.current.innerHTML = initialValue || "";
        }
      }
      return;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }
    if (initialValue !== currentHtmlRef.current) {
      currentHtmlRef.current = initialValue;
      if (isReadyRef.current) {
        const escaped = JSON.stringify(initialValue);
        webViewRef.current?.injectJavaScript(`
          if (window.setEditorContent) {
            window.setEditorContent(${escaped});
          }
          true;
        `);
      }
    }
  }, [initialValue]);

  // Execute rich formatting commands inside contenteditable
  const executeCommand = useCallback((command: string, value?: string) => {
    if (isWeb) {
      if (typeof document === "undefined") return;
      const editor = webEditorRef.current;
      if (!editor) return;
      editor.focus();

      if (command === "bold" || command === "italic" || command === "underline") {
        toggleInlineWeb(editor, command);
      } else if (command === "justify") {
        document.execCommand("justifyFull", false, undefined);
      } else if (command === "insertUnorderedList") {
        document.execCommand("insertUnorderedList", false, undefined);
      } else if (command === "insertHTML") {
        document.execCommand("insertHTML", false, value || "");
      }

      if (editor) {
        const html = (editor.innerHTML || "").replace(/\u200B/g, "");
        const plainText = (editor.innerText || editor.textContent || "")
          .replace(/\u200B/g, "");
        currentHtmlRef.current = html;
        onChangeRef.current(html, plainText);
        onLengthChange?.(plainText.trim().length);
      }
      checkWebFormatStatus();
    } else {
      const escapedCommand = JSON.stringify(command);
      const escapedValue = JSON.stringify(value || "");
      webViewRef.current?.injectJavaScript(`
        if (window.formatCommand) {
          window.formatCommand(${escapedCommand}, ${escapedValue});
        }
        true;
      `);
    }
  }, [checkWebFormatStatus, onLengthChange]);

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

  const handleJustify = useCallback(() => {
    executeCommand("justify");
  }, [executeCommand]);

  return (
    <View style={styles.container}>
      {/* ── WYSIWYG Editable Area (Top) ── */}
      <View style={[styles.editorWrap, { minHeight }]}>
        {isWeb ? (
          React.createElement("div", {
            ref: webEditorRef,
            className: "shared-rich-text-editor",
            contentEditable: true,
            spellCheck: true,
            "data-placeholder": placeholder,
            style: {
              width: "100%",
              minHeight,
              padding: editorPadding,
              fontSize: `${editorFontSize}px`,
              lineHeight: editorLineHeight,
              color: EDITOR_COLORS.deepNavy,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
              backgroundColor: "#ffffff",
              outline: "none",
              overflowY: "auto",
              boxSizing: "border-box",
            },
            onInput: (e: any) => {
              const target = e.currentTarget;
              const html = (target.innerHTML || "").replace(/\u200B/g, "");
              const plainText = (target.innerText || target.textContent || "")
                .replace(/\u200B/g, "");
              currentHtmlRef.current = html;
              onChangeRef.current(html, plainText);
              onLengthChange?.(plainText.trim().length);
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

      {/* ── Native Rich Formatting Toolbar (Bottom) ── */}
      <View style={styles.toolbarContainer}>
        {/* Bold Button */}
        <TouchableOpacity
          style={[
            styles.toolBtn,
            { borderColor: accentColor },
            formatStatus.bold && [
              styles.toolBtnActive,
              { backgroundColor: accentColor, borderColor: accentColor },
            ],
          ]}
          onPress={handleBold}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle Bold"
        >
          <Text
            style={[
              styles.toolBtnBoldText,
              { color: accentColor },
              formatStatus.bold && styles.toolBtnActiveText,
            ]}
          >
            B
          </Text>
        </TouchableOpacity>

        {/* Italic Button */}
        <TouchableOpacity
          style={[
            styles.toolBtn,
            { borderColor: accentColor },
            formatStatus.italic && [
              styles.toolBtnActive,
              { backgroundColor: accentColor, borderColor: accentColor },
            ],
          ]}
          onPress={handleItalic}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle Italic"
        >
          <Text
            style={[
              styles.toolBtnItalicText,
              { color: accentColor },
              formatStatus.italic && styles.toolBtnActiveText,
            ]}
          >
            I
          </Text>
        </TouchableOpacity>

        {/* Underline Button */}
        <TouchableOpacity
          style={[
            styles.toolBtn,
            { borderColor: accentColor },
            formatStatus.underline && [
              styles.toolBtnActive,
              { backgroundColor: accentColor, borderColor: accentColor },
            ],
          ]}
          onPress={handleUnderline}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle Underline"
        >
          <Text
            style={[
              styles.toolBtnUnderlineText,
              { color: accentColor },
              formatStatus.underline && styles.toolBtnActiveText,
            ]}
          >
            U
          </Text>
        </TouchableOpacity>

        <View style={styles.toolbarDivider} />

        {/* List Button */}
        <TouchableOpacity
          style={[
            styles.toolBtn,
            { borderColor: accentColor },
            formatStatus.list && [
              styles.toolBtnActive,
              { backgroundColor: accentColor, borderColor: accentColor },
            ],
          ]}
          onPress={handleList}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle Bullet List"
        >
          <Feather
            name="list"
            size={14}
            color={formatStatus.list ? "#ffffff" : accentColor}
          />
          <Text
            style={[
              styles.toolBtnLabel,
              { color: accentColor },
              formatStatus.list && styles.toolBtnActiveText,
            ]}
          >
            List
          </Text>
        </TouchableOpacity>

        {/* Justify Button */}
        {showJustify && (
          <TouchableOpacity
            style={[
              styles.toolBtn,
              { borderColor: accentColor },
              formatStatus.justify && [
                styles.toolBtnActive,
                { backgroundColor: accentColor, borderColor: accentColor },
              ],
            ]}
            onPress={handleJustify}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle Justified Alignment"
          >
            <Feather
              name="align-justify"
              size={14}
              color={formatStatus.justify ? "#ffffff" : accentColor}
            />
            <Text
              style={[
                styles.toolBtnLabel,
                { color: accentColor },
                formatStatus.justify && styles.toolBtnActiveText,
              ]}
            >
              Justify
            </Text>
          </TouchableOpacity>
        )}
        {templateHtml && (
          <TouchableOpacity
            style={[styles.toolBtn, { borderColor: accentColor }]}
            onPress={() => executeCommand("insertHTML", templateHtml)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Insert ${templateLabel.toLowerCase()}`}
          >
            <Feather name="layout" size={12} color={accentColor} />
            <Text style={[styles.toolBtnLabel, { color: accentColor }]}>
              {templateLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showHelperText && <Text style={styles.helperTip}>{helperText}</Text>}
    </View>
  );
});

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
    gap: 8,
  },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: EDITOR_COLORS.white,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  toolBtnActive: {
    backgroundColor: EDITOR_COLORS.deepNavy,
    borderColor: EDITOR_COLORS.deepNavy,
  },
  toolBtnActiveText: {
    color: "#ffffff",
  },
  toolBtnBoldText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "900",
    color: EDITOR_COLORS.deepNavy,
  },
  toolBtnItalicText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    fontStyle: "italic",
    color: EDITOR_COLORS.deepNavy,
  },
  toolBtnUnderlineText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    textDecorationLine: "underline",
    color: EDITOR_COLORS.deepNavy,
  },
  toolBtnLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: EDITOR_COLORS.deepNavy,
    marginLeft: 4,
  },
  toolbarDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 4,
  },
  helperTip: {
    fontFamily,
    fontSize: 11,
    color: EDITOR_COLORS.subtleText,
    marginTop: 6,
    paddingLeft: 2,
    lineHeight: 15,
  },
});
