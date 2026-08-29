# AUDIT_MOBILE.md — smuct-unicompanion-moblie Pre-Play-Store Audit

> **Audit date:** 2026-08-23  
> **Auditor:** Antigravity (read-only session — zero file changes made)  
> **SDK:** Expo ~56.0.12 · React Native 0.85.3 · React 19.2.3

---

## 1. Current Structure

```
smuct-unicompanion-moblie/
│
├── app/                          # Expo Router file-system routes
│   ├── _layout.tsx               # Root layout: QueryClient + SafeAreaProvider + Toast
│   ├── index.tsx                 # Splash / landing screen (animated Bento grid)
│   │
│   ├── (auth)/                   # Unauthenticated route group (no _layout.tsx)
│   │   ├── login.tsx             # Email/password sign-in + role routing
│   │   ├── register.tsx          # Sign-up
│   │   ├── onboard.tsx           # Student profile completion (multi-step)
│   │   ├── forgot-password.tsx   # Request reset link
│   │   ├── reset-password.tsx    # Set new password via deep-link token
│   │   └── verify-email.tsx      # Email verification stub (placeholder UI only)
│   │
│   ├── (tabs)/                   # Tab navigator (bottom pill bar)
│   │   ├── _layout.tsx           # Tab definitions; role-based href toggling
│   │   ├── index.tsx             # Home dashboard (weather, classes, notices)
│   │   ├── hubs.tsx              # Course Hubs list
│   │   ├── forum.tsx             # Campus Forum feed
│   │   ├── blood.tsx             # Blood Donation feed (hidden tab, nav via Quick Actions)
│   │   ├── menu.tsx              # Feature grid / "Explore"
│   │   ├── profile.tsx           # Role-switch wrapper → ProfileComponent
│   │   ├── community.tsx         # STUB — 9 lines, plain <Text> only
│   │   ├── admin_users.tsx       # Admin: manage students & teachers
│   │   ├── admin_add_teacher.tsx # Admin: add teacher account
│   │   └── admin_calendar.tsx    # Admin: upload academic calendar
│   │
│   ├── admin/                    # Admin-only full-screen routes (accessed via menu)
│   │   ├── alumni.tsx
│   │   ├── blood.tsx
│   │   ├── complaints.tsx
│   │   ├── events.tsx
│   │   ├── field-booking.tsx
│   │   ├── forum.tsx
│   │   └── notices.tsx
│   │
│   ├── hub/                      # Hub detail screens
│   │   ├── [id].tsx              # Hub main screen (6 sub-tabs)
│   │   └── [id]/
│   │       ├── assessments.tsx   # Submitted assessment list
│   │       └── reviews.tsx       # Hub review/rating
│   │
│   ├── blood/[id].tsx            # Blood request detail
│   ├── forum/[id].tsx            # Forum post detail + replies
│   │
│   ├── academic_calendar.tsx     # Timeline view
│   ├── admin-bus-manage.tsx      # Admin: bus schedule CRUD
│   ├── alumni.tsx                # Alumni directory
│   ├── bus-schedule.tsx          # Bus schedule accordion
│   ├── cgpa-calculator.tsx       # CGPA calculator + hub auto-fill
│   ├── complaints.tsx            # Student complaints
│   ├── directory.tsx             # Teachers directory
│   ├── events.tsx                # Campus events
│   ├── exams.tsx                 # Exam routine (derived from hub data)
│   ├── field-booking.tsx         # Sports field booking
│   ├── my-schedule.tsx           # Weekly class schedule
│   └── notices.tsx               # Notice board
│
├── src/                          # Non-routed source code
│   ├── assets/                   # Static images (icons, splash, illustrations)
│   ├── components/
│   │   ├── hub/                  # Hub-specific UI components and modals
│   │   │   ├── CreateHubModal.tsx
│   │   │   ├── EditHubModal.tsx
│   │   │   ├── HubCard.tsx
│   │   │   ├── HubHeader.tsx
│   │   │   ├── SearchableTeacherSelect.tsx
│   │   │   ├── UploadResourceModal.tsx
│   │   │   ├── cards/            # AnnouncementCard, AssessmentCard, DiscussionCard,
│   │   │   │                     # MemberRow, ResourceCard
│   │   │   └── modals/           # 8 modal components
│   │   └── profile/
│   │       ├── AdminProfile.tsx
│   │       ├── StudentProfile.tsx  (1190 lines — largest single file)
│   │       └── TeacherProfile.tsx  (~1200 lines)
│   │
│   ├── data/                     # Static JSON / TS data files
│   │   ├── alumni.json           # Static alumni seed data
│   │   ├── bus-schedule.json     # Static fallback bus data
│   │   ├── calender.json         # Static academic calendar fallback
│   │   ├── notice.json           # Static notice fallback
│   │   └── programs.ts           # University program list (used in onboard.tsx)
│   │
│   ├── services/
│   │   ├── api.ts                # Axios instance with SecureStore interceptor
│   │   └── auth-client.ts        # better-auth client (expoClient plugin)
│   │
│   ├── theme/
│   │   ├── colors.ts             # Material You-style color tokens
│   │   ├── layout.ts             # Spacing, rounding, shadow tokens
│   │   └── typography.ts         # Manrope font scale (CONFLICTS with Plus Jakarta Sans used inline)
│   │
│   └── utils/
│       └── dateFormatter.ts      # Single date formatter util (duplicated in 3 screens)
│
├── .env                          # Dev secrets (gitignored by name — but history may retain)
├── .gitignore                    # Lists .env and eas.json
├── app.json                      # Expo config (missing splash, wrong adaptive icon paths)
├── eas.json                      # EAS build profiles (preview env values baked in plaintext)
├── package.json
└── tsconfig.json                 # strict: true
```

---

## 2. Coupling Issues

All fetches currently live inside screen or component functions with no intermediate hook or service layer. Each finding below references exact file + line.

### 2.1 Auth flow business logic inside `login.tsx`

**File:** `app/(auth)/login.tsx` **Lines 36–110**  
`handleLogin` does four sequential async operations directly in the component:
1. Calls `authClient.signIn.email()`
2. Manually extracts the raw token from the response and writes it to `SecureStore`
3. Calls `authClient.getSession()` a second time to read the role
4. Makes a `GET /students/profile` call to decide the post-login route

This is multi-step auth + onboarding orchestration that belongs in a `useLoginFlow` hook or `authService.ts`. The screen should receive a single `login(email, password)` function that returns a `{ destination }` result.

### 2.2 Supabase image upload directly in `onboard.tsx`

**File:** `app/(auth)/onboard.tsx` **Lines 88–168**  
`handleCompleteProfile` performs: image upload to Supabase storage → core profile POST → blood group PATCH → image URL PATCH — all sequentially in a single ~80-line function inside the screen. This is multiple-entity write orchestration that should be extracted to `src/services/studentService.ts` or a `useOnboarding` hook.

### 2.3 Supabase client instantiated at module level in 3 separate files

- `app/(auth)/onboard.tsx` L30–33
- `src/components/profile/StudentProfile.tsx` L35–38
- `src/components/profile/TeacherProfile.tsx` L34–37

Each independently calls `createClient(SUPABASE_URL, SUPABASE_KEY)`. This creates three separate Supabase SDK instances in memory. Extract to a shared singleton at `src/services/supabase.ts`.

### 2.4 Inline `queryFn` lambdas — no service layer for API endpoints

Every screen writes raw inline `async () => (await api.get('/endpoint')).data?.data || []` directly as `queryFn`. API endpoint paths are repeated across files with no central ownership:

- `app/(tabs)/index.tsx` L95 — `/hubs/my`
- `app/(tabs)/index.tsx` L100 — `/notices`
- `app/(tabs)/forum.tsx` L65 — `/forum`
- `app/(tabs)/hubs.tsx` L76 — `/hubs/my`
- `app/(tabs)/hubs.tsx` L81 — `/hubs/teachers`
- `app/(tabs)/blood.tsx` L65 — `/blood`
- `app/alumni.tsx` L42 — `/alumni`
- `app/notices.tsx` L44 — `/notices`
- `app/events.tsx` L33 — `/events`
- `app/directory.tsx` L41 — `/directory/teachers`
- `app/cgpa-calculator.tsx` L55 — `/hubs/my`
- `app/my-schedule.tsx` L60 — `/hubs/my`
- `app/exams.tsx` L49 — `/hubs/my`
- `app/academic_calendar.tsx` L52 — `/calendars`
- `app/bus-schedule.tsx` L...  — `/buses`
- `app/field-booking.tsx` L66, L73, L81 — `/field/settings`, `/field/my-bookings`, `/field/schedule`
- `app/complaints.tsx` L55 — `/complaints/my`

A change to any endpoint path requires a grep across all files. Extract to domain service files (e.g. `src/features/hubs/hubService.ts`).

### 2.5 Data transformation in Home screen render function

**File:** `app/(tabs)/index.tsx` **Lines 116–176**  
`todaysClasses` (useMemo, 36 lines) parses `hub.weeklyClassSchedule` (a JSON string or array), iterates every hub membership, filters by today's weekday, and builds a flat class list. Lines 155–176 independently compute the hourly weather forecast. Both are meaningful data-transformation tasks that should be extracted to `src/hooks/useTodaysClasses.ts` and `src/hooks/useWeatherForecast.ts`.

### 2.6 Duplicate `formatDate` / `formatTime` helpers defined per-file

- `src/utils/dateFormatter.ts` — canonical location (1 formatter)
- `app/field-booking.tsx` L26–45 — defines its own `formatDate` + `formatTime`
- `app/complaints.tsx` L26–33 — defines its own `formatDate`
- `app/(tabs)/blood.tsx` L29–41 — defines its own `format12HourTime`

These should all be consolidated in `src/utils/dateFormatter.ts`.

### 2.7 `StudentProfile.tsx` and `TeacherProfile.tsx` are 1000+ line god components

**File:** `src/components/profile/StudentProfile.tsx` **Lines 41–58**  
API fetcher functions (`fetchProfile`, `updateProfile`, `updateProfileImageAPI`) are defined as module-level functions inside the component file. The component also contains image-picking logic (expo-image-picker), base64 decoding, Supabase upload, and subsequent API PATCH — all in the same 1190-line file. The data layer should move to `src/services/studentService.ts` and a `useStudentProfile` hook.

### 2.8 `useCountdown` custom hook defined inside a route file

**File:** `app/hub/[id].tsx` **Lines 58–84**  
`useCountdown` hook is defined inline inside the route file. It should live in `src/hooks/useCountdown.ts`.

---

## 3. Security Issues

### 3.1 `.env` and `eas.json` gitignore situation — Supabase anon key committed in plaintext

**File:** `.gitignore` L42-43  
Both `.env` and `eas.json` are listed in `.gitignore`. However, `.gitignore` rules only prevent *future* tracking — if either file was ever committed before this rule was added, it remains in git history and is visible in any clone. Run `git log --all -- .env` and `git log --all -- eas.json` to verify.

More critically, the **`eas.json` `preview` build profile bakes credentials as plaintext env values**:

```json
"EXPO_PUBLIC_SUPABASE_URL": "https://taikthjeobywwdjqgkdi.supabase.co",
"EXPO_PUBLIC_SUPABASE_ANON_KEY": "sb_publishable_1sQ3IAX0ApL8vs_I8Px-PA_QAiqv3dN"
```

This is a Supabase publishable/anon key. While anon keys are intended for client use, together with the project URL they allow unauthenticated storage bucket access. The `avatars` bucket is written to in `onboard.tsx` and both profile components without any visible RLS (Row-Level Security) check from the client side. Audit Supabase RLS rules for the `avatars` bucket. Move secrets to EAS Secrets (`eas secret:create`) rather than inline env values.

### 3.2 Hardcoded developer LAN IP as fallback in two service files

- `src/services/api.ts` **L7**: `|| "http://192.168.0.102:5000"`
- `src/services/auth-client.ts` **L7**: `|| "http://192.168.0.102:5000"`

If `EXPO_PUBLIC_API_BASE_URL` is absent from the environment at build time, the app silently falls back to an unreachable local IP. Remove the fallback or replace it with a build-time error (`throw new Error("EXPO_PUBLIC_API_BASE_URL is not set")`).

### 3.3 Token storage uses SecureStore — correctly implemented

Token storage via `expo-secure-store` is the correct approach for React Native. The `api.ts` interceptor reads `better-auth.session_token` from SecureStore on every request. This is correct.

**However:** `login.tsx` L54–58 manually extracts `data.token` from the `signIn.email()` response using `(data as any).token` and writes it to SecureStore using the same key (`better-auth.session_token`) that the `expoClient` plugin also manages internally. This creates a potential race condition. Rely on the plugin exclusively; remove the manual `SecureStore.setItemAsync` call at `login.tsx` L58.

### 3.4 Session user role cast to `any` without validation — 8+ call sites

`(session.user as any).role` is used without validation in:
- `app/(tabs)/_layout.tsx` L23
- `app/(tabs)/profile.tsx` L25
- `app/(tabs)/index.tsx` L90
- `app/(tabs)/forum.tsx` L52
- `app/(tabs)/blood.tsx` L47
- `app/(tabs)/menu.tsx` L198
- `app/(auth)/login.tsx` L63
- `app/bus-schedule.tsx` L128

If the API returns an unexpected role string, no screen handles it. Define a `UserRole = "STUDENT" | "TEACHER" | "ADMIN"` type and validate at a single parse boundary (a `useCurrentUser` hook).

### 3.5 No route-level auth guard — session expiry leaves users stranded in the app

`app/(tabs)/_layout.tsx` shows a spinner while `isPending` and renders content once a session exists, but if the session becomes null later (token expiry, forced logout on another device), the user remains on the tab screens. Implement a guard: when `!isPending && !session`, call `router.replace("/(auth)/login")`.

### 3.6 Admin screens have no client-side role enforcement

`admin_users`, `admin_add_teacher`, `admin_calendar` are hidden via `href: null` in the tab bar, but a knowledgeable user can navigate directly via a crafted deep link. These screens contain no role check. Add a guard at the top of each admin screen: if `userRole !== "ADMIN"`, redirect.

### 3.7 API response data used without shape validation

Every `queryFn` assumes `response.data?.data || []`. If the API returns `{ error: "..." }` with HTTP 200, the screen renders an empty list with no error indication. There is no Zod or equivalent runtime schema validation on any API response.

---

## 4. UI/UX Issues

### 4.1 Dual font system — "Plus Jakarta Sans" vs "Manrope" — neither is loaded

`src/theme/typography.ts` declares **Manrope** as the design system font. However, auth screens (`login.tsx`, `register.tsx`, `onboard.tsx`), the splash screen (`index.tsx`), and multiple tab screens (`index.tsx` home, `forum.tsx`, `hubs.tsx`) all use `fontFamily: "Plus Jakarta Sans"` inline.

**Neither font is registered.** `expo-font` appears in `app.json` plugins but no `useFonts()` or `Font.loadAsync()` call exists in `app/_layout.tsx`. React Native silently falls back to the system font (Roboto on Android). All custom weight/letter-spacing values produce incorrect results.

Affected files with inline "Plus Jakarta Sans":
- `app/index.tsx` (L235, L242, L269...)
- `app/(auth)/login.tsx` (L291, L319, L358, L374...)
- `app/(auth)/register.tsx` (L304, L326...)
- `app/(auth)/onboard.tsx` (L467, L475...)
- `app/(tabs)/index.tsx` (L443, L449...)
- `app/(tabs)/forum.tsx` (L413, L431...)
- `app/(tabs)/hubs.tsx` (L332, L351...)

**Action required:** Pick one font, register it in `_layout.tsx` with `useFonts`, update `theme/typography.ts`, eliminate all inline `fontFamily` strings.

### 4.2 `community.tsx` is a visible 9-line stub

**File:** `app/(tabs)/community.tsx`  
Renders `<Text>Community Forum</Text>` in an unstyled `<View>`. It is registered as `href: null` in the tab layout but is navigable if a user ever gets a link to `/community`. White screen with plain text — unacceptable for release.

### 4.3 `verify-email.tsx` success/error states have no styled UI

**File:** `app/(auth)/verify-email.tsx` **Lines 50–59**  
The comment says literally `// ... Insert your existing Verify Email UI here ...`. Success: plain `<Text>Email Verified! Redirecting...</Text>`. Error: plain `<Text>Invalid or expired verification link.</Text>`. No styling, no retry button, no navigation link.

### 4.4 `blood.tsx` (tabs) missing dynamic safe-area top padding

**File:** `app/(tabs)/blood.tsx` **styles.header** (L398)  
`paddingTop: 60` — hardcoded magic number. Every other major screen uses `useSafeAreaInsets().top` dynamically. On tall-notch devices (Pixel 9 Pro XL, Samsung with camera cutout), content will clip.

### 4.5 `blood.tsx` FAB overlaps tab bar

**File:** `app/(tabs)/blood.tsx` **L526–537**  
FAB has `bottom: 24` hardcoded. The pill tab bar sits at minimum `bottom: 24` with `height: 72`. The FAB will be hidden behind the tab bar on most devices. Compare with `forum.tsx` where FAB is `bottom: insets.bottom + 100`, which is calculated correctly.

### 4.6 `menu.tsx` header has hardcoded `paddingTop: 60`

**File:** `app/(tabs)/menu.tsx` **L250**  
Same issue as §4.4 — will clip on tall-notch devices.

### 4.7 No error state rendered when `isError` is true — silently shows empty list

`isError` is destructured but never used in JSX in:
- `app/alumni.tsx` L38 — `isError` unused in JSX
- `app/directory.tsx` L37 — `isError` unused in JSX
- `app/exams.tsx` L45 — `isError` unused in JSX
- `app/academic_calendar.tsx` L48 — `isError` unused in JSX
- `app/my-schedule.tsx` L56 — `isError` unused in JSX
- `src/components/profile/StudentProfile.tsx` L122 — `isError` unused in JSX

On API failure, users see "No classes found" / "No Alumni Found" rather than a meaningful error message with a retry action.

### 4.8 Multiple files import `SafeAreaView` from `react-native` instead of `react-native-safe-area-context`

`SafeAreaView` from the core `react-native` package does not handle Android gesture nav bars. Affected:
- `app/notices.tsx` L11
- `app/field-booking.tsx` L11
- `app/complaints.tsx` L11
- `app/alumni.tsx` L11
- `app/directory.tsx` L11
- `app/forum/[id].tsx` L15
- `app/hub/[id]/reviews.tsx` L17
- `app/(tabs)/blood.tsx` L11 (in-modal only)
- `app/(tabs)/admin_users.tsx` L11 (in-modal only)

(Correctly using `react-native-safe-area-context`: `my-schedule.tsx`, `exams.tsx`, `cgpa-calculator.tsx`, `hub/[id].tsx`.)

### 4.9 Zero accessibility labels anywhere in the codebase

`grep` for `accessibilityLabel`, `accessible`, `accessibilityRole`, or `accessibilityHint` across all `.tsx` and `.ts` files returns **zero results**. Every button, image, and form input is completely unannotated for screen readers. This is a Google Play accessibility compliance issue.

### 4.10 `blood.tsx` filter pills display raw API enum strings as UI labels

**File:** `app/(tabs)/blood.tsx` L247–265  
Filter labels are `["URGENT", "ALL", "FULFILLED"]` — uppercase enum strings rendered directly as UI text. Should be "Urgent", "All Requests", "Fulfilled".

### 4.11 Login screen has commented-out brand bar leaving a visible gap

**File:** `app/(auth)/login.tsx` **Lines 140–149**  
`<View style={styles.topBar}>` is empty — all its children (logo image, brand text, icon) are commented out. This leaves an invisible ~48px gap at the top of the login screen. Dead styles `topBarText` and `topLogo` also remain in the stylesheet.

### 4.12 Non-404 profile error in login shows success toast incorrectly

**File:** `app/(auth)/login.tsx` **Lines 96–98**  
If the `/students/profile` check fails with a 500 or network error, the code executes:
```js
Toast.show({ type: "success", text1: "Welcome back!" });
router.replace("/(tabs)/home");
```
A server error is presented to the user as a successful login — both the toast type and the message are wrong.

---

## 5. Navigation Issues

### 5.1 `/vault` route referenced in menu but does not exist — will crash

**File:** `app/(tabs)/menu.tsx` **L75-L78**  
```js
{ id: "vault", title: "Digital Vault", icon: "folder",
  roles: ["STUDENT", "TEACHER"], route: "/vault" }
```
No file `app/vault.tsx` exists. Pressing "Digital Vault" in the menu for any student or teacher will throw an Expo Router "Unmatched Route" error screen. This is a production crash on the primary feature menu.

### 5.2 Splash screen always shows — no session check for returning users

**File:** `app/index.tsx`  
The landing screen always renders. A returning user with a valid session must still tap "Get Started" and navigate through login. Implement a `useEffect` that checks `authClient.getSession()` on mount and redirects to `/(tabs)` if a session exists.

### 5.3 `/(tabs)/home` referenced in login does not match any Expo Router route

**File:** `app/(auth)/login.tsx` **L97**  
`router.replace("/(tabs)/home")` — The tab is named `index` (file: `app/(tabs)/index.tsx`), not `home`. The route `/(tabs)/home` does not exist. This code path fires on non-404 profile-check errors and will throw "Unmatched Route". Should be `router.replace("/(tabs)")`.

### 5.4 No `BackHandler` on fullScreen modals — hardware back exits the app on Android

- `app/(tabs)/forum.tsx` L322 — fullScreen compose modal
- `app/(tabs)/blood.tsx` L300 — pageSheet form modal

Neither registers a `BackHandler` listener. On Android, pressing the hardware back button while a fullScreen modal is open closes the entire tab navigation stack rather than dismissing the modal.

### 5.5 No `_layout.tsx` in `(auth)` group — inconsistent stack behavior

`app/(auth)/` has no `_layout.tsx`. Navigation between `login → register → forgot-password` uses `router.push()` without a Stack wrapper, leaving Android back-stack behavior to Expo Router's default, which may not match the intended sheet presentation.

### 5.6 Deep link path for email verification is unclear and untested

`app.json` registers the scheme `smuct-unicompanion://`. `forgot-password.tsx` L39 sets `redirectTo: "smuct-unicompanion://reset-password"`. The `verify-email.tsx` screen sits at `/(auth)/verify-email`. No explicit `expo-linking` configuration confirms this path resolves correctly. Test both deep links before Play Store submission.

---

## 6. Dependency Issues

### 6.1 `expo-secure-store` missing from `app.json` plugins — will break on EAS build

**File:** `app.json` L26–31  
`expo-secure-store` is heavily used (`api.ts`, `auth-client.ts`, `StudentProfile.tsx`) but is absent from the `plugins` array. It requires its config plugin to configure the Android Keystore and iOS Keychain entitlements in a managed-workflow build. Without this entry, SecureStore will fail on certain Android API levels in production.

```json
// Required addition to app.json plugins:
"expo-secure-store"
```

### 6.2 `expo-image-picker` missing from `app.json` plugins

`expo-image-picker` is used in `onboard.tsx`, `StudentProfile.tsx`, and `TeacherProfile.tsx`. Without its plugin entry in `app.json`, the EAS build will not add `NSPhotoLibraryUsageDescription` (iOS) or `READ_MEDIA_IMAGES` (Android 13+) permissions. The app will crash when trying to open the image picker on iOS, and may be rejected by Google Play for missing manifest declarations.

```json
// Required addition to app.json plugins:
["expo-image-picker", { "photosPermission": "Allow $(PRODUCT_NAME) to access your photos." }]
```

### 6.3 `@react-native-picker/picker` missing from `app.json` plugins

`@react-native-picker/picker` (used in `blood.tsx` L22, `complaints.tsx` L19, `cgpa-calculator.tsx` L16) requires its config plugin to generate correct native modules in managed Expo builds. `@react-native-community/datetimepicker` is listed in `app.json` plugins (L29) but `@react-native-picker/picker` is not. Add `"@react-native-picker/picker"` to the plugins array.

### 6.4 TypeScript 6.0.3 is a beta / pre-release version

**File:** `package.json` L42  
`"typescript": "~6.0.3"` — TypeScript 6 is pre-release. Expo SDK 56 recommends TypeScript `~5.8.x`. Pre-release TypeScript can produce unexpected type errors and incompatibilities with editor tooling. Downgrade to `~5.8.3`.

### 6.5 `react-native-web` as a runtime dependency in a mobile-only app

**File:** `package.json` L38  
`"react-native-web": "^0.21.2"` is in `dependencies`. For a Play Store Android-only submission, this adds unnecessary bundle weight. Move to `devDependencies` or remove entirely if web is not a target.

### 6.6 No ESLint or code-quality tooling in devDependencies

**File:** `package.json` L40–43  
`devDependencies` contains only `@types/react` and `typescript`. No ESLint, `eslint-plugin-react-native`, `eslint-plugin-react-hooks`, or Prettier. `as any` casts, unused imports, and style inconsistencies are never caught automatically.

### 6.7 `app.json` adaptive icon configuration uses wrong image files

**File:** `app.json` L14–19  
All three adaptive icon paths point to the same 60px favicon:
```json
"adaptiveIcon": {
  "foregroundImage": "./src/assets/icons8-university-60.png",
  "backgroundImage": "./src/assets/icons8-university-60.png",
  "monochromeImage": "./src/assets/icons8-university-60.png"
}
```
The correct prepared assets exist in `src/assets/` (`android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`) but are not referenced. Using a 60px image will produce a blurry launcher icon on Play Store and every Android home screen.

**Fix:**
```json
"adaptiveIcon": {
  "backgroundColor": "#E6F4FE",
  "foregroundImage": "./src/assets/android-icon-foreground.png",
  "backgroundImage": "./src/assets/android-icon-background.png",
  "monochromeImage": "./src/assets/android-icon-monochrome.png"
}
```

### 6.8 No splash screen configured in `app.json`

**File:** `app.json`  
There is no `"splash"` key. `src/assets/splash-screen.png` (1.3 MB) and `src/assets/splash-icon.png` exist but are unused. Without configuration, the app shows a plain white screen before the JS bundle loads.

**Fix:**
```json
"splash": {
  "image": "./src/assets/splash-screen.png",
  "resizeMode": "contain",
  "backgroundColor": "#f7f9fb"
}
```

---

## 7. File Structure Recommendation

### Rationale

The current structure mixes route-colocation (correct for Expo Router) with a flat global component directory. The problem: screen-specific business logic (API calls, data transformations, Supabase uploads) is scattered across route files and mega-components. The recommended structure uses a **feature-slice** approach where each domain owns its hooks, services, types, and components, with Expo Router `app/` files acting as thin entry points.

```
smuct-unicompanion-moblie/
│
├── app/                              # Expo Router routes — thin UI entry points only
│   ├── _layout.tsx                   # Root providers (add useFonts here)
│   ├── index.tsx                     # Splash — add session check
│   ├── (auth)/
│   │   ├── _layout.tsx               # ADD: Stack navigator for auth group
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── onboard.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   └── verify-email.tsx          # Implement proper UI
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Add auth guard
│   │   ├── index.tsx
│   │   ├── hubs.tsx
│   │   ├── forum.tsx
│   │   ├── blood.tsx
│   │   ├── menu.tsx
│   │   ├── profile.tsx
│   │   ├── admin_users.tsx           # Add role guard
│   │   ├── admin_add_teacher.tsx     # Add role guard
│   │   └── admin_calendar.tsx        # Add role guard
│   ├── admin/
│   ├── hub/[id].tsx + [id]/
│   ├── blood/[id].tsx
│   ├── forum/[id].tsx
│   ├── vault.tsx                     # ADD: implement or remove dead route
│   ├── academic_calendar.tsx
│   ├── alumni.tsx
│   ├── bus-schedule.tsx
│   ├── cgpa-calculator.tsx
│   ├── complaints.tsx
│   ├── directory.tsx
│   ├── events.tsx
│   ├── exams.tsx
│   ├── field-booking.tsx
│   ├── my-schedule.tsx
│   └── notices.tsx
│
├── src/
│   ├── assets/
│   │
│   ├── features/                     # Feature-slice modules (NEW)
│   │   ├── auth/
│   │   │   ├── authService.ts        # signIn, signUp, requestReset, verifyEmail
│   │   │   ├── useLoginFlow.ts       # Login orchestration hook
│   │   │   └── types.ts              # UserRole, SessionUser typed interfaces
│   │   ├── hubs/
│   │   │   ├── hubService.ts
│   │   │   ├── useMyHubs.ts
│   │   │   ├── useHubDetail.ts
│   │   │   ├── components/           # All hub cards + modals
│   │   │   └── types.ts
│   │   ├── forum/
│   │   │   ├── forumService.ts
│   │   │   ├── useForumPosts.ts
│   │   │   └── components/
│   │   ├── blood/
│   │   │   ├── bloodService.ts
│   │   │   ├── useBloodPosts.ts
│   │   │   └── components/
│   │   ├── profile/
│   │   │   ├── studentService.ts     # fetchProfile, updateProfile, uploadAvatar
│   │   │   ├── teacherService.ts
│   │   │   ├── useStudentProfile.ts
│   │   │   ├── useTeacherProfile.ts
│   │   │   └── components/           # StudentProfile, TeacherProfile, AdminProfile
│   │   ├── notices/
│   │   ├── events/
│   │   ├── alumni/
│   │   ├── complaints/
│   │   ├── field-booking/
│   │   ├── schedule/
│   │   └── admin/
│   │
│   ├── services/                     # Infrastructure singletons
│   │   ├── api.ts                    # Axios singleton
│   │   ├── auth-client.ts            # better-auth client singleton
│   │   └── supabase.ts               # NEW: Supabase singleton (replaces 3 duplicates)
│   │
│   ├── hooks/                        # Generic cross-feature hooks (NEW)
│   │   ├── useCurrentUser.ts         # Typed session user + role (replaces `as any` casts)
│   │   ├── useCountdown.ts           # Extracted from hub/[id].tsx
│   │   └── useAuthGuard.ts           # Redirect to login if session is null
│   │
│   ├── components/                   # Truly shared, feature-agnostic UI (NEW)
│   │   ├── ui/
│   │   │   ├── Button.tsx            # Primary/secondary (eliminate per-screen StyleSheet duplication)
│   │   │   ├── Input.tsx             # Text input with focus/error states
│   │   │   ├── Avatar.tsx            # Image + fallback initial letter
│   │   │   ├── EmptyState.tsx        # Reusable empty/error state with retry
│   │   │   └── LoadingOverlay.tsx
│   │   └── layout/
│   │       └── ScreenHeader.tsx      # Consistent back-button + title
│   │
│   ├── theme/
│   │   ├── colors.ts                 # No change
│   │   ├── typography.ts             # Choose ONE font (Manrope or Plus Jakarta Sans)
│   │   └── layout.ts                 # No change
│   │
│   ├── utils/
│   │   └── dateFormatter.ts          # Consolidate all formatDate / formatTime variants here
│   │
│   └── data/                         # Static seed data
│       ├── programs.ts
│       ├── bus-schedule.json
│       └── calender.json
│
├── .env                              # Dev-only, gitignored
├── app.json                          # Fix: splash, adaptive icons, add missing plugins
├── eas.json                          # Move secrets to EAS Secrets (not inline env)
├── package.json                      # Fix: TS version, add ESLint
└── tsconfig.json
```

### Migration Priority

| Phase | Focus | Blockers for Play Store? |
|-------|-------|--------------------------|
| **1 — Before any submission** | Fix `app.json` adaptive icons, add splash, add `expo-secure-store` + `expo-image-picker` + `@react-native-picker/picker` plugins. Remove `/vault` dead route or implement it. Fix `/(tabs)/home` → `/(tabs)` typo in `login.tsx`. Fix FAB bottom offset in `blood.tsx`. | **Yes — build will fail or be rejected** |
| **2 — Security** | Auth guard in `(tabs)/_layout.tsx`. Admin screen role guards. Create `supabase.ts` singleton. Add `UserRole` type; remove `as any` session casts. Remove hardcoded LAN IP fallback. Move EAS secrets out of `eas.json`. | **Yes — data exposure risk** |
| **3 — UX Polish** | Register one font in `_layout.tsx`. Render `isError` states with retry buttons. Fix `SafeAreaView` imports. Add accessibility labels. Implement `verify-email.tsx` UI. Implement or remove `community.tsx`. | Recommended before launch |
| **4 — Refactor** | Extract service layer, custom hooks, shared UI components per the structure above. | Not blocking launch, but critical for maintainability |
