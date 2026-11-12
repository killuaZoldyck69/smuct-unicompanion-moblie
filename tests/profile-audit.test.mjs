import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { executeLogoutCleanup } from "../src/screens/profile/logout-logic.ts";
import {
  isNotFoundError,
  isForbiddenError,
  isNetworkError,
  extractApiErrorMessage,
} from "../src/features/profile/profile-error-utils.ts";
import {
  normalizeSafeHttpUrl,
  toQualificationRecord,
  serializeQualificationRecord,
  areStringListsEqual,
  areQualificationRecordsEqual,
  areConsultationSlotsEqual,
  normalizeBangladeshPhone,
  resolveBdPhoneUpdate,
  resolveContactPhoneDigits,
  validateStudentAcademicUpdate,
  findIncompleteConsultationSlotIndex,
} from "../src/screens/profile/profile-form-logic.ts";

describe("executeLogoutCleanup", () => {
  it("completes remote revocation, local cleanup, query clear, and login redirect", async () => {
    const events = [];
    const result = await executeLogoutCleanup({
      unregisterPushToken: async () => {
        events.push("push");
      },
      signOutRemote: async () => {
        events.push("signOut");
      },
      clearLocalSession: async () => {
        events.push("local");
      },
      clearQueryCache: () => {
        events.push("cache");
      },
      navigateToLogin: () => {
        events.push("nav");
      },
    });

    assert.deepEqual(result, {
      pushUnregistered: true,
      remoteRevoked: true,
      localCleared: true,
    });
    assert.deepEqual(events, ["push", "signOut", "local", "cache", "nav"]);
  });

  it("still clears local session, query cache, and redirects when remote calls fail", async () => {
    const events = [];
    const result = await executeLogoutCleanup({
      unregisterPushToken: async () => {
        throw new Error("network down");
      },
      signOutRemote: async () => {
        throw new Error("500 server error");
      },
      clearLocalSession: async () => {
        events.push("local");
      },
      clearQueryCache: () => {
        events.push("cache");
      },
      navigateToLogin: () => {
        events.push("nav");
      },
    });

    assert.deepEqual(result, {
      pushUnregistered: false,
      remoteRevoked: false,
      localCleared: true,
    });
    assert.deepEqual(events, ["local", "cache", "nav"]);
  });

  it("clears query cache and redirects even if local storage cleanup rejects", async () => {
    const events = [];
    const result = await executeLogoutCleanup({
      unregisterPushToken: async () => {},
      signOutRemote: async () => {},
      clearLocalSession: async () => {
        throw new Error("secure store error");
      },
      clearQueryCache: () => {
        events.push("cache");
      },
      navigateToLogin: () => {
        events.push("nav");
      },
    });

    assert.deepEqual(result, {
      pushUnregistered: true,
      remoteRevoked: true,
      localCleared: false,
    });
    assert.deepEqual(events, ["cache", "nav"]);
  });
});

describe("profile-error-utils", () => {
  it("classifies HTTP status and network errors accurately", () => {
    assert.equal(isNotFoundError({ response: { status: 404 } }), true);
    assert.equal(isNotFoundError({ response: { status: 500 } }), false);
    assert.equal(isNotFoundError(null), false);

    assert.equal(isForbiddenError({ response: { status: 403 } }), true);
    assert.equal(isForbiddenError({ response: { status: 404 } }), false);

    assert.equal(isNetworkError({ code: "ERR_NETWORK" }), true);
    assert.equal(isNetworkError({ code: "ECONNABORTED" }), true);
    assert.equal(isNetworkError({ message: "Network Error" }), true);
    assert.equal(
      isNetworkError({ response: { status: 503 }, message: "Network Error" }),
      false
    );
  });

  it("extracts offline, API payload, runtime, and fallback messages in priority order", () => {
    assert.match(
      extractApiErrorMessage({ response: { status: 500 } }, "Fallback", true),
      /offline/i
    );
    assert.match(
      extractApiErrorMessage({ code: "ERR_NETWORK" }, "Fallback"),
      /offline/i
    );
    assert.equal(
      extractApiErrorMessage(
        { response: { status: 400, data: { message: "  Invalid student ID  " } } },
        "Fallback"
      ),
      "Invalid student ID"
    );
    assert.equal(
      extractApiErrorMessage(
        { response: { status: 403, data: { error: "Account restricted" } } },
        "Fallback"
      ),
      "Account restricted"
    );
    assert.equal(
      extractApiErrorMessage(new Error("Request timed out"), "Fallback"),
      "Request timed out"
    );
    assert.equal(extractApiErrorMessage(null, "Fallback message"), "Fallback message");
  });
});

describe("profile-form-logic", () => {
  it("validates http/https URLs and rejects unsafe schemes or malformed hosts", () => {
    assert.equal(normalizeSafeHttpUrl(""), "");
    assert.equal(normalizeSafeHttpUrl("   "), "");
    assert.equal(normalizeSafeHttpUrl(null), "");

    assert.equal(
      normalizeSafeHttpUrl("linkedin.com/in/faculty"),
      "https://linkedin.com/in/faculty"
    );
    assert.equal(
      normalizeSafeHttpUrl("http://example.edu/profile"),
      "http://example.edu/profile"
    );
    assert.equal(normalizeSafeHttpUrl("javascript:alert(1)"), null);
    assert.equal(normalizeSafeHttpUrl("data:text/html,<script>1</script>"), null);
    assert.equal(normalizeSafeHttpUrl("file:///etc/passwd"), null);
    assert.equal(normalizeSafeHttpUrl("tel:+8801712345678"), null);
    assert.equal(normalizeSafeHttpUrl("localhost"), null);
  });

  it("round-trips qualifications sorted by degree hierarchy while preserving metadata", () => {
    const existing = [
      {
        id: "q-bsc",
        degree: "B.Sc in CSE",
        institution: "SMUCT",
        passingYear: 2016,
        honors: "Summa Cum Laude",
      },
      {
        id: "q-phd",
        degree: "PhD",
        field: "AI",
        institution: "BUET",
        year: 2024,
      },
    ];

    const record = toQualificationRecord(existing);
    assert.deepEqual(record, {
      "B.Sc in CSE": "SMUCT",
      PhD: "BUET",
    });

    const serialized = serializeQualificationRecord(
      {
        "B.Sc in CSE": "SMUCT",
        "M.Sc in CS": "DU",
        PhD: "BUET",
      },
      existing
    );

    assert.equal(serialized.length, 3);
    assert.deepEqual(
      serialized.map((item) => item.degree),
      ["PhD", "M.Sc in CS", "B.Sc in CSE"]
    );
    assert.equal(serialized[0].id, "q-phd");
    assert.equal(serialized[0].field, "AI");
    assert.equal(serialized[1].id, undefined);
    assert.equal(serialized[2].honors, "Summa Cum Laude");
  });

  it("normalizes and diffs Bangladesh phone updates and list/slot equality helpers", () => {
    assert.equal(normalizeBangladeshPhone("+8801712345678"), "1712345678");
    assert.equal(normalizeBangladeshPhone("01712345678"), "1712345678");
    assert.equal(normalizeBangladeshPhone(null), "");

    assert.deepEqual(resolveBdPhoneUpdate("1712345678", "+8801712345678"), {
      changed: false,
    });
    assert.deepEqual(resolveBdPhoneUpdate("", "+8801712345678"), {
      changed: true,
      valid: true,
      value: "",
    });
    assert.deepEqual(resolveBdPhoneUpdate("17123", "+8801712345678"), {
      changed: true,
      valid: false,
    });
    assert.deepEqual(resolveBdPhoneUpdate("01812345678", ""), {
      changed: true,
      valid: true,
      value: "+8801812345678",
    });

    assert.equal(areStringListsEqual([" AI ", "ML"], ["AI", "ML "]), true);
    assert.equal(areStringListsEqual(["AI"], ["ML"]), false);

    assert.equal(
      areQualificationRecordsEqual({ BSc: "SMUCT", PhD: "BUET" }, { PhD: "BUET", BSc: "SMUCT " }),
      true
    );
    assert.equal(areQualificationRecordsEqual({ BSc: "SMUCT" }, { BSc: "DU" }), false);

    assert.equal(
      areConsultationSlotsEqual(
        [{ day: "SUN", startTime: "10:00 AM", endTime: "11:00 AM" }],
        [{ day: " SUN", startTime: "10:00 AM", endTime: "11:00 AM " }]
      ),
      true
    );
    assert.equal(
      areConsultationSlotsEqual(
        [{ day: "SUN", startTime: "10:00 AM", endTime: "11:00 AM" }],
        [{ day: "MON", startTime: "10:00 AM", endTime: "11:00 AM" }]
      ),
      false
    );

    // Clearing a saved phone number in edit mode stays empty instead of snapping back
    assert.equal(
      resolveContactPhoneDigits({
        isEditing: true,
        draftPhone: "",
        persistedPhone: "+8801643574469",
      }),
      ""
    );
    assert.equal(
      resolveContactPhoneDigits({
        isEditing: false,
        draftPhone: "",
        persistedPhone: "+8801643574469",
      }),
      "1643574469"
    );

    assert.equal(
      validateStudentAcademicUpdate(
        { section: " ", currentSemester: "8" },
        { section: "A", currentSemester: 8 }
      ).valid,
      false
    );
    assert.equal(
      validateStudentAcademicUpdate(
        { section: "B", currentSemester: "" },
        { section: "A", currentSemester: 8 }
      ).valid,
      false
    );
    assert.deepEqual(
      validateStudentAcademicUpdate(
        { section: "b", currentSemester: "10" },
        { section: "A", currentSemester: 9 }
      ),
      { valid: true, section: "B", currentSemester: 10 }
    );

    assert.equal(
      findIncompleteConsultationSlotIndex([
        { day: "Sunday", startTime: "10:00 AM", endTime: "11:00 AM" },
        { day: "Monday", startTime: "", endTime: "02:00 PM" },
      ]),
      1
    );
    assert.equal(
      findIncompleteConsultationSlotIndex([
        { day: "Sunday", startTime: "10:00 AM", endTime: "11:00 AM" },
      ]),
      -1
    );
  });
});
