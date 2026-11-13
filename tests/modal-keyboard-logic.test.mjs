import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeAndroidKeyboardOverlap } from "../src/components/ui/modal-keyboard-logic.ts";

describe("computeAndroidKeyboardOverlap", () => {
  it("returns 0 when keyboardHeight is 0 or negative", () => {
    assert.equal(
      computeAndroidKeyboardOverlap({
        baselineHeight: 840,
        currentHeight: 840,
        containerBottomInWindow: 840,
        keyboardScreenY: 840,
        keyboardHeight: 0,
        screenHeight: 840,
      }),
      0,
    );
    assert.equal(
      computeAndroidKeyboardOverlap({
        baselineHeight: 840,
        currentHeight: 840,
        containerBottomInWindow: 840,
        keyboardScreenY: 840,
        keyboardHeight: -10,
        screenHeight: 840,
      }),
      0,
    );
  });

  it("returns 0 when OS adjustResize already shrank the modal container", () => {
    assert.equal(
      computeAndroidKeyboardOverlap({
        baselineHeight: 790,
        currentHeight: 505,
        containerBottomInWindow: 505,
        keyboardScreenY: 520,
        keyboardHeight: 320,
        screenHeight: 840,
      }),
      0,
    );
  });

  it("returns full keyboard overlap when Android edge-to-edge Dialog does not resize", () => {
    assert.equal(
      computeAndroidKeyboardOverlap({
        baselineHeight: 840,
        currentHeight: 840,
        containerBottomInWindow: 840,
        keyboardScreenY: 520,
        keyboardHeight: 320,
        screenHeight: 840,
      }),
      320,
    );
  });

  it("excludes external system navigation bar height when non-resizing Dialog ends above nav bar", () => {
    assert.equal(
      computeAndroidKeyboardOverlap({
        baselineHeight: 790,
        currentHeight: 790,
        containerBottomInWindow: 790,
        keyboardScreenY: 520,
        keyboardHeight: 320,
        screenHeight: 840,
      }),
      270,
    );
  });

  it("accounts for statusBarInset when statusBarTranslucent is false", () => {
    assert.equal(
      computeAndroidKeyboardOverlap({
        baselineHeight: 760,
        currentHeight: 760,
        containerBottomInWindow: 760,
        keyboardScreenY: 520,
        keyboardHeight: 320,
        screenHeight: 840,
        statusBarTranslucent: false,
        statusBarInset: 30,
      }),
      270,
    );
  });

  it("falls back to keyboardHeight minus alreadyResizedBy when containerBottomInWindow is 0", () => {
    assert.equal(
      computeAndroidKeyboardOverlap({
        baselineHeight: 840,
        currentHeight: 820,
        containerBottomInWindow: 0,
        keyboardScreenY: 520,
        keyboardHeight: 320,
        screenHeight: 840,
      }),
      300,
    );
  });
});
