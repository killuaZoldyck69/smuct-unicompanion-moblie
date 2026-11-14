import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  MEME_LIMITS,
  createMemeIdempotencyKey,
  sanitizeMemeCaption,
  applyOptimisticMemeReaction,
  patchMemeWithReactionResult,
  resolveMemePreviewFromReport,
} from "../src/features/campus-hub/meme-logic.ts";

const ROOT = process.cwd();

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function collectFilesRecursive(dirRelativePath) {
  const fullDir = path.join(ROOT, dirRelativePath);
  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const childRel = path.join(dirRelativePath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesRecursive(childRel));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(childRel);
    }
  }
  return results;
}

describe("meme-logic unit tests", () => {
  it("exports expected media and caption limits", () => {
    assert.equal(MEME_LIMITS.MAX_CAPTION, 280);
    assert.equal(MEME_LIMITS.MAX_IMAGE_BYTES, 5 * 1024 * 1024);
    assert.equal(MEME_LIMITS.MAX_IMAGE_DIMENSION, 1600);
  });

  it("creates unique meme idempotency keys with meme_ prefix", () => {
    const first = createMemeIdempotencyKey();
    const second = createMemeIdempotencyKey();
    assert.match(first, /^meme_\d+_[a-z0-9]+$/i);
    assert.match(second, /^meme_\d+_[a-z0-9]+$/i);
    assert.notEqual(first, second);
  });

  it("sanitizes meme captions, strips tags, and enforces 280-char limit", () => {
    assert.deepEqual(sanitizeMemeCaption(undefined), { caption: null });
    assert.deepEqual(sanitizeMemeCaption("   \n\t "), { caption: null });

    const cleaned = sanitizeMemeCaption("  <b>Finals</b>\r\n\r\n\r\nweek!  ");
    assert.equal(cleaned.error, undefined);
    assert.equal(cleaned.caption, "Finals\n\nweek!");

    const exact = "a".repeat(280);
    assert.deepEqual(sanitizeMemeCaption(exact), { caption: exact });

    const tooLong = "b".repeat(281);
    const rejected = sanitizeMemeCaption(tooLong);
    assert.equal(rejected.caption, tooLong);
    assert.match(rejected.error || "", /280/);
  });

  it("applies optimistic LIKE/DISLIKE toggles and switches without negative counts", () => {
    const baseMeme = {
      id: "meme-1",
      imageUrl: "https://example.com/meme.jpg",
      caption: "Lab day",
      authorId: "user-1",
      author: { id: "user-1", name: "Campus Peer" },
      likesCount: 0,
      dislikesCount: 0,
      userReaction: null,
      createdAt: "2026-11-14T10:00:00.000Z",
      updatedAt: "2026-11-14T10:00:00.000Z",
    };

    const liked = applyOptimisticMemeReaction(baseMeme, "LIKE");
    assert.equal(liked.userReaction, "LIKE");
    assert.equal(liked.likesCount, 1);
    assert.equal(liked.dislikesCount, 0);
    assert.equal(liked.popularityScore, 2);

    const switched = applyOptimisticMemeReaction(liked, "DISLIKE");
    assert.equal(switched.userReaction, "DISLIKE");
    assert.equal(switched.likesCount, 0);
    assert.equal(switched.dislikesCount, 1);
    assert.equal(switched.popularityScore, -1);

    const toggledOff = applyOptimisticMemeReaction(switched, "DISLIKE");
    assert.equal(toggledOff.userReaction, null);
    assert.equal(toggledOff.likesCount, 0);
    assert.equal(toggledOff.dislikesCount, 0);
    assert.equal(toggledOff.popularityScore, 0);

    const brokenCounts = { ...baseMeme, likesCount: 0, dislikesCount: 0, userReaction: "LIKE" };
    const clamped = applyOptimisticMemeReaction(brokenCounts, "LIKE");
    assert.equal(clamped.likesCount, 0);
    assert.equal(clamped.userReaction, null);
  });

  it("patches meme reaction state from server response", () => {
    const baseMeme = {
      id: "meme-2",
      imageUrl: "https://example.com/meme2.jpg",
      caption: null,
      authorId: "user-2",
      author: { id: "user-2", name: "Senior Peer" },
      likesCount: 2,
      dislikesCount: 1,
      userReaction: null,
      createdAt: "2026-11-14T10:00:00.000Z",
      updatedAt: "2026-11-14T10:00:00.000Z",
    };

    const patched = patchMemeWithReactionResult(baseMeme, {
      memeId: "meme-2",
      action: "ADDED",
      type: "LIKE",
      userReaction: "LIKE",
      likesCount: 5,
      dislikesCount: 1,
    });

    assert.equal(patched.userReaction, "LIKE");
    assert.equal(patched.likesCount, 5);
    assert.equal(patched.dislikesCount, 1);
    assert.equal(patched.popularityScore, 9);
  });

  it("resolves meme image preview from moderation report targetLive or targetSnapshot", () => {
    assert.equal(resolveMemePreviewFromReport(null), null);
    assert.equal(
      resolveMemePreviewFromReport({
        targetId: "meme-empty",
        targetLive: { id: "meme-empty", contentPreview: "No image", imageUrl: "  " },
        targetSnapshot: null,
      }),
      null,
    );

    const fromLive = resolveMemePreviewFromReport({
      targetId: "meme-3",
      targetAuthor: { name: "Test Author" },
      targetLive: {
        id: "meme-live-3",
        contentPreview: "  Exam panic  ",
        imageUrl: " https://example.com/live.jpg ",
      },
      targetSnapshot: {
        contentPreview: "Old caption",
        imageUrl: "https://example.com/snap.jpg",
      },
    });
    assert.deepEqual(fromLive, {
      id: "meme-live-3",
      imageUrl: "https://example.com/live.jpg",
      caption: "Exam panic",
      authorName: "Test Author",
    });

    const fromSnapshot = resolveMemePreviewFromReport({
      targetId: "meme-4",
      targetAuthor: { name: null },
      targetLive: null,
      targetSnapshot: {
        contentPreview: "   ",
        imageUrl: "https://example.com/snap-only.jpg",
      },
    });
    assert.deepEqual(fromSnapshot, {
      id: "meme-4",
      imageUrl: "https://example.com/snap-only.jpg",
      caption: null,
      authorName: undefined,
    });
  });
});

describe("memes mobile audit & contract checks", () => {
  it("removes unused comment-sheet.tsx and keeps MemeAuthor non-PII", () => {
    assert.equal(
      fs.existsSync(path.join(ROOT, "src/screens/campus-hub/shared/comment-sheet.tsx")),
      false,
    );

    const memeService = readProjectFile("src/services/meme-service.ts");
    const authorInterfaceMatch = memeService.match(/export interface MemeAuthor \{[\s\S]*?\n\}/);
    assert.ok(authorInterfaceMatch, "MemeAuthor interface should exist");
    assert.equal(/\bemail\??:/.test(authorInterfaceMatch[0]), false);
    assert.equal(/\bstudentId\??:/.test(authorInterfaceMatch[0]), false);
    assert.ok(memeService.includes("CAMPUS_HUB_COLD_START_TIMEOUT_MS = 45000"));
    assert.ok(memeService.includes("idempotencyKey"));
    assert.ok(memeService.includes("reportMeme"));
    assert.match(memeService, /export interface UpdateMemeInput \{\s*caption: string \| null;\s*\}/);
  });

  it("keeps Memes compose pipeline hardened with resize, 5MB guard, and orphan cleanup", () => {
    const composeHook = readProjectFile("src/features/campus-hub/useMemeCompose.ts");
    assert.ok(composeHook.includes("expo-image-manipulator"));
    assert.ok(composeHook.includes("ImageManipulator.manipulateAsync"));
    assert.ok(composeHook.includes("validateLocalImageSizes"));
    assert.ok(composeHook.includes("MEME_LIMITS.MAX_IMAGE_BYTES"));
    assert.ok(composeHook.includes("deleteFileFromCloudinaryApi"));
    assert.ok(composeHook.includes("createMemeIdempotencyKey"));
    assert.ok(composeHook.includes("submitLockRef"));
    assert.ok(composeHook.includes("useUgcTermsRetry"));
  });

  it("keeps MemeEditModal strictly caption-only with UGC retry and modal Toast", () => {
    const editModal = readProjectFile("src/screens/campus-hub/memes/components/meme-edit-modal.tsx");
    assert.equal(editModal.includes("ImagePicker"), false);
    assert.equal(editModal.includes("ImageManipulator"), false);
    assert.equal(editModal.includes("uploadImageToCloudinary"), false);
    assert.ok(editModal.includes("useUgcTermsRetry"));
    assert.ok(editModal.includes("sanitizeMemeCaption"));
    assert.ok(editModal.includes("<Toast config={toastConfig}"));
  });

  it("serializes per-meme reactions and supports MEME_POST UGC reporting and moderation preview", () => {
    const useMemesSource = readProjectFile("src/features/campus-hub/useMemes.ts");
    assert.equal(useMemesSource.includes("keepPreviousData"), false);
    assert.ok(useMemesSource.includes("queueByMemeRef"));
    assert.ok(useMemesSource.includes("latestSeqByMemeRef"));
    assert.ok(useMemesSource.includes("removeMemeFromFeedCaches"));
    assert.ok(useMemesSource.includes("useReportMeme"));
    assert.ok(useMemesSource.includes("previousMemeSnapshot"));
    assert.equal(useMemesSource.includes("previousFeeds.forEach"), false);
    assert.ok(useMemesSource.includes("updateMemeAcrossInfiniteFeeds"));
    assert.ok(useMemesSource.includes('queryKey: ["adminForumReports"]'));

    const composeHookSource = readProjectFile("src/features/campus-hub/useMemeCompose.ts");
    assert.ok(composeHookSource.includes("useUgcTermsStatus"));
    assert.ok(composeHookSource.includes("refetchUgcTerms"));
    assert.ok(composeHookSource.includes("!visible && !submitLockRef.current"));
    assert.ok(composeHookSource.includes("pickLockRef"));

    const editModalSource = readProjectFile(
      "src/screens/campus-hub/memes/components/meme-edit-modal.tsx",
    );
    assert.ok(editModalSource.includes("initializedMemeIdRef"));

    const memesScreen = readProjectFile("src/screens/campus-hub/memes/index.tsx");
    assert.ok(memesScreen.includes("UgcGuidelinesModal"));
    assert.ok(memesScreen.includes('targetType="MEME_POST"'));
    assert.ok(memesScreen.includes("offlineBanner"));
    assert.ok(memesScreen.includes("reportLockRef"));

    const memeCard = readProjectFile("src/screens/campus-hub/memes/components/meme-card.tsx");
    assert.ok(memeCard.includes('from "expo-image"'));

    const memeImageModal = readProjectFile(
      "src/screens/campus-hub/memes/components/meme-image-modal.tsx",
    );
    assert.ok(memeImageModal.includes('from "expo-image"'));
    assert.ok(memeImageModal.includes("renderInline"));
    assert.ok(memeImageModal.includes("BackHandler"));

    const modModal = readProjectFile("src/screens/forum/components/ugc/admin-moderation-modal.tsx");
    assert.ok(modModal.split("\n").length < 600);
    assert.ok(modModal.includes("resolveMemePreviewFromReport"));
    assert.ok(modModal.includes("<MemeImageModal"));
    assert.ok(modModal.includes("renderInline={true}"));
  });

  it("enforces file size limits and semantic color tokens across Memes modules", () => {
    const memeUiFiles = collectFilesRecursive("src/screens/campus-hub/memes");
    assert.ok(memeUiFiles.length >= 8);

    for (const relPath of memeUiFiles) {
      const content = readProjectFile(relPath);
      const lineCount = content.split("\n").length;
      assert.ok(lineCount <= 500, `${relPath} exceeds 500 lines (${lineCount})`);
      assert.equal(
        /#[0-9a-fA-F]{3,8}/.test(content),
        false,
        `${relPath} contains raw hex color literal`,
      );
    }

    for (const logicRelPath of [
      "src/features/campus-hub/meme-logic.ts",
      "src/features/campus-hub/useMemeCompose.ts",
      "src/features/campus-hub/useMemes.ts",
      "src/services/meme-service.ts",
    ]) {
      const content = readProjectFile(logicRelPath);
      assert.equal(
        /#[0-9a-fA-F]{3,8}/.test(content),
        false,
        `${logicRelPath} contains raw hex color literal`,
      );
    }
  });
});
