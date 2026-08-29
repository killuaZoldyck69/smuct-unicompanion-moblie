# Migration Log: B7.1 — Move app/ under src/

## Date: 2026-08-29
## Target: React Native / Expo Mobile Application (`smuct-unicompanion-moblie`)

---

## 1. Overview
As part of migrating the codebase to Expo's Official folder structure ([Expo app folder structure best practices](https://expo.dev/blog/expo-app-folder-structure-best-practices)), the root `app/` directory containing all Expo Router file-system routes has been moved to `/src/app/`.

---

## 2. Directory Relocation Summary

The entire route directory was moved from `./app` to `./src/app` preserving all subdirectories and routes:
- `src/app/(auth)/`
  - `forgot-password.tsx`
  - `login.tsx`
  - `onboard.tsx`
  - `register.tsx`
  - `reset-password.tsx`
  - `verify-email.tsx`
- `src/app/(tabs)/`
  - `_layout.tsx`
  - `blood.tsx`
  - `forum.tsx`
  - `hubs.tsx`
  - `index.tsx`
  - `menu.tsx`
  - `profile.tsx`
- `src/app/admin/`
  - `alumni.tsx`
  - `blood.tsx`
  - `complaints.tsx`
  - `events.tsx`
  - `field-booking.tsx`
  - `forum.tsx`
  - `notices.tsx`
- `src/app/blood/`
  - `[id].tsx`
- `src/app/forum/`
  - `[id].tsx`
- `src/app/hub/`
  - `[id].tsx`
  - `[id]/assessments.tsx`
  - `[id]/reviews.tsx`
- **Root Screen Routes**:
  - `src/app/_layout.tsx`
  - `src/app/academic_calendar.tsx`
  - `src/app/admin-bus-manage.tsx`
  - `src/app/alumni.tsx`
  - `src/app/bus-schedule.tsx`
  - `src/app/cgpa-calculator.tsx`
  - `src/app/complaints.tsx`
  - `src/app/directory.tsx`
  - `src/app/events.tsx`
  - `src/app/exams.tsx`
  - `src/app/field-booking.tsx`
  - `src/app/index.tsx`
  - `src/app/my-schedule.tsx`
  - `src/app/notices.tsx`

---

## 3. Configuration Files Touched

1. **`tsconfig.json`**:
   - Added path alias mapping: `"@/*": ["./src/*"]` to provide stable and clean module resolution.
   - Cleaned up compiler options compatible with TypeScript 5.8+.

2. **`app.json`**:
   - Verified that Expo Router automatically discovers `src/app` (built-in support in Expo Router SDK 50+).
   - Removed non-plugin library `@react-native-picker/picker` from the `plugins` array to ensure strict Expo CLI config compatibility.

3. **`src/app/**`**:
   - Automated import migration replacing relative `../src/`, `../../src/`, and `../../../src/` prefixes with the clean `@/` root alias (`@/services/...`, `@/theme/...`, `@/components/...`, `@/utils/...`, `@/hooks/...`, `@/features/...`).

---

## 4. Verification Results

- **Expo Configuration Check (`npx expo config --type public`)**: Exited with code `0` (clean manifest resolution).
- **TypeScript Typecheck (`npx tsc --noEmit`)**: Exited with code `0` (Zero compiler errors across all routes in `src/app/`).
