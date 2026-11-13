export interface AndroidKeyboardOverlapParams {
  baselineHeight: number;
  currentHeight: number;
  containerBottomInWindow: number;
  keyboardScreenY: number;
  keyboardHeight: number;
  screenHeight: number;
  statusBarTranslucent?: boolean;
  statusBarInset?: number;
}

/**
 * Computes the extra bottom padding needed on Android when the IME opens.
 * Returns 0 if the OS window (e.g. Dialog adjustResize) already shrank
 * to accommodate the keyboard, preventing double-shrinking across OEMs.
 */
export function computeAndroidKeyboardOverlap({
  baselineHeight,
  currentHeight,
  containerBottomInWindow,
  keyboardScreenY,
  keyboardHeight,
  screenHeight,
  statusBarTranslucent = true,
  statusBarInset = 0,
}: AndroidKeyboardOverlapParams): number {
  if (keyboardHeight <= 0) {
    return 0;
  }

  const alreadyResizedBy =
    baselineHeight > 0 ? Math.max(0, baselineHeight - currentHeight) : 0;

  // Threshold catches OS adjustResize regardless of nav-bar height differences.
  const resizeThreshold = Math.min(80, Math.round(keyboardHeight * 0.45));
  if (alreadyResizedBy >= resizeThreshold) {
    return 0;
  }

  const topOffset = statusBarTranslucent ? 0 : Math.max(0, statusBarInset);
  const effectiveBottom = containerBottomInWindow + topOffset;

  if (
    effectiveBottom > 0 &&
    keyboardScreenY > 100 &&
    (screenHeight <= 0 || keyboardScreenY < screenHeight)
  ) {
    return Math.max(0, Math.round(effectiveBottom - keyboardScreenY));
  }

  return Math.max(0, Math.round(keyboardHeight - alreadyResizedBy));
}
