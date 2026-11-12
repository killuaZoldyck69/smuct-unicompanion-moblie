import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveSplashRoute,
  classifyLoginProfileCheckError,
} from "../src/features/auth/auth-routing-logic.ts";
import {
  sanitizeOnboardForm,
  parseOnboardApiError,
} from "../src/screens/onboard/utils.ts";
import {
  validatePassword,
  getPasswordCriteria,
} from "../src/utils/password-validator.ts";

describe("resolveSplashRoute (Mobile-19 & Mobile-20)", () => {
  it("clears stale local session and routes to login when online and unauthenticated", () => {
    const decision = resolveSplashRoute({
      sessionCheck: { status: "unauthenticated" },
      studentProfileCheck: "not_applicable",
      cachedSession: {
        hasToken: true,
        user: { id: "u-1", role: "STUDENT", emailVerified: true },
        onboarded: true,
      },
    });

    assert.deepEqual(decision, {
      destination: "/(auth)/login",
      shouldClearSession: true,
    });
  });

  it("routes authenticated un-onboarded students to /(auth)/onboard instead of /(tabs)", () => {
    const decision = resolveSplashRoute({
      sessionCheck: {
        status: "authenticated",
        user: { id: "u-1", role: "STUDENT", emailVerified: true },
      },
      studentProfileCheck: "not_found",
      cachedSession: {
        hasToken: true,
        user: { id: "u-1", role: "STUDENT", emailVerified: true },
        onboarded: null,
      },
    });

    assert.deepEqual(decision, {
      destination: "/(auth)/onboard",
      shouldClearSession: false,
      onboardedStateToPersist: false,
    });
  });

  it("routes authenticated onboarded students to /(tabs) and persists onboardedStateToPersist=true", () => {
    const decision = resolveSplashRoute({
      sessionCheck: {
        status: "authenticated",
        user: { id: "u-1", role: "STUDENT", emailVerified: true },
      },
      studentProfileCheck: "exists",
      cachedSession: {
        hasToken: true,
        user: { id: "u-1", role: "STUDENT", emailVerified: true },
        onboarded: false,
      },
    });

    assert.deepEqual(decision, {
      destination: "/(tabs)",
      shouldClearSession: false,
      onboardedStateToPersist: true,
    });
  });

  it("routes authenticated teachers/admins directly to /(tabs)", () => {
    const decision = resolveSplashRoute({
      sessionCheck: {
        status: "authenticated",
        user: { id: "t-1", role: "TEACHER", emailVerified: true },
      },
      studentProfileCheck: "not_applicable",
      cachedSession: {
        hasToken: true,
        user: { id: "t-1", role: "TEACHER", emailVerified: true },
        onboarded: null,
      },
    });

    assert.deepEqual(decision, {
      destination: "/(tabs)",
      shouldClearSession: false,
      onboardedStateToPersist: true,
    });
  });

  it("respects offline local token and routes un-onboarded students to /(auth)/onboard", () => {
    const unOnboardedOffline = resolveSplashRoute({
      sessionCheck: { status: "network_error" },
      studentProfileCheck: "not_applicable",
      cachedSession: {
        hasToken: true,
        user: { id: "u-1", role: "STUDENT", emailVerified: true },
        onboarded: false,
      },
    });

    assert.deepEqual(unOnboardedOffline, {
      destination: "/(auth)/onboard",
      shouldClearSession: false,
    });

    const onboardedOffline = resolveSplashRoute({
      sessionCheck: { status: "network_error" },
      studentProfileCheck: "not_applicable",
      cachedSession: {
        hasToken: true,
        user: { id: "u-1", role: "STUDENT", emailVerified: true },
        onboarded: true,
      },
    });

    assert.deepEqual(onboardedOffline, {
      destination: "/(tabs)",
      shouldClearSession: false,
    });
  });
});

describe("classifyLoginProfileCheckError (Mobile-19)", () => {
  it("treats only HTTP 404 as route_to_onboard", () => {
    assert.deepEqual(
      classifyLoginProfileCheckError({ response: { status: 404 } }),
      { action: "route_to_onboard" }
    );
  });

  it("aborts login on transient 5xx, 429, or network errors instead of routing to onboard", () => {
    assert.equal(
      classifyLoginProfileCheckError({ response: { status: 500 } }).action,
      "abort_login"
    );
    assert.equal(
      classifyLoginProfileCheckError({ response: { status: 503 } }).action,
      "abort_login"
    );
    assert.equal(
      classifyLoginProfileCheckError({ response: { status: 429 } }).action,
      "abort_login"
    );
    assert.equal(classifyLoginProfileCheckError(undefined).action, "abort_login");
  });
});

describe("sanitizeOnboardForm & parseOnboardApiError", () => {
  const validForm = {
    imageUri: "file:///avatar.jpg",
    studentId: "221071055",
    faculty: "Faculty of Science and Information Technology",
    department: "CSE",
    program: "B.Sc. in CSE",
    batch: "31",
    currentSemester: "8",
    section: "a",
    bloodGroup: "O_POSITIVE",
    phoneNumber: "01712345678",
  };

  it("validates 9-digit studentId and includes atomic phoneNumber and bloodGroup in payload", () => {
    const result = sanitizeOnboardForm(validForm);
    assert.equal(result.error, undefined);
    assert.deepEqual(result.payload, {
      studentId: "221071055",
      faculty: "Faculty of Science and Information Technology",
      department: "CSE",
      program: "B.Sc. in CSE",
      batch: "31",
      currentSemester: 8,
      section: "A",
      phoneNumber: "+8801712345678",
      bloodGroup: "O_POSITIVE",
    });
  });

  it("rejects non-9-digit student IDs", () => {
    const shortId = sanitizeOnboardForm({ ...validForm, studentId: "12345" });
    assert.equal(shortId.error?.field, "studentId");
    assert.match(shortId.error?.message || "", /9 digits/i);
  });

  it("distinguishes 403 deletion cooldowns from session expiry and 409 duplicate studentId from already onboarded", () => {
    const cooldownErr = parseOnboardApiError({
      response: {
        status: 403,
        data: {
          message:
            "This Student ID was recently associated with a deleted account. Please wait until the cooldown expires.",
        },
      },
    });
    assert.equal(cooldownErr.title, "Registration Restricted");
    assert.equal(cooldownErr.isSessionExpired, false);

    const duplicateIdErr = parseOnboardApiError({
      response: {
        status: 409,
        data: {
          message: "This Student ID is already registered to another account.",
        },
      },
    });
    assert.equal(duplicateIdErr.title, "Student ID Already Registered");
    assert.equal(duplicateIdErr.isAlreadyOnboarded, false);

    const alreadyOnboardedErr = parseOnboardApiError({
      response: {
        status: 409,
        data: {
          message: "Student profile already exists for this user",
        },
      },
    });
    assert.equal(alreadyOnboardedErr.title, "Profile Already Exists");
    assert.equal(alreadyOnboardedErr.isAlreadyOnboarded, true);
  });
});

describe("validatePassword", () => {
  it("enforces length, uppercase, lowercase, number, and special character", () => {
    assert.equal(validatePassword("Strong#123").isValid, true);
    assert.equal(validatePassword("weak").isValid, false);
    assert.deepEqual(getPasswordCriteria("Strong#123"), {
      hasMinLength: true,
      hasUppercase: true,
      hasLowercase: true,
      hasNumber: true,
      hasSpecialChar: true,
      allValid: true,
    });
  });
});
