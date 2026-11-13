import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { shouldHandleSessionInvalidation } from "../src/services/auth-session-policy.ts";
import {
  applyOptimisticReaction,
  applyOptimisticReactionToThread,
  countTotalThreadResponses,
  extractApiErrorInfo,
  formatShareMessage,
  patchReactionResultInThread,
  sanitizeForumPost,
  stripHtmlToPlainText,
} from "../src/features/forum/forum-logic.ts";

describe("auth-session-policy UGC 403 handling", () => {
  it("does not invalidate session on 403 UGC_TERMS_REQUIRED", () => {
    const result = shouldHandleSessionInvalidation(403, "/api/forum", {
      success: false,
      code: "UGC_TERMS_REQUIRED",
      message: "You must accept Community Guidelines (not restricted).",
    });
    assert.equal(result, false);
  });

  it("still invalidates session on account restriction 403 or 401", () => {
    assert.equal(
      shouldHandleSessionInvalidation(403, "/api/forum", {
        message: "Account has been restricted by an administrator.",
      }),
      true,
    );
    assert.equal(shouldHandleSessionInvalidation(401, "/api/forum", {}), true);
  });
});

describe("forum-logic validation, sharing & counts", () => {
  it("strips HTML safely and preserves justified rich text up to 12000 HTML chars", () => {
    const richBody = `<p style="text-align: justify;">${"<b>Academic</b> ".repeat(220)}</p>`;
    assert.ok(richBody.length > 3000 && richBody.length < 12000);
    const result = sanitizeForumPost({
      title: "Valid Question Title",
      description: richBody,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.description, richBody);
  });

  it("rejects empty HTML markup when plain text is under 10 chars", () => {
    const result = sanitizeForumPost({
      title: "Valid Title",
      description: "<p><br>&nbsp;  </p>",
    });
    assert.match(result.error || "", /provide details/i);
  });

  it("rejects plain text over 3000 chars and HTML over 12000 chars", () => {
    const overPlain = `<p>${"a".repeat(3005)}</p>`;
    assert.match(
      sanitizeForumPost({ title: "Valid Title", description: overPlain }).error ||
        "",
      /3000/,
    );

    const overHtml = `${"<span></span>".repeat(950)}<p>Enough plain text</p>`;
    assert.ok(overHtml.length > 12000);
    assert.match(
      sanitizeForumPost({ title: "Valid Title", description: overHtml }).error ||
        "",
      /too large/i,
    );
  });

  it("formats Share output cleanly without raw HTML tags", () => {
    const msg = formatShareMessage(
      "CSE 311 Help",
      '<p style="text-align: justify;">Need help with <strong>DFS</strong> &amp; graphs.</p>',
    );
    assert.ok(!msg.includes("<p"));
    assert.ok(!msg.includes("<strong>"));
    assert.match(msg, /Need help with DFS & graphs\./);
  });

  it("counts top-level responses plus nested replies recursively", () => {
    const count = countTotalThreadResponses([
      {
        id: "r1",
        content: "Top 1",
        createdAt: "2026-11-13T00:00:00Z",
        responder: { id: "u1", name: "Alice" },
        replies: [
          {
            id: "r1a",
            content: "Nested 1",
            createdAt: "2026-11-13T00:01:00Z",
            responder: { id: "u2", name: "Bob" },
          },
          {
            id: "r1b",
            content: "Nested 2",
            createdAt: "2026-11-13T00:02:00Z",
            responder: { id: "u3", name: "Carol" },
          },
        ],
      },
      {
        id: "r2",
        content: "Top 2",
        createdAt: "2026-11-13T00:03:00Z",
        responder: { id: "u2", name: "Bob" },
      },
    ]);
    assert.equal(count, 4);
    assert.equal(stripHtmlToPlainText("<p>Hello<br/>World</p>"), "Hello\nWorld");
  });
});

describe("forum-logic optimistic response reactions", () => {
  it("toggles, switches, and patches reactions on top-level and nested replies", () => {
    const basePost = {
      id: "p1",
      title: "Resolved Thread",
      description: "<p>Body content here</p>",
      isResolved: true,
      createdAt: "2026-11-13T00:00:00Z",
      authorId: "u1",
      author: { id: "u1", name: "Alice" },
      responses: [
        {
          id: "r1",
          content: "Helpful answer",
          createdAt: "2026-11-13T00:01:00Z",
          responder: { id: "u1", name: "Alice" },
          likesCount: 2,
          dislikesCount: 0,
          userReaction: null,
          replies: [
            {
              id: "r1a",
              content: "Nested comment",
              createdAt: "2026-11-13T00:02:00Z",
              responder: { id: "u2", name: "Bob" },
              likesCount: 1,
              dislikesCount: 0,
              userReaction: "LIKE",
            },
          ],
        },
      ],
    };

    const likedTop = applyOptimisticReaction(basePost.responses[0], "LIKE");
    assert.equal(likedTop.likesCount, 3);
    assert.equal(likedTop.userReaction, "LIKE");

    const toggledOff = applyOptimisticReaction(likedTop, "LIKE");
    assert.equal(toggledOff.likesCount, 2);
    assert.equal(toggledOff.userReaction, null);

    const switchedNested = applyOptimisticReactionToThread(
      basePost,
      "r1a",
      "DISLIKE",
    );
    const nested = switchedNested.responses?.[0].replies?.[0];
    assert.equal(nested?.likesCount, 0);
    assert.equal(nested?.dislikesCount, 1);
    assert.equal(nested?.userReaction, "DISLIKE");

    const reconciled = patchReactionResultInThread(switchedNested, {
      responseId: "r1a",
      likesCount: 4,
      dislikesCount: 1,
      userReaction: "DISLIKE",
    });
    assert.equal(reconciled.responses?.[0].replies?.[0].likesCount, 4);
  });

  it("extracts code and status cleanly from Axios-shaped errors", () => {
    const info = extractApiErrorInfo({
      response: {
        status: 403,
        data: {
          code: "UGC_TERMS_REQUIRED",
          message: "Accept guidelines first",
        },
      },
    });
    assert.equal(info.status, 403);
    assert.equal(info.code, "UGC_TERMS_REQUIRED");
    assert.equal(info.message, "Accept guidelines first");
  });
});

describe("production readiness regression guards", () => {
  it("hardens RichTextEditor WebView origin and client HTML sanitization", () => {
    const editorSrc = fs.readFileSync(
      path.resolve("src/components/rich-text-editor.tsx"),
      "utf8",
    );
    assert.ok(editorSrc.includes("sanitizeRichHtmlForWebDom"));
    assert.ok(editorSrc.includes("sanitizeEditorHtmlClient"));
    assert.ok(editorSrc.includes('originWhitelist={["about:blank"]}'));
    assert.ok(editorSrc.includes("allowFileAccess={false}"));
  });

  it("aligns guidelines copy, Axios timeout, auth-gated deep links, and inline modal guards", () => {
    const guidelinesSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/ugc/ugc-guidelines-modal.tsx"),
      "utf8",
    );
    assert.equal(/block abusive users/i.test(guidelinesSrc), false);
    assert.ok(guidelinesSrc.includes("renderInline"));

    const apiSrc = fs.readFileSync(path.resolve("src/services/api.ts"), "utf8");
    assert.ok(/timeout:\s*15000/.test(apiSrc));

    const notifSrc = fs.readFileSync(
      path.resolve("src/features/notifications/useNotificationObserver.ts"),
      "utf8",
    );
    assert.ok(notifSrc.includes("isNavigationReady && isAuthenticated"));

    const moderationSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/ugc/admin-moderation-modal.tsx"),
      "utf8",
    );
    assert.ok(moderationSrc.includes("renderInline={true}"));
    assert.ok(moderationSrc.includes("ModerationReportCard"));
    assert.ok(moderationSrc.includes("totalPages > 1"));
    assert.ok(moderationSrc.includes("minHeight: 48"));
    assert.ok(moderationSrc.includes("accessibilityState={{ selected: active }}"));

    const modCardSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/ugc/moderation-report-card.tsx"),
      "utf8",
    );
    assert.ok(modCardSrc.includes("canRestrictAuthor"));
    assert.ok(modCardSrc.includes('flexBasis: "48%"'));
    assert.ok(modCardSrc.includes("minHeight: 48"));

    const forumCardSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/forum-card.tsx"),
      "utf8",
    );
    assert.ok(forumCardSrc.includes('flexWrap: "wrap"'));
    assert.ok(forumCardSrc.includes("<ForumAvatar"));
    assert.ok(forumCardSrc.includes("android_ripple"));

    const forumAvatarSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/forum-avatar.tsx"),
      "utf8",
    );
    assert.ok(forumAvatarSrc.includes("setFailed(true)"));

    const reportModalSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/ugc/ugc-report-modal.tsx"),
      "utf8",
    );
    assert.ok(reportModalSrc.includes('behavior="padding"'));
    assert.ok(reportModalSrc.includes("flexShrink: 1"));

    const composerSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/detail/discussion-composer.tsx"),
      "utf8",
    );
    assert.ok(composerSrc.includes("insets.bottom +"));
    assert.ok(composerSrc.includes("paddingTop: 12"));

    const inlineCommentsSrc = fs.readFileSync(
      path.resolve("src/screens/campus-hub/shared/inline-comments.tsx"),
      "utf8",
    );
    assert.ok(inlineCommentsSrc.includes("insets.bottom +"));
    assert.ok(inlineCommentsSrc.includes("paddingTop: 12"));

    const commentSheetSrc = fs.readFileSync(
      path.resolve("src/screens/campus-hub/shared/comment-sheet.tsx"),
      "utf8",
    );
    assert.ok(commentSheetSrc.includes("insets.bottom +"));
    assert.ok(commentSheetSrc.includes("isKeyboardVisible"));

    const lfDetailSrc = fs.readFileSync(
      path.resolve(
        "src/screens/campus-hub/lost-found/lost-found-detail-screen.tsx",
      ),
      "utf8",
    );
    assert.ok(lfDetailSrc.includes("insets.bottom +"));

    const useForumSrc = fs.readFileSync(
      path.resolve("src/features/forum/useForum.ts"),
      "utf8",
    );
    assert.ok(useForumSrc.includes("queueByResponseRef"));
    assert.ok(useForumSrc.includes("onSettled:"));
    assert.ok(useForumSrc.includes("invalidateQueries"));

    const detailHookSrc = fs.readFileSync(
      path.resolve("src/screens/forum/hooks/use-discussion-detail.ts"),
      "utf8",
    );
    assert.ok(detailHookSrc.includes("submitResponseUpdate"));
    const ugcChecks =
      detailHookSrc.match(/info\.code === "UGC_TERMS_REQUIRED"/g) ?? [];
    assert.ok(
      ugcChecks.length >= 3,
      `Expected reply, edit-post, and edit-response to handle UGC_TERMS_REQUIRED (found ${ugcChecks.length})`,
    );

    const modQueueSrc = fs.readFileSync(
      path.resolve(
        "src/screens/forum/components/ugc/admin-moderation-modal.tsx",
      ),
      "utf8",
    );
    assert.ok(modQueueSrc.includes("info.status === 409"));
    assert.ok(modQueueSrc.includes("void refetch()"));
  });

  it("enforces clean forum typing, top-of-file imports, and decomposed components", () => {
    const utilsSrc = fs.readFileSync(
      path.resolve("src/screens/forum/utils.ts"),
      "utf8",
    );
    assert.ok(!utilsSrc.includes("formatEditedTime"));
    assert.ok(!utilsSrc.includes("getUserAcademicSubtitle"));
    assert.ok(!/:\s*any\b|\bas any\b/.test(utilsSrc));

    const forumIndexSrc = fs.readFileSync(
      path.resolve("src/screens/forum/index.tsx"),
      "utf8",
    );
    assert.ok(!/:\s*any\b|\bas any\b/.test(forumIndexSrc));

    const useForumSrc = fs.readFileSync(
      path.resolve("src/features/forum/useForum.ts"),
      "utf8",
    );
    assert.ok(!/:\s*any\b|\bas any\b/.test(useForumSrc));

    const replyItemSrc = fs.readFileSync(
      path.resolve(
        "src/screens/forum/components/detail/discussion-reply-item.tsx",
      ),
      "utf8",
    );
    const lastImportIdx = replyItemSrc.lastIndexOf("\nimport ");
    const componentDeclIdx = replyItemSrc.indexOf(
      "export const DiscussionReplyItem",
    );
    assert.ok(componentDeclIdx > lastImportIdx);

    const moderationSrc = fs.readFileSync(
      path.resolve("src/screens/forum/components/ugc/admin-moderation-modal.tsx"),
      "utf8",
    );
    assert.ok(moderationSrc.split("\n").length < 600);
    assert.ok(moderationSrc.includes("<ModerationReportCard"));
  });
});
