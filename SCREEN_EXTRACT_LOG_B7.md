# Screen Extraction Log: B7.2 — Create `src/screens/` and Extract Screen UI

## Date: 2026-08-29
## Target: React Native / Expo Mobile Application (`smuct-unicompanion-moblie`)

---

## 1. Overview
In accordance with [Expo's Official App Folder Structure Best Practices](https://expo.dev/blog/expo-app-folder-structure-best-practices), complex screens have been extracted out of `src/app/` route files and organized into dedicated `src/screens/<feature-name>/index.tsx` screen modules. Screen-specific sub-components have been extracted to `src/screens/<feature-name>/components/`.

Route files in `src/app/` are now thin entry points responsible solely for routing, reading URL parameters via `useLocalSearchParams`, and rendering the screen components.

---

## 2. Extracted Screens Summary

| # | Route File (`src/app/`) | Target Screen (`src/screens/`) | Sub-Components Extracted | Route Concern Handled |
|---|---|---|---|---|
| 1 | `(tabs)/index.tsx` | `src/screens/home/index.tsx` | `components/weather-widget.tsx` | Pure render `<Home />` |
| 2 | `(tabs)/hubs.tsx` | `src/screens/hubs/index.tsx` | — | Pure render `<Hubs />` |
| 3 | `(tabs)/forum.tsx` | `src/screens/forum/index.tsx` | — | Pure render `<Forum />` |
| 4 | `(tabs)/blood.tsx` | `src/screens/blood/index.tsx` | — | Pure render `<Blood />` |
| 5 | `(tabs)/menu.tsx` | `src/screens/menu/index.tsx` | — | Pure render `<Menu />` |
| 6 | `(auth)/login.tsx` | `src/screens/login/index.tsx` | — | Pure render `<Login />` |
| 7 | `(auth)/register.tsx` | `src/screens/register/index.tsx` | — | Pure render `<Register />` |
| 8 | `(auth)/onboard.tsx` | `src/screens/onboard/index.tsx` | — | Pure render `<Onboard />` |
| 9 | `hub/[id].tsx` | `src/screens/hub-detail/index.tsx` | `components/assessment-card.tsx` | Reads `id` via `useLocalSearchParams`, passes `<HubDetail hubId={id as string} />` |
| 10 | `field-booking.tsx` | `src/screens/field-booking/index.tsx` | — | Pure render `<FieldBooking />` |
| 11 | `cgpa-calculator.tsx` | `src/screens/cgpa-calculator/index.tsx` | — | Pure render `<CGPACalculator />` |

---

## 3. Additional Kebab-Case Refactoring
Per Expo's current (Jan 2026) naming guidelines, the following profile components were renamed to kebab-case:
- `src/components/profile/StudentProfile.tsx` → `src/components/profile/student-profile.tsx`
- `src/components/profile/TeacherProfile.tsx` → `src/components/profile/teacher-profile.tsx`
- `src/components/profile/AdminProfile.tsx` → `src/components/profile/admin-profile.tsx`
- Profile tab route `src/app/(tabs)/profile.tsx` updated with kebab-case imports.

---

## 4. Verification Results

- **TypeScript Compilation (`npx tsc --noEmit`)**:
  - Run after each screen extraction.
  - Final full codebase check exited with code `0` (Zero compiler/type errors).
- **Expo Config Validation (`npx expo config --type public`)**:
  - Exited with code `0`.
