// src/screens/forum/components/forum-wysiwyg-editor.tsx
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
import { BENTO_COLORS, fontFamily } from "../constants";

export interface ForumWysiwygEditorProps {
  initialValue?: string;
  onChange: (html: string, plainText: string) => void;
  placeholder?: string;
  minHeight?: number;
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
.forum-web-editor:empty:before {
  content: attr(data-placeholder);
  color: #94a3b8;
  pointer-events: none;
  display: block;
}
.forum-web-editor p {
  margin: 0 0 10px 0;
}
.forum-web-editor ul {
  margin: 8px 0;
  padding-left: 24px;
}
.forum-web-editor li {
  margin-bottom: 4px;
}
`;

// Static HTML template for WebView on native devices. Defined once outside component so WebView never reloads.
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
      line-height: 1.6;
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
      font-weight: 800;
      color: #0f172a;
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
    }
    div[align="justify"], p[align="justify"], div[style*="text-align: justify"], p[style*="text-align: justify"] {
      text-align: justify;
      text-justify: inter-word;
    }
  </style>
</head>
<body>
  <div id="editor" contenteditable="true" spellcheck="true" autocomplete="off" autocapitalize="sentences" data-placeholder="Describe your question, course details, or issue with specifics..."></div>

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

    function findJustifiedAncestor(node) {
      var curr = node && node.nodeType === 3 ? node.parentNode : node;
      while (curr && curr !== editor && curr !== document.body) {
        if (
          curr.getAttribute &&
          (curr.getAttribute('align') === 'justify' ||
           (curr.style && curr.style.textAlign === 'justify'))
        ) {
          return curr;
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

      var justifiedEl = findJustifiedAncestor(sel.anchorNode) || findJustifiedAncestor(range.commonAncestorContainer);

      if (justifiedEl) {
        if (justifiedEl.style) {
          justifiedEl.style.textAlign = '';
          if (justifiedEl.style.textJustify) justifiedEl.style.textJustify = '';
        }
        if (justifiedEl.hasAttribute('align')) {
          justifiedEl.removeAttribute('align');
        }
        if (
          justifiedEl.tagName === 'DIV' &&
          (!justifiedEl.getAttribute('style') || justifiedEl.getAttribute('style').trim() === '') &&
          !justifiedEl.getAttribute('class')
        ) {
          var parent = justifiedEl.parentNode;
          if (parent) {
            while (justifiedEl.firstChild) {
              parent.insertBefore(justifiedEl.firstChild, justifiedEl);
            }
            parent.removeChild(justifiedEl);
          }
        }
      } else {
        if (!sel.isCollapsed) {
          var commonParent = range.commonAncestorContainer;
          var block = commonParent.nodeType === 3 ? commonParent.parentNode : commonParent;

          if (block !== editor && (block.tagName === 'P' || block.tagName === 'DIV' || block.tagName === 'LI')) {
            block.style.textAlign = 'justify';
          } else {
            try {
              var frag = range.extractContents();
              var div = document.createElement('div');
              div.style.textAlign = 'justify';
              div.appendChild(frag);
              range.insertNode(div);

              var newRange = document.createRange();
              newRange.selectNodeContents(div);
              sel.removeAllRanges();
              sel.addRange(newRange);
              savedSelectionRange = newRange.cloneRange();
            } catch (err) {
              document.execCommand('justifyFull', false, null);
            }
          }
        } else {
          var curr = sel.anchorNode ? (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentNode : sel.anchorNode) : null;
          if (curr && curr !== editor) {
            curr.style.textAlign = 'justify';
          } else {
            document.execCommand('justifyFull', false, null);
          }
        }
      }

      if (editor.hasAttribute('align')) editor.removeAttribute('align');
      if (editor.style && editor.style.textAlign) editor.style.textAlign = '';
    }

    window.formatCommand = function(cmd) {
      editor.focus();
      restoreSavedSelection();

      if (cmd === 'justify') {
        toggleJustify();
      } else {
        document.execCommand(cmd, false, null);
      }

      saveCurrentSelection();
      notifyChange();
      checkFormatStatus();
    };

    function notifyChange() {
      post('change', {
        html: editor.innerHTML,
        text: editor.innerText || editor.textContent || ''
      });
    }

    function checkFormatStatus() {
      if (editor.hasAttribute('align')) editor.removeAttribute('align');
      if (editor.style && editor.style.textAlign) editor.style.textAlign = '';

      var isJustified = false;
      var sel = window.getSelection();
      if (sel && sel.anchorNode) {
        var justifiedEl = findJustifiedAncestor(sel.anchorNode);
        if (justifiedEl) isJustified = true;
      }

      post('formatStatus', {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        list: document.queryCommandState('insertUnorderedList'),
        justify: isJustified
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

export const ForumWysiwygEditor = React.memo(function ForumWysiwygEditor({
  initialValue = "",
  onChange,
  placeholder = "Describe your question, course details, or issue with specifics... Select any text to apply Bold, Italic, Underline, Bullet Lists, or Justify alignment.",
  minHeight = 220,
}: ForumWysiwygEditorProps) {
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

  // Inject Web CSS styles once on browser platform
  useEffect(() => {
    if (isWeb && typeof document !== "undefined") {
      const styleId = "forum-web-editor-styles";
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = WEB_STYLES;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  const checkWebFormatStatus = useCallback(() => {
    if (typeof document === "undefined") return;
    setFormatStatus({
      bold: !!document.queryCommandState?.("bold"),
      italic: !!document.queryCommandState?.("italic"),
      underline: !!document.queryCommandState?.("underline"),
      list: !!document.queryCommandState?.("insertUnorderedList"),
      justify: !!document.queryCommandState?.("justifyFull"),
    });
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
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
          currentHtmlRef.current = data.html || "";
          onChangeRef.current(data.html || "", data.text || "");
        } else if (data.type === "formatStatus") {
          setFormatStatus((prev) => {
            if (
              prev.bold === !!data.bold &&
              prev.italic === !!data.italic &&
              prev.underline === !!data.underline &&
              prev.list === !!data.list &&
              prev.justify === !!data.justify
            ) {
              return prev;
            }
            return {
              bold: !!data.bold,
              italic: !!data.italic,
              underline: !!data.underline,
              list: !!data.list,
              justify: !!data.justify,
            };
          });
        }
      } catch {
        // ignore parse errors
      }
    },
    [placeholder, initialValue],
  );

  // Sync external changes (e.g. form reset, Clear button)
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

  const executeCommand = useCallback(
    (command: string) => {
      if (isWeb) {
        if (typeof document === "undefined") return;
        webEditorRef.current?.focus();
        if (command === "justify") {
          document.execCommand("justifyFull", false, undefined);
        } else {
          document.execCommand(command, false, undefined);
        }
        if (webEditorRef.current) {
          const html = webEditorRef.current.innerHTML || "";
          const text =
            webEditorRef.current.innerText ||
            webEditorRef.current.textContent ||
            "";
          currentHtmlRef.current = html;
          onChangeRef.current(html, text);
        }
        checkWebFormatStatus();
      } else {
        webViewRef.current?.injectJavaScript(`
          if (window.formatCommand) {
            window.formatCommand('${command}');
          }
          true;
        `);
      }
    },
    [checkWebFormatStatus],
  );

  const handleBold = () => executeCommand("bold");
  const handleItalic = () => executeCommand("italic");
  const handleUnderline = () => executeCommand("underline");
  const handleList = () => executeCommand("insertUnorderedList");
  const handleJustify = () => executeCommand("justify");

  return (
    <View style={styles.container}>
      {/* ── WYSIWYG Editable Area ── */}
      <View style={[styles.editorWrap, { minHeight }]}>
        {isWeb ? (
          React.createElement("div", {
            ref: webEditorRef,
            className: "forum-web-editor",
            contentEditable: true,
            spellCheck: true,
            "data-placeholder": placeholder,
            style: {
              width: "100%",
              minHeight,
              padding: "14px 16px",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#131b2e",
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
              const html = target.innerHTML || "";
              const text = target.innerText || target.textContent || "";
              currentHtmlRef.current = html;
              onChangeRef.current(html, text);
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

      {/* ── Rich Formatting Toolbar (Directly beneath editor box) ── */}
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
          <Text
            style={[
              styles.toolBtnBoldText,
              formatStatus.bold && styles.toolBtnActiveText,
            ]}
          >
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
          <Text
            style={[
              styles.toolBtnItalicText,
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
            formatStatus.underline && styles.toolBtnActive,
          ]}
          onPress={handleUnderline}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Underline format"
        >
          <Text
            style={[
              styles.toolBtnUnderlineText,
              formatStatus.underline && styles.toolBtnActiveText,
            ]}
          >
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
          accessibilityLabel="Toggle Bullet List"
        >
          <Feather
            name="list"
            size={14}
            color={formatStatus.list ? "#ffffff" : BENTO_COLORS.deepNavy}
          />
          <Text
            style={[
              styles.toolBtnLabel,
              formatStatus.list && styles.toolBtnActiveText,
            ]}
          >
            List
          </Text>
        </TouchableOpacity>

        {/* Justify Alignment Button */}
        <TouchableOpacity
          style={[styles.toolBtn, formatStatus.justify && styles.toolBtnActive]}
          onPress={handleJustify}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle Justified alignment"
        >
          <Feather
            name="align-justify"
            size={14}
            color={formatStatus.justify ? "#ffffff" : BENTO_COLORS.deepNavy}
          />
          <Text
            style={[
              styles.toolBtnLabel,
              formatStatus.justify && styles.toolBtnActiveText,
            ]}
          >
            Justify
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helperTip}>
        Select any text to apply Bold, Italic, Underline, Bullet List, or Justify alignment directly in the field.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  editorWrap: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  toolBtnActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  toolBtnActiveText: {
    color: "#ffffff",
  },
  toolBtnBoldText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "900",
    color: BENTO_COLORS.deepNavy,
  },
  toolBtnItalicText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    fontStyle: "italic",
    color: BENTO_COLORS.deepNavy,
  },
  toolBtnUnderlineText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    textDecorationLine: "underline",
    color: BENTO_COLORS.deepNavy,
  },
  toolBtnLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginLeft: 5,
  },
  toolbarDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 3,
  },
  helperTip: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO_COLORS.subtleText,
    marginTop: 6,
    paddingLeft: 2,
    lineHeight: 16,
  },
});
