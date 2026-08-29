# PATCH B1: Mobile Critical Crash-Preventing Fixes

## 1. Overview of Fixes
This patch resolves four critical crash vectors in the mobile application (`smuct-unicompanion-moblie`):

1. **Unmatched Route Crash on "Digital Vault" (`app/(tabs)/menu.tsx`)**: Removed the non-existent `/vault` route reference from `MENU_ITEMS`.
2. **Unmatched Route Crash on Login Fallback (`app/(auth)/login.tsx`)**: Fixed redirect target from non-existent `"/(tabs)/home"` to valid tab route `"/(tabs)"`.
3. **Fake Success Toast on Profile Error (`app/(auth)/login.tsx`)**: Fixed the non-404 error catch block on `/students/profile` check to display an error toast instead of a "Welcome back!" success toast.
4. **Obscured FAB Button (`app/(tabs)/blood.tsx`)**: Replaced hardcoded `bottom: 24` with dynamic safe-area insets (`bottom: insets.bottom + 100`), aligning with `forum.tsx` to prevent the FAB from being obscured behind the floating tab bar.

---

## 2. File-by-File Changes

### 1. `app/(tabs)/menu.tsx`
- **Change**: Removed `{ id: "vault", title: "Digital Vault", ... route: "/vault" }` from `MENU_ITEMS`.
- **Reason**: There is no `app/vault.tsx` route file in the repository. Tapping this item previously caused Expo Router to throw an fatal "Unmatched Route" screen.

### 2 & 3. `app/(auth)/login.tsx`
- **Change**:
  - Redirect on successful student profile fetch now correctly targets `"/(tabs)"`.
  - For non-404 profile fetch errors (500, network failure, etc.), replaced the false success toast and broken `router.replace("/(tabs)/home")` with a dedicated error toast (`Profile Check Failed`), preventing unauthorized/broken navigation state.

```typescript
// app/(auth)/login.tsx
try {
  const profileRes = await api.get("/students/profile", {
    headers: freshToken ? { Authorization: `Bearer ${freshToken}` } : {},
  });

  if (profileRes.data?.data) {
    Toast.show({ type: "success", text1: "Welcome back!" });
    router.replace("/(tabs)");
  } else {
    router.replace("/(auth)/onboard");
  }
} catch (profileError: any) {
  if (profileError.response && profileError.response.status === 404) {
    console.log("No student profile found (404), redirecting to onboarding.");
    router.replace("/(auth)/onboard");
  } else {
    console.error("Profile check failed but it wasn't a 404:", profileError.message);
    Toast.show({
      type: "error",
      text1: "Profile Check Failed",
      text2:
        profileError.response?.data?.message ||
        "Could not load student profile. Please try again.",
    });
  }
}
```

### 4. `app/(tabs)/blood.tsx`
- **Change**:
  - Imported `useSafeAreaInsets` from `react-native-safe-area-context`.
  - Initialized `const insets = useSafeAreaInsets();`.
  - Applied dynamic FAB bottom offset: `style={[styles.fab, { bottom: insets.bottom + 100 }]}`.
  - Removed fixed `bottom: 24` from `styles.fab`.
- **Reason**: The floating pill tab bar has a minimum bottom of 24 and height of 72. Hardcoded `bottom: 24` caused the FAB to render underneath the tab bar.

---

## 3. Manual Testing Checklist & Verification Protocol

### Test 1: Tap Through Menu Items (Verify No Crash)
- **Steps**:
  1. Open app and navigate to Menu tab (`/(tabs)/menu`).
  2. Verify that "Digital Vault" is no longer listed in the grid.
  3. Tap through remaining items (e.g., Noticeboard, Bus Schedule, Campus Forum, Blood Requests).
- **Result**:
  - [x] No "Unmatched Route: /vault" error.
  - [x] All present items navigate to valid routes.

---

### Test 2: Student Login Flow (Success & 404 Onboarding)
- **Steps**:
  1. Sign in with student credentials having an active profile.
  2. Verify toast says "Welcome back!" and navigates to `"/(tabs)"` (Home dashboard).
  3. Sign in with newly registered account without a profile (404).
- **Result**:
  - [x] Correctly redirects to `"/(auth)/onboard"`.

---

### Test 3: Profile Check Server / Network Error Path
- **Steps**:
  1. Simulate an API failure or network drop when hitting `/students/profile` after sign-in.
  2. Verify UI response.
- **Result**:
  - [x] Error toast displayed: *"Profile Check Failed"*.
  - [x] No false "Welcome back!" toast.
  - [x] No crash attempting to navigate to non-existent `"/(tabs)/home"`.

---

### Test 4: Visual Inspection of Blood FAB Position
- **Steps**:
  1. Navigate to the Blood tab (`/(tabs)/blood`).
  2. Observe the position of the red `+` FAB relative to the bottom floating navigation bar.
- **Result**:
  - [x] The FAB floats at `insets.bottom + 100` (~124px+ from bottom), clearly visible and clickable above the pill tab bar.
  - [x] Matches the design pattern of the FAB in `app/(tabs)/forum.tsx`.
