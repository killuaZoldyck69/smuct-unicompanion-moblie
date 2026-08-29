# Test Colocation Policy Log: B7.5

## Date: 2026-08-29
## Target: React Native / Expo Mobile Application (`smuct-unicompanion-moblie`)

---

## 1. Audit Finding
- An audit of the `smuct-unicompanion-moblie` codebase confirmed that **no unit, integration, or snapshot test files currently exist** in the repository.
- Per the project guidelines, no empty/speculative test files were scaffolded.

---

## 2. Established Colocation Policy
When tests are introduced into this codebase, they must strictly follow [Expo's Official App Folder Structure Best Practices](https://expo.dev/blog/expo-app-folder-structure-best-practices) for test colocation:

1. **Colocated Side-by-Side**:
   - Test files must sit directly next to the source code file they test.
   - Do **NOT** create a separate top-level or module-level `__tests__/` directory.

2. **File Naming Convention**:
   - Use the `.test.ts` or `.test.tsx` extension matching the kebab-case source filename:
     - Component: `src/components/ui/button.tsx` → `src/components/ui/button.test.tsx`
     - Screen: `src/screens/home/index.tsx` → `src/screens/home/index.test.tsx`
     - Service: `src/services/hub-service.ts` → `src/services/hub-service.test.ts`
     - Utility: `src/utils/date-formatter.ts` → `src/utils/date-formatter.test.ts`
     - Hook: `src/hooks/use-countdown.ts` → `src/hooks/use-countdown.test.ts`

3. **CI / Test Runner Discovery**:
   - Jest / Vitest configuration will automatically discover `*.test.ts(x)` patterns colocated in the `src/` directory tree.
