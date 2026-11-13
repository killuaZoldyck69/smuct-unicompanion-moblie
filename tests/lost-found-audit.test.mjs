import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  LOST_FOUND_LIMITS,
  validateLostFoundForm,
  validateClaimForm,
  canAuthorReviewClaim,
  canResubmitRejectedClaim,
  getClaimStatusPresentation,
  resolveLostFoundBackDestination,
} from "../src/features/campus-hub/lost-found-logic.ts";

const ROOT = process.cwd();

describe("lost-found-logic form validation", () => {
  it("validates and trims valid LOST and FOUND payloads", () => {
    const lost = validateLostFoundForm({
      type: "LOST",
      title: "  Black Casio Watch  ",
      description: "  Lost near Auditorium  ",
      category: "ACCESSORIES",
      location: "  SMUCT Auditorium  ",
      verificationQuestion: "Ignored question",
      verificationAnswer: "Ignored answer",
    });
    assert.equal(lost.error, undefined);
    assert.deepEqual(lost.payload, {
      type: "LOST",
      title: "Black Casio Watch",
      description: "Lost near Auditorium",
      category: "ACCESSORIES",
      location: "SMUCT Auditorium",
      verificationQuestion: null,
      verificationAnswer: null,
    });

    const found = validateLostFoundForm({
      type: "FOUND",
      title: "  Student ID Card  ",
      category: "ID_CARD",
      verificationQuestion: "  Last 4 digits? ",
      verificationAnswer: " 1234 ",
    });
    assert.equal(found.error, undefined);
    assert.equal(found.payload?.verificationQuestion, "Last 4 digits?");
    assert.equal(found.payload?.verificationAnswer, "1234");
  });

  it("omits verification fields when includeVerificationFields is false (admin edit guard)", () => {
    const adminEdit = validateLostFoundForm({
      type: "FOUND",
      title: "Found Wallet",
      category: "WALLET",
      includeVerificationFields: false,
    });
    assert.equal(adminEdit.error, undefined);
    assert.equal("verificationQuestion" in (adminEdit.payload || {}), false);
    assert.equal("verificationAnswer" in (adminEdit.payload || {}), false);
  });

  it("enforces min/max character limits aligned with SHARED_CONTRACT §10", () => {
    assert.match(
      validateLostFoundForm({
        type: "LOST",
        title: "A",
        category: "OTHER",
      }).error || "",
      /at least 2/,
    );
    assert.match(
      validateLostFoundForm({
        type: "LOST",
        title: "x".repeat(LOST_FOUND_LIMITS.MAX_TITLE + 1),
        category: "OTHER",
      }).error || "",
      /150/,
    );
    assert.match(
      validateLostFoundForm({
        type: "LOST",
        title: "Valid Title",
        description: "d".repeat(LOST_FOUND_LIMITS.MAX_DESCRIPTION + 1),
        category: "OTHER",
      }).error || "",
      /3000/,
    );
    assert.match(
      validateLostFoundForm({
        type: "FOUND",
        title: "Valid Title",
        location: "l".repeat(LOST_FOUND_LIMITS.MAX_LOCATION + 1),
        category: "OTHER",
      }).error || "",
      /150/,
    );
  });
});

describe("lost-found-logic claim validation & state helpers", () => {
  it("validates claim message and required verification answer", () => {
    const missingAns = validateClaimForm({
      message: "This is definitely my calculator",
      answer: "   ",
      hasVerificationQuestion: true,
    });
    assert.match(missingAns.error || "", /verification question/i);

    const shortMsg = validateClaimForm({
      message: "Hey",
      hasVerificationQuestion: false,
    });
    assert.match(shortMsg.error || "", /at least 5/i);

    const valid = validateClaimForm({
      message: "  Has my initials AH inside the cover  ",
      answer: "  AH  ",
      hasVerificationQuestion: true,
    });
    assert.equal(valid.error, undefined);
    assert.deepEqual(valid.payload, {
      message: "Has my initials AH inside the cover",
      answer: "AH",
    });
  });

  it("restricts claim review actions strictly to author on ACTIVE PENDING claims", () => {
    assert.equal(
      canAuthorReviewClaim({
        isAuthor: true,
        claimStatus: "PENDING",
        postStatus: "ACTIVE",
      }),
      true,
    );
    assert.equal(
      canAuthorReviewClaim({
        isAuthor: false,
        claimStatus: "PENDING",
        postStatus: "ACTIVE",
      }),
      false,
    );
    assert.equal(
      canAuthorReviewClaim({
        isAuthor: true,
        claimStatus: "PENDING",
        postStatus: "CLOSED",
      }),
      false,
    );
  });

  it("allows exactly one retry on REJECTED claims while ACTIVE", () => {
    assert.equal(
      canResubmitRejectedClaim({
        claimStatus: "REJECTED",
        attemptCount: 1,
        postStatus: "ACTIVE",
      }),
      true,
    );
    assert.equal(
      canResubmitRejectedClaim({
        claimStatus: "WITHDRAWN",
        attemptCount: 1,
        postStatus: "ACTIVE",
      }),
      true,
    );
    assert.equal(
      canResubmitRejectedClaim({
        claimStatus: "REJECTED",
        attemptCount: 2,
        postStatus: "ACTIVE",
      }),
      false,
    );
    assert.equal(
      canResubmitRejectedClaim({
        claimStatus: "WITHDRAWN",
        attemptCount: 2,
        postStatus: "ACTIVE",
      }),
      false,
    );
    assert.equal(
      canResubmitRejectedClaim({
        claimStatus: "REJECTED",
        attemptCount: 1,
        postStatus: "CLOSED",
      }),
      false,
    );
  });

  it("maps claim statuses and back destinations accurately", () => {
    assert.equal(getClaimStatusPresentation("ACCEPTED").tone, "emerald");
    assert.equal(getClaimStatusPresentation("REJECTED").tone, "rose");
    assert.equal(getClaimStatusPresentation("WITHDRAWN").tone, "slate");
    assert.equal(getClaimStatusPresentation("PENDING").tone, "amber");

    assert.deepEqual(
      resolveLostFoundBackDestination({ canGoBack: true, userRole: "STUDENT" }),
      {
        action: "REPLACE",
        href: "/(tabs)/forum",
        params: { section: "LOST_FOUND" },
      },
    );
    assert.deepEqual(
      resolveLostFoundBackDestination({ canGoBack: false, userRole: "ADMIN" }),
      {
        action: "REPLACE",
        href: "/(tabs)/admin_campus_hubs",
        params: { section: "LOST_FOUND" },
      },
    );
    assert.deepEqual(
      resolveLostFoundBackDestination({
        canGoBack: false,
        userRole: "STUDENT",
      }),
      {
        action: "REPLACE",
        href: "/(tabs)/forum",
        params: { section: "LOST_FOUND" },
      },
    );
  });
});

describe("lost-found UI & media regression guards", () => {
  it("compresses selected images via expo-image-manipulator and uses expo-image", () => {
    const pickerSrc = fs.readFileSync(
      path.join(ROOT, "src/screens/campus-hub/shared/image-picker-row.tsx"),
      "utf8",
    );
    assert.match(pickerSrc, /expo-image-manipulator/);
    assert.match(pickerSrc, /manipulateAsync/);
    assert.match(pickerSrc, /from "expo-image"/);

    const viewerSrc = fs.readFileSync(
      path.join(ROOT, "src/screens/campus-hub/shared/image-viewer-modal.tsx"),
      "utf8",
    );
    assert.match(viewerSrc, /useWindowDimensions/);
    assert.doesNotMatch(viewerSrc, /Dimensions\.get/);
    assert.match(viewerSrc, /from "expo-image"/);
  });

  it("supports LOST_FOUND_POST moderation and inline UGC guidelines on create/claim", () => {
    const ugcService = fs.readFileSync(
      path.join(ROOT, "src/services/ugc-service.ts"),
      "utf8",
    );
    assert.match(ugcService, /LOST_FOUND_POST/);

    const modCard = fs.readFileSync(
      path.join(
        ROOT,
        "src/screens/forum/components/ugc/moderation-report-card.tsx",
      ),
      "utf8",
    );
    assert.match(modCard, /LOST_FOUND_POST/);

    const adminModal = fs.readFileSync(
      path.join(
        ROOT,
        "src/screens/forum/components/ugc/admin-moderation-modal.tsx",
      ),
      "utf8",
    );
    assert.match(adminModal, /\/campus-hub\/lost-found\//);

    const ugcRetrySrc = fs.readFileSync(
      path.join(ROOT, "src/features/campus-hub/useLostFoundUpload.ts"),
      "utf8",
    );
    assert.match(ugcRetrySrc, /UGC_TERMS_REQUIRED/);

    for (const rel of [
      "src/screens/campus-hub/lost-found/components/lost-found-form-modal.tsx",
      "src/screens/campus-hub/lost-found/components/claim-modal.tsx",
    ]) {
      const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
      assert.match(src, /useUgcTermsRetry/);
      assert.match(src, /renderInline=\{true\}/);
    }

    assert.equal(
      fs.existsSync(
        path.join(
          ROOT,
          "src/screens/campus-hub/lost-found/components/overflow-menu-modal.tsx",
        ),
      ),
      false,
    );

    const detailSrc = fs.readFileSync(
      path.join(
        ROOT,
        "src/screens/campus-hub/lost-found/lost-found-detail-screen.tsx",
      ),
      "utf8",
    );
    assert.match(detailSrc, /useLostFoundClaims\(\s*id,\s*canViewClaims/);
    assert.match(detailSrc, /onPress=\{\(\) => refetch\(\)\}/);

    for (const rel of [
      "src/screens/campus-hub/lost-found/components/lost-found-form-modal.tsx",
      "src/screens/campus-hub/lost-found/components/claim-modal.tsx",
    ]) {
      const src = fs.readFileSync(path.join(ROOT, rel), "utf8");
      assert.match(src, /if\s*\(isSubmitting\)\s*return/);
      assert.match(src, /edges=\{\["top"\]\}/);
      assert.match(src, /lostFoundAccentFill/);
    }

    const tokensSrc = fs.readFileSync(
      path.join(ROOT, "src/screens/campus-hub/shared/design-tokens.ts"),
      "utf8",
    );
    assert.match(tokensSrc, /lostFoundAccentFill:\s*colors\.semantic\.amber\.deep/);
    assert.match(tokensSrc, /contentMaxWidth:\s*720/);

    const feedSrc = fs.readFileSync(
      path.join(ROOT, "src/screens/campus-hub/lost-found/index.tsx"),
      "utf8",
    );
    assert.match(feedSrc, /lostFoundAccentFill/);
    assert.match(feedSrc, /Refresh failed/);

    assert.match(detailSrc, /isClaimsError/);
    assert.match(detailSrc, /contentMaxWidth/);

    const claimsSectionSrc = fs.readFileSync(
      path.join(
        ROOT,
        "src/screens/campus-hub/lost-found/components/detail/lf-claims-section.tsx",
      ),
      "utf8",
    );
    assert.match(claimsSectionSrc, /LostFoundClaimsSkeleton/);
    assert.match(claimsSectionSrc, /Could not load claims/);

    const acceptSheetSrc = fs.readFileSync(
      path.join(
        ROOT,
        "src/screens/campus-hub/lost-found/components/accept-confirmation-sheet.tsx",
      ),
      "utf8",
    );
    assert.match(acceptSheetSrc, /isLoading\s*\?\s*undefined\s*:\s*onClose/);

    const hubSrc = fs.readFileSync(
      path.join(ROOT, "src/screens/campus-hub/index.tsx"),
      "utf8",
    );
    assert.match(hubSrc, /prevInitialSectionRef/);
    assert.doesNotMatch(hubSrc, /\[initialSection,\s*activeSection\]/);
  });
});
