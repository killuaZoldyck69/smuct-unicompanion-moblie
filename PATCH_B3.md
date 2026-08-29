# PATCH B3: Mobile Security Fixes

## 1. Issue Overview
- **Finding ID**: Audit High Finding #3 (Track B — B3)
- **Target Project**: `smuct-unicompanion-moblie`
- **Scope**: Hardcoded dev fallbacks, authentication race conditions, type-unsafe role casts, unhandled session expiry, unguarded admin screens, redundant Supabase client instances, and build configuration secrets leaks.

---

## 2. Detailed Fixes Applied

### 1. Hard Build-Time API URL Enforcement
- **Files**: [`src/services/api.ts`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/src/services/api.ts) & [`src/services/auth-client.ts`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/src/services/auth-client.ts)
- Removed hardcoded LAN IP fallback (`|| "http://192.168.0.102:5000"`).
- Replaced with build-time failure check:
  ```typescript
  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
  }
  ```

---

### 2. Eliminated Token Storage Race Condition
- **File**: [`app/(auth)/login.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28auth%29/login.tsx)
- Removed manual `SecureStore.setItemAsync("better-auth.session_token", freshToken)` call and manual header injection.
- The `expoClient` plugin registered in `src/services/auth-client.ts` now exclusively manages session token storage and authorization headers without race conditions.

---

### 3. Type-Safe `useCurrentUser` Hook & Role System
- **Files Created**:
  - [`src/types/auth.ts`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/src/types/auth.ts): Defines `UserRole = "STUDENT" | "TEACHER" | "ADMIN"` and typed `User`.
  - [`src/hooks/useCurrentUser.ts`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/src/hooks/useCurrentUser.ts): Reads session once, enforces strict role validation with safe `"STUDENT"` fallback, and exposes typed `{ user, role, session, isPending, isAuthenticated }`.
- **Replaced 8 Unchecked `(session.user as any).role` Call Sites**:
  1. [`app/(tabs)/_layout.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/_layout.tsx)
  2. [`app/(tabs)/profile.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/profile.tsx)
  3. [`app/(tabs)/index.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/index.tsx)
  4. [`app/(tabs)/forum.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/forum.tsx)
  5. [`app/(tabs)/blood.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/blood.tsx)
  6. [`app/(tabs)/menu.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/menu.tsx)
  7. [`app/(auth)/login.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28auth%29/login.tsx)
  8. [`app/bus-schedule.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/bus-schedule.tsx)

---

### 4. Unauthenticated Session / Token Expiry Redirect
- **File**: [`app/(tabs)/_layout.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/_layout.tsx)
- Added session state watcher:
  ```typescript
  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isPending, isAuthenticated, router]);
  ```

---

### 5. Admin Screen Route Guards
- **Files**:
  - [`app/(tabs)/admin_users.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/admin_users.tsx)
  - [`app/(tabs)/admin_add_teacher.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/admin_add_teacher.tsx)
  - [`app/(tabs)/admin_calendar.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28tabs%29/admin_calendar.tsx)
- Added immediate redirect guards (`if (!isPending && (!isAuthenticated || role !== "ADMIN")) router.replace("/(tabs)");`) preventing unauthorized access via deep links.

---

### 6. Centralized Supabase Client Singleton
- **File Created**: [`src/services/supabase.ts`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/src/services/supabase.ts)
- **Refactored Files to Use Singleton**:
  1. [`app/(auth)/onboard.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/app/%28auth%29/onboard.tsx)
  2. [`src/components/profile/StudentProfile.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/src/components/profile/StudentProfile.tsx)
  3. [`src/components/profile/TeacherProfile.tsx`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/src/components/profile/TeacherProfile.tsx)

---

### 7. EAS Build Profile Secrets Sanitization
- **File**: [`eas.json`](file:///d:/Mobile%20APP%20Development/All%20Projects/smuct-unicompanion/smuct-unicompanion-moblie/eas.json)
- Removed plaintext inline credentials (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`) from `eas.json` preview profile to be provided securely via EAS Secrets.

---

## 3. Verification Results
```json
[
  { "test": "1. Student role resolution", "passed": true },
  { "test": "2. Teacher role resolution", "passed": true },
  { "test": "3. Admin role resolution", "passed": true },
  { "test": "4. Unknown/Malicious role fallback to STUDENT", "passed": true },
  { "test": "5. Null session resolution", "passed": true }
]
```
