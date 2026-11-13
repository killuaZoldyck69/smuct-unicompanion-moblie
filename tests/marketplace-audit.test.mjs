import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  MARKETPLACE_LIMITS,
  extractMarketplacePlainText,
  normalizeBangladeshiPhoneInput,
  validateMarketplaceForm,
  validateMarketplaceComment,
  clampImageIndex,
  getMarketplaceStatusBadgeText,
  resolveMarketplaceBackDestination,
  resolveMarketplaceErrorState,
} from "../src/features/campus-hub/marketplace-logic.ts";

const ROOT = process.cwd();

function readSrc(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("marketplace-logic domain validation", () => {
  it("extracts plain text cleanly from rich HTML descriptions", () => {
    const html =
      "<p><b>Calculus Book</b> &amp; Notes<br/>Good <i>condition</i></p>";
    const plain = extractMarketplacePlainText(html);
    assert.equal(plain, "Calculus Book & Notes\nGood condition");
    assert.equal(extractMarketplacePlainText("<p>   &nbsp; </p>"), "");
  });

  it("normalizes Bangladeshi mobile formats to +8801XXXXXXXXX", () => {
    assert.equal(
      normalizeBangladeshiPhoneInput("01700000000"),
      "+8801700000000",
    );
    assert.equal(
      normalizeBangladeshiPhoneInput("1700000000"),
      "+8801700000000",
    );
    assert.equal(
      normalizeBangladeshiPhoneInput("8801700000000"),
      "+8801700000000",
    );
    assert.equal(
      normalizeBangladeshiPhoneInput("+8801700000000"),
      "+8801700000000",
    );
  });

  it("validates SELLING vs BUYING payloads and clears condition on BUYING", () => {
    const selling = validateMarketplaceForm({
      type: "SELLING",
      title: "  Scientific Calculator  ",
      description: "<p>Used for one semester, works perfectly.</p>",
      price: "1250.5",
      category: "CALCULATORS",
      condition: "LIKE_NEW",
      contactPhone: "01700000000",
      images: ["https://res.cloudinary.com/demo/image/upload/v1/a.jpg"],
    });
    assert.equal(selling.error, undefined);
    assert.equal(selling.payload?.title, "Scientific Calculator");
    assert.equal(selling.payload?.price, 1250.5);
    assert.equal(selling.payload?.condition, "LIKE_NEW");
    assert.equal(selling.payload?.contactPhone, "+8801700000000");

    const buying = validateMarketplaceForm({
      type: "BUYING",
      title: "Discrete Math Book",
      description: "<p>Need second hand edition before finals.</p>",
      price: "",
      category: "TEXTBOOKS",
      condition: "NEW",
      contactPhone: "+8801800000000",
      images: [],
    });
    assert.equal(buying.error, undefined);
    assert.equal(buying.payload?.price, 0);
    assert.equal(buying.payload?.condition, null);
  });

  it("rejects empty HTML-wrapped descriptions, invalid prices, and invalid phones", () => {
    const emptyHtml = validateMarketplaceForm({
      type: "SELLING",
      title: "Valid Title",
      description: "<p><b>  </b></p>",
      category: "OTHER",
      contactPhone: "+8801700000000",
    });
    assert.match(emptyHtml.error || "", /at least 5 characters/);

    const hugePrice = validateMarketplaceForm({
      type: "SELLING",
      title: "Valid Title",
      description: "<p>Valid item description here.</p>",
      price: String(MARKETPLACE_LIMITS.MAX_PRICE + 1),
      category: "OTHER",
      contactPhone: "+8801700000000",
    });
    assert.match(hugePrice.error || "", /10,000,000/);

    const badPhone = validateMarketplaceForm({
      type: "SELLING",
      title: "Valid Title",
      description: "<p>Valid item description here.</p>",
      price: "500",
      category: "OTHER",
      contactPhone: "12345",
    });
    assert.match(badPhone.error || "", /Bangladeshi phone/);
  });

  it("validates comment boundaries cleanly", () => {
    assert.match(
      validateMarketplaceComment("   ").error || "",
      /write a comment/,
    );
    assert.match(
      validateMarketplaceComment("a".repeat(MARKETPLACE_LIMITS.MAX_COMMENT + 1))
        .error || "",
      /1000/,
    );
    assert.deepEqual(validateMarketplaceComment("  Is it still available? "), {
      content: "Is it still available?",
    });
  });

  it("clamps gallery image index safely and renders accurate status labels", () => {
    assert.equal(clampImageIndex(3, 2), 1);
    assert.equal(clampImageIndex(-2, 4), 0);
    assert.equal(clampImageIndex(1, 0), 0);

    assert.equal(
      getMarketplaceStatusBadgeText("ACTIVE", "SELLING"),
      "For Sale",
    );
    assert.equal(getMarketplaceStatusBadgeText("ACTIVE", "BUYING"), "Wanted");
    assert.equal(getMarketplaceStatusBadgeText("SOLD", "SELLING"), "Sold");
    assert.equal(getMarketplaceStatusBadgeText("SOLD", "BUYING"), "Fulfilled");
    assert.equal(getMarketplaceStatusBadgeText("CLOSED", "SELLING"), "Closed");
  });

  it("routes back destinations by role and classifies errors cleanly", () => {
    assert.deepEqual(resolveMarketplaceBackDestination({ userRole: "ADMIN" }), {
      action: "REPLACE",
      href: "/(tabs)/admin_campus_hubs",
      params: { section: "MARKETPLACE" },
    });
    assert.deepEqual(
      resolveMarketplaceBackDestination({ userRole: "STUDENT" }),
      {
        action: "REPLACE",
        href: "/(tabs)/forum",
        params: { section: "MARKETPLACE" },
      },
    );

    assert.equal(
      resolveMarketplaceErrorState({
        err: { response: { status: 404 } },
        isOffline: false,
      }),
      "notFound",
    );
    assert.equal(
      resolveMarketplaceErrorState({
        err: { code: "ECONNABORTED" },
        isOffline: false,
      }),
      "offline",
    );
    assert.equal(
      resolveMarketplaceErrorState({
        err: { response: { status: 500 } },
        isOffline: false,
      }),
      "generic",
    );
  });
});

describe("marketplace mobile audit regressions", () => {
  it("prevents post-save Cloudinary cleanup bug via unified MarketplaceFormModal", () => {
    const formSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-form-modal.tsx",
    );
    const indexSrc = readSrc("src/screens/campus-hub/marketplace/index.tsx");
    const detailSrc = readSrc(
      "src/screens/campus-hub/marketplace/marketplace-detail-screen.tsx",
    );

    assert.equal(
      fs.existsSync(
        path.join(ROOT, "src/screens/campus-hub/marketplace/compose-modal.tsx"),
      ),
      false,
    );
    assert.equal(
      fs.existsSync(
        path.join(ROOT, "src/screens/campus-hub/marketplace/edit-modal.tsx"),
      ),
      false,
    );

    assert.match(
      formSrc,
      /function closeAfterSave|const closeAfterSave = useCallback/,
    );
    assert.match(formSrc, /useUgcTermsRetry/);
    assert.match(formSrc, /UgcGuidelinesModal[\s\S]*renderInline=\{true\}/);
    assert.match(formSrc, /navigationBarTranslucent=\{true\}/);
    // Ensure onSuccess invokes closeAfterSave, NOT performDiscardAndClose/cleanupSessionUploadsOnly
    const onSuccessMatches = [
      ...formSrc.matchAll(/onSuccess:\s*\(\)\s*=>\s*\{[\s\S]*?\}/g),
    ];
    assert.ok(onSuccessMatches.length >= 2);
    for (const m of onSuccessMatches) {
      assert.match(m[0], /closeAfterSave\(\)/);
      assert.doesNotMatch(
        m[0],
        /cleanupSessionUploadsOnly|deleteFileFromCloudinaryApi/,
      );
    }

    assert.match(indexSrc, /<MarketplaceFormModal[\s\S]*mode="create"/);
    assert.match(detailSrc, /<MarketplaceFormModal[\s\S]*mode="edit"/);
    assert.match(formSrc, /initializedKeyRef/);
    assert.match(formSrc, /draftIdempotencyKeyRef/);
    assert.match(formSrc, /useUgcTermsStatus/);
    assert.match(
      formSrc,
      /ugcTermsQuery\.data\?\.accepted === false[\s\S]*setShowGuidelines\(true\)/,
    );
  });

  it("uses expo-image with onError fallbacks across marketplace and shared components", () => {
    const imageFiles = [
      "src/screens/campus-hub/marketplace/components/listing-card.tsx",
      "src/screens/campus-hub/marketplace/components/detail/mp-image-gallery.tsx",
      "src/screens/campus-hub/marketplace/components/detail/mp-listing-info-card.tsx",
      "src/screens/campus-hub/marketplace/components/marketplace-delete-modal.tsx",
      "src/screens/campus-hub/shared/inline-comments.tsx",
      "src/screens/campus-hub/shared/author-modal.tsx",
    ];
    for (const file of imageFiles) {
      const src = readSrc(file);
      assert.match(src, /from "expo-image"/, `${file} must use expo-image`);
      assert.match(src, /onError=\{/, `${file} must handle image load errors`);
      assert.doesNotMatch(
        src,
        /import\s*\{[^}]*\bImage\b[^}]*\}\s*from\s*"react-native"/,
        `${file} must not import Image from react-native`,
      );
    }
  });

  it("strips PII fields from MarketplaceAuthor and supports reporting & cache invalidation", () => {
    const serviceSrc = readSrc("src/services/marketplace-service.ts");
    const authorBlockMatch = serviceSrc.match(
      /export interface MarketplaceAuthor \{[\s\S]*?\}/,
    );
    assert.ok(authorBlockMatch, "MarketplaceAuthor interface must exist");
    for (const piiField of [
      "studentId",
      "teacherId",
      "email",
      "phoneNumber",
      "bloodGroup",
    ]) {
      assert.doesNotMatch(
        authorBlockMatch[0],
        new RegExp(`\\b${piiField}\\b`),
        `MarketplaceAuthor must not include ${piiField}`,
      );
    }
    assert.match(serviceSrc, /reportMarketplaceContent/);
    assert.match(serviceSrc, /contactPhone\?: string \| null;/);
    assert.match(serviceSrc, /idempotencyKey\?: string;/);
    assert.match(serviceSrc, /MARKETPLACE_REQUEST_TIMEOUT_MS = 45000/);
    assert.match(serviceSrc, /signal\?: AbortSignal/);
    const timeoutMatches = [
      ...serviceSrc.matchAll(
        /timeout:\s*(?:45000|MARKETPLACE_REQUEST_TIMEOUT_MS)/g,
      ),
    ];
    assert.ok(
      timeoutMatches.length >= 10,
      "All marketplace endpoints should configure 45s timeout for Render cold starts",
    );

    const hookSrc = readSrc("src/features/campus-hub/useMarketplace.ts");
    assert.match(hookSrc, /useUpdateMarketplaceStatus/);
    assert.match(hookSrc, /useReportMarketplaceContent/);
    assert.match(hookSrc, /queryFn:\s*\(\{\s*pageParam,\s*signal\s*\}\)/);
    assert.match(hookSrc, /queryFn:\s*\(\{\s*signal\s*\}\)/);
    const deleteHookMatch = hookSrc.match(
      /export const useDeleteMarketplacePost[\s\S]*?\n\};/,
    );
    assert.ok(deleteHookMatch);
    assert.match(deleteHookMatch[0], /marketplaceKeys\.all/);

    const ugcModHookSrc = readSrc("src/features/ugc/useUgcModeration.ts");
    assert.match(ugcModHookSrc, /marketplaceKeys\.all/);
  });

  it("wires moderation, comment lock, server hero counts, and error recovery in screens", () => {
    const detailSrc = readSrc(
      "src/screens/campus-hub/marketplace/marketplace-detail-screen.tsx",
    );
    assert.doesNotMatch(detailSrc, /\bActivityIndicator\b/);
    assert.match(detailSrc, /UgcReportModal/);
    assert.match(detailSrc, /UgcGuidelinesModal/);
    assert.match(detailSrc, /onReportPost=/);
    assert.match(detailSrc, /onReportComment=/);
    assert.match(detailSrc, /isLocked=\{isCommentsLocked\}/);
    assert.match(detailSrc, /isOwnProfile=/);

    const feedSrc = readSrc("src/screens/campus-hub/marketplace/index.tsx");
    assert.match(feedSrc, /firstPage\?\.counts\?\.selling/);
    assert.match(feedSrc, /firstPage\?\.counts\?\.buying/);
    assert.doesNotMatch(feedSrc, /eslint-disable/);
    assert.match(feedSrc, /isError[\s\S]*renderEmpty|if \(isError\)/);
    assert.ok(
      feedSrc.indexOf("if (isError)") < feedSrc.indexOf("const ListHeader"),
      "isError must render inside renderEmpty before ListHeader",
    );

    const filterModalSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-filter-modal.tsx",
    );
    assert.match(filterModalSrc, /CLOSED/);
    assert.match(filterModalSrc, /navigationBarTranslucent/);

    const adminModalSrc = readSrc(
      "src/screens/forum/components/ugc/admin-moderation-modal.tsx",
    );
    assert.match(adminModalSrc, /MARKETPLACE_POST/);
    assert.match(adminModalSrc, /\/campus-hub\/marketplace\//);

    assert.equal(
      fs.existsSync(
        path.join(
          ROOT,
          "src/screens/campus-hub/marketplace/components/marketplace-filter-rail.tsx",
        ),
      ),
      false,
      "dead marketplace-filter-rail.tsx should stay removed",
    );
  });

  it("enforces Android UI/UX ergonomics, elevation, contrast, tablet width, and accessibility", () => {
    const listingCardSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/listing-card.tsx",
    );
    assert.match(listingCardSrc, /\bPressable\b/);
    assert.match(listingCardSrc, /cardInactiveFlat/);
    assert.doesNotMatch(listingCardSrc, /opacity:\s*0\.76/);
    assert.match(listingCardSrc, /flexWrap:\s*"wrap"/);
    assert.match(listingCardSrc, /tabular-nums/);
    assert.match(listingCardSrc, /includeFontPadding:\s*false/);

    const feedSkeletonSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-skeleton.tsx",
    );
    assert.match(feedSkeletonSrc, /height:\s*136/);
    assert.match(feedSkeletonSrc, /borderRadius:\s*18/);

    const sharedSkeletonSrc = readSrc(
      "src/screens/campus-hub/shared/skeleton-loaders.tsx",
    );
    const mpDetailSkelMatch = sharedSkeletonSrc.match(
      /export function MarketplaceDetailSkeleton[\s\S]*?\n\}/,
    );
    assert.ok(mpDetailSkelMatch);
    assert.match(mpDetailSkelMatch[0], /constrainedBlock/);
    assert.match(mpDetailSkelMatch[0], /height=\{220\}/);

    const formSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-form-modal.tsx",
    );
    assert.match(
      formSrc,
      /publishBtnDisabled:\s*\{[\s\S]*?marketplaceAccentText/,
      "Disabled submit button must keep readable contrast",
    );
    assert.match(
      formSrc,
      /conditionRow:\s*\{[\s\S]*?flexWrap:\s*"wrap"/,
      "Condition selector row must wrap cleanly on 360dp viewports",
    );
    assert.match(formSrc, /priceInputRef\.current\?\.focus\(\)/);
    assert.match(formSrc, /phoneInputRef\.current\?\.focus\(\)/);
    assert.match(formSrc, /returnKeyType="next"/);
    assert.match(formSrc, /accessibilityRole="radio"/);

    const detailSrc = readSrc(
      "src/screens/campus-hub/marketplace/marketplace-detail-screen.tsx",
    );
    assert.match(detailSrc, /contentMaxWidth/);
    assert.match(detailSrc, /minHeight:\s*48/);

    const infoCardSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/detail/mp-listing-info-card.tsx",
    );
    assert.match(infoCardSrc, /flexShrink:\s*1/);
    assert.match(infoCardSrc, /minHeight:\s*48/);

    const filterSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-filter-modal.tsx",
    );
    assert.match(filterSrc, /contentMaxWidth/);
    assert.match(filterSrc, /\bPressable\b/);

    const categoryPickerSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-category-picker.tsx",
    );
    assert.match(categoryPickerSrc, /navigationBarTranslucent=\{true\}/);
    assert.match(categoryPickerSrc, /contentMaxWidth/);
    assert.match(categoryPickerSrc, /\bPressable\b/);

    for (const modalPath of [
      "src/screens/campus-hub/marketplace/components/marketplace-delete-modal.tsx",
      "src/screens/campus-hub/marketplace/components/marketplace-sold-modal.tsx",
    ]) {
      const modalSrc = readSrc(modalPath);
      assert.match(
        modalSrc,
        /\bPressable\b/,
        `${modalPath} must use Pressable`,
      );
      assert.match(
        modalSrc,
        /minHeight:\s*48|height:\s*48/,
        `${modalPath} action buttons must be >= 48dp tall`,
      );
    }
  });

  it("enforces synchronous in-flight locks and pre-upload UGC checks across mutations", () => {
    const uploadHookSrc = readSrc(
      "src/features/campus-hub/campus-hub-upload.ts",
    );
    assert.ok(
      uploadHookSrc.indexOf("setIsUploading(true)") <
        uploadHookSrc.indexOf("await validateLocalImageSizes"),
      "setIsUploading(true) must fire synchronously before awaiting FileSystem checks",
    );

    const formSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-form-modal.tsx",
    );
    assert.match(formSrc, /submitLockRef/);
    assert.match(formSrc, /ugcTermsQuery\.refetch\(\)/);

    const detailSrc = readSrc(
      "src/screens/campus-hub/marketplace/marketplace-detail-screen.tsx",
    );
    assert.match(detailSrc, /statusActionLockRef/);
    assert.match(detailSrc, /commentSubmitLockRef/);
    assert.match(detailSrc, /commentDeleteLockRef/);

    const feedSrc = readSrc("src/screens/campus-hub/marketplace/index.tsx");
    assert.match(feedSrc, /deleteLockRef/);
  });

  it("enforces WCAG emerald ink, unclipped badges, and Android responsiveness fixes", () => {
    const feedSrc = readSrc("src/screens/campus-hub/marketplace/index.tsx");
    assert.match(feedSrc, /styles\.filterBtnWrap/);
    assert.match(feedSrc, /<MarketplaceHero[\s\S]*isLoading=\{isLoading\}/);

    const heroSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-hero.tsx",
    );
    assert.match(heroSrc, /isLoading\s*=\s*false/);

    const richEditorSrc = readSrc("src/components/rich-text-editor.tsx");
    assert.match(richEditorSrc, /flexWrap:\s*"wrap"/);

    const tabBarSrc = readSrc(
      "src/screens/campus-hub/shared/section-tab-bar.tsx",
    );
    assert.match(tabBarSrc, /marketplaceAccentText/);

    const imageViewerSrc = readSrc(
      "src/screens/campus-hub/shared/image-viewer-modal.tsx",
    );
    assert.match(imageViewerSrc, /<ScrollView[\s\S]*horizontal/);

    const commentsSrc = readSrc(
      "src/screens/campus-hub/shared/inline-comments.tsx",
    );
    assert.doesNotMatch(commentsSrc, /\bTouchableOpacity\b/);
  });

  it("enforces code-quality refactors: 4-photo validation, decoupled upload helper, zero as-any casts, no dead state", () => {
    const tooManyImages = validateMarketplaceForm({
      type: "SELLING",
      title: "Calculus Textbook",
      description: "<p>Clean copy with all chapters intact.</p>",
      price: 450,
      category: "TEXTBOOKS",
      condition: "GOOD",
      contactPhone: "01712345678",
      images: [
        "file:///1.jpg",
        "file:///2.jpg",
        "file:///3.jpg",
        "file:///4.jpg",
        "file:///5.jpg",
      ],
    });
    assert.ok(tooManyImages.error);
    assert.match(tooManyImages.error, /at most 4 photos/);

    const feedSrc = readSrc("src/screens/campus-hub/marketplace/index.tsx");
    const detailSrc = readSrc(
      "src/screens/campus-hub/marketplace/marketplace-detail-screen.tsx",
    );
    const formSrc = readSrc(
      "src/screens/campus-hub/marketplace/components/marketplace-form-modal.tsx",
    );

    assert.doesNotMatch(feedSrc, /useLostFoundUpload/);
    assert.doesNotMatch(detailSrc, /useLostFoundUpload/);
    assert.doesNotMatch(formSrc, /useLostFoundUpload/);
    assert.doesNotMatch(detailSrc, /\bas any\b/);
    assert.doesNotMatch(feedSrc, /setIsDeleting|const \[isDeleting/);
    assert.doesNotMatch(formSrc, /\bsetUploadedMapVersion\b/);
  });
});
