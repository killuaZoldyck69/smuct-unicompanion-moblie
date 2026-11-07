# Mobile Production & Play Store Readiness Audit Report: SMUCT UniCompanion (React Native / Expo)

---

## Executive Summary

The SMUCT UniCompanion mobile application boasts an aesthetically rich Bento UI implementation, modern Expo Router file-based navigation, clean TypeScript typing (0 compilation errors), and TanStack Query integration across most domain features. However, the codebase is **not currently production-ready or Play-Store-ready**. In its current state, **Google Play review will reject the application immediately** due to mandatory policy violations regarding user account deletion, missing privacy policy links, and unmoderated user-generated content (UGC). Furthermore, critical security oversights leave administrative functions exposed to unauthorized students via deep linking, and uncompressed high-resolution camera uploads directly threaten the stability of the backend server. The three most urgent issues requiring remediation are:

1. **Immediate Google Play Policy Rejection (Account Deletion & UGC Moderation):** The app lacks an in-app account deletion mechanism (mandatory for all apps with account registration since 2024), contains no in-app Privacy Policy link, and provides zero content reporting or user blocking mechanisms in the public Forum, Memes, and Marketplace feeds.
2. **Client-Side Authorization Bypass on Administrative Screens:** Multiple administrative screens (`admin-bus-manage.tsx`, `AdminSystemMonitorScreen.tsx`, `AdminComplaintsScreen.tsx`, `AdminCourseHubsScreen.tsx`) lack role verification. Because Expo Router tab hiding (`href: null`) only hides tabs visually, any student can access system monitors, confidential grievances, and route management via direct deep linking (`smuct-unicompanion://...`).
3. **App Startup Crash Risk & Uncompressed 20MB Media Uploads:** Top-level module execution in `auth-client.ts` and `api.ts` throws unhandled runtime errors if `EXPO_PUBLIC_API_BASE_URL` is undefined (which is currently omitted from `eas.json`'s production profile). Additionally, camera uploads bypass client-side compression, transferring 10–25 MB raw bitmaps that exhaust student cellular data and trigger instant Out-Of-Memory container crashes on the free-tier backend.

---

## Project Structure

```
smuct-unicompanion-moblie/
├── app.json                               # Expo & EAS mobile app configuration
├── eas.json                               # Expo Application Services build & release profiles
├── google-services.json                   # Firebase Cloud Messaging & client auth credentials
├── package.json                           # Dependencies, Expo SDK 56 & scripts
├── tsconfig.json                          # TypeScript paths & base Expo config
├── .env (untracked)                       # Runtime environment variables
├── .gitignore                             # Git ignore rules
├── dist/                                  # Web bundle build output (gitignored)
└── src/
    ├── app/                               # Expo Router file-based navigation
    │   ├── _layout.tsx                    # Root Slot layout, QueryClient, global notification listener
    │   ├── index.tsx                      # Entry splash screen router
    │   ├── academic_calendar.tsx          # Direct calendar screen route
    │   ├── admin-bus-manage.tsx           # Administrative bus schedule management (unprotected)
    │   ├── bus-schedule.tsx               # Campus transit schedule route
    │   ├── (auth)/                        # Authentication stack
    │   │   ├── _layout.tsx                # Stack layout (fade animation)
    │   │   ├── login.tsx                  # Student/Teacher/Admin login
    │   │   ├── register.tsx               # Student registration form
    │   │   ├── forgot-password.tsx        # Password reset OTP request
    │   │   ├── reset-password.tsx         # Password reset verification
    │   │   ├── verify-email.tsx           # Email OTP verification
    │   │   └── onboard.tsx                # First-time student onboarding flow
    │   ├── (tabs)/                        # Authenticated bottom tab layout
    │   │   ├── _layout.tsx                # Custom floating bento tab bar & route definitions
    │   │   ├── index.tsx                  # Home tab (greeting, weather, routine, notices)
    │   │   ├── hubs.tsx                   # Course Hubs list tab
    │   │   ├── menu.tsx                   # University services directory grid
    │   │   ├── profile.tsx                # User profile & account tab
    │   │   ├── admin_users.tsx            # Admin user directory tab
    │   │   ├── admin_add_teacher.tsx      # Admin add faculty member tab
    │   │   ├── forum/                     # Discussion forum routes
    │   │   │   ├── index.tsx              # Forum discussions feed
    │   │   │   └── [id].tsx               # Discussion detail & replies
    │   │   └── [hidden screens]/          # Hidden sub-routes (admin_*, notices, events, blood, etc.)
    │   ├── admin/                         # Admin redirect routes & aid view
    │   │   ├── aid.tsx                    # Student aid & welfare emergency view (unprotected)
    │   │   └── [redirects].tsx            # Redirects to /(tabs)/admin_*
    │   ├── blood/                         # Blood bank detail routes
    │   │   └── [id].tsx                   # Emergency blood request detail view
    │   ├── campus-hub/                    # Campus Hub item detail screens
    │   │   ├── lost-found/[id].tsx        # Lost & found item detail & claim modal
    │   │   └── marketplace/[id].tsx       # Marketplace item detail & buyer chat modal
    │   ├── forum/[id].tsx                 # Duplicate discussion detail route
    │   └── hub/                           # Course Hub detail screens
    │       ├── [id].tsx                   # Unified Course Hub tabs (Stream, Classwork, Materials, Members, Reviews)
    │       ├── [id]/assessments.tsx       # Legacy assessment forwarder
    │       └── [id]/reviews.tsx           # Legacy standalone reviews screen (dead code)
    ├── assets/                            # Static app assets, icons, backgrounds, illustrations
    ├── components/                        # Shared UI components (Button, Input, Avatar, Toasts, RichText)
    ├── data/                              # Static data (programs.ts, mock JSONs)
    ├── features/                          # TanStack Query feature hooks & API query keys
    │   ├── admin/                         # Admin user queries & mutation hooks
    │   ├── alumni/                        # Alumni directory queries
    │   ├── blood/                         # Blood bank donation queries
    │   ├── campus-hub/                    # Marketplace, Memes, Lost & Found feeds
    │   ├── complaints/                    # Student & Admin complaint queries
    │   ├── directory/                     # Faculty directory queries
    │   ├── events/                        # University events queries
    │   ├── field-booking/                 # Ground booking queries
    │   ├── forum/                         # Discussion forum feed queries
    │   ├── hubs/                          # Course hubs, coursework, materials queries
    │   ├── notices/                       # Campus notices queries
    │   ├── notifications/                 # In-app notification observer & queries
    │   └── schedule/                      # Academic calendar & bus transit queries
    ├── hooks/                             # Custom React hooks (useCurrentUser, useTodaysClasses, etc.)
    ├── screens/                           # Screen implementations, subcomponents & hooks
    ├── services/                          # API client, Better-Auth client, Cloudinary, Drive, Push tokens
    ├── theme/                             # Design tokens, colors, typography, layout
    ├── types/                             # Domain TypeScript interfaces
    └── utils/                             # Formatters, ordinal helpers, password validators
```

---

## Findings

### Critical Severity

#### 1. Missing Mandatory In-App Account Deletion Flow
- **Severity:** Critical
- **Category:** BUILD & PLAY STORE READINESS
- **Location:** `src/screens/profile/` & `src/services/user-service.ts`
- **Issue:** The app allows user registration but provides no in-app mechanism for users to delete their account and associated data.
- **Why it matters:** Under Google Play's User Data policy (mandatory since 2024), any app that allows user account creation **must** provide a readily accessible in-app pathway for users to initiate account and data deletion. Submitting to Google Play without this feature results in an immediate, automated policy rejection.
- **Suggested direction:** Add an authenticated "Delete Account" action within the user profile settings that triggers a confirmation modal and invokes a backend deletion endpoint, accompanied by a public web URL deletion request form in the Play Console.

#### 2. Public UGC Lacks Content Reporting and User Blocking (Play Store Policy Violation)
- **Severity:** Critical
- **Category:** BUILD & PLAY STORE READINESS
- **Location:** `src/screens/forum/`, `src/screens/campus-hub/memes/`, `src/screens/campus-hub/marketplace/`
- **Issue:** Public user-generated content feeds (discussions, memes, buy/sell listings) contain no in-app feature to report abusive content or block offending users, and do not require users to agree to Terms of Service / Community Guidelines.
- **Why it matters:** Google Play's User Generated Content (UGC) policy strictly mandates that apps featuring public social interaction must provide in-app reporting of objectionable content, user blocking mechanisms, and explicit community guidelines. Failure to implement this causes immediate Play Store rejection.
- **Suggested direction:** Introduce a report modal on post/comment option sheets with predefined violation categories, a "Block User" action that filters out their posts locally and on the server, and a mandatory Community Guidelines acknowledgement prompt prior to a user's first post.

#### 3. Missing In-App Privacy Policy Link
- **Severity:** Critical
- **Category:** BUILD & PLAY STORE READINESS
- **Location:** `src/screens/login/`, `src/screens/register/`, `src/screens/profile/`
- **Issue:** There is no clickable link or embedded viewer for a university Privacy Policy anywhere in the authentication or profile flows.
- **Why it matters:** Because the app collects sensitive Personal Identifiable Information (PII) including full names, student IDs, university emails, phone numbers, blood groups, profile photos, and device push tokens, Google Play strictly requires a prominent Privacy Policy link within the app and in the Play Console store listing.
- **Suggested direction:** Add a legally compliant Privacy Policy link to both the registration card and profile settings, opening the policy in an in-app browser via `expo-web-browser`.

#### 4. Multiple Administrative Screens Accessible via Deep Link (Client-Side Authorization Bypass)
- **Severity:** Critical
- **Category:** SECURITY (CLIENT-SIDE)
- **Location:** 
  - `src/app/admin-bus-manage.tsx` (lines 57–75)
  - `src/screens/admin-system-monitor/AdminSystemMonitorScreen.tsx` (line 28)
  - `src/screens/complaints/admin-complaints.tsx` (line 48)
  - `src/screens/admin-course-hubs/index.tsx` (line 30)
  - `src/app/admin/aid.tsx` (lines 17–50)
- **Issue:** Several administrative screens contain zero role checks. In `src/app/(tabs)/_layout.tsx`, they are configured with `options={{ href: null }}`, which only hides them from the bottom tab bar.
- **Why it matters:** Any authenticated student can deep-link or invoke `router.push('/(tabs)/admin_system_monitor')`, `/(tabs)/admin_complaints'`, or `/admin-bus-manage` to view confidential student complaints, server telemetry, and database statistics, or mutate bus transit schedules.
- **Suggested direction:** Create a centralized `<AdminRouteGuard>` wrapper or custom hook that inspects `useCurrentUser()`, immediately redirecting non-admin users to `/(tabs)` before mounting child components or executing queries.

#### 5. Deprecated OAuth 2.0 Implicit Grant for Google Drive with 60-Minute Expiry
- **Severity:** Critical
- **Category:** ANYTHING NOT COVERED ABOVE / SECURITY
- **Location:** `src/services/google-drive-service.ts` (lines 236–246)
- **Issue:** Google Drive authorization uses `response_type=token` (OAuth 2.0 Implicit Flow) rather than the Authorization Code flow with PKCE (`response_type=code`).
- **Why it matters:** Google has officially deprecated and begun disabling the Implicit Grant flow for native applications due to security risks. Furthermore, the implicit grant never returns a refresh token; the access token expires in exactly 60 minutes, silently breaking Google Drive uploads and requiring students/teachers to manually re-authenticate every hour.
- **Suggested direction:** Migrate to the OAuth 2.0 Authorization Code flow with PKCE (Proof Key for Code Exchange) using `expo-auth-session` to securely obtain both an access token and a long-lived refresh token.

---

### High Severity

#### 6. Fatal Startup Crash on Undefined Base URL (`throw new Error` at Module Evaluation)
- **Severity:** High
- **Category:** BUILD & PLAY STORE READINESS / SECURITY
- **Location:** `src/services/auth-client.ts` (lines 7–9) & `src/services/api.ts` (lines 8–10)
- **Issue:** The modules throw an unhandled JavaScript error at root evaluation time if `process.env.EXPO_PUBLIC_API_BASE_URL` is missing:
  ```typescript
  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not set");
  }
  ```
- **Why it matters:** In `eas.json`, the `preview` build defines this environment variable, but the `production` profile does **not**. If a production release build is generated without cloud dashboard secrets attached, the compiled app will crash immediately on launch before any React root, splash screen, or error boundary can render.
- **Suggested direction:** Add fallback configuration, declare the variable under all build profiles in `eas.json`, and replace top-level throws with a graceful fallback error screen if configuration is absent.

#### 7. Missing Android `versionCode` in Configuration
- **Severity:** High
- **Category:** BUILD & PLAY STORE READINESS
- **Location:** `smuct-unicompanion-moblie/app.json` (lines 18–29)
- **Issue:** The `android` configuration block specifies a semantic version (`1.0.0`) but omits `versionCode`.
- **Why it matters:** Google Play requires an incremental integer `versionCode` for every uploaded APK/AAB bundle. Relying purely on EAS remote auto-increment without an explicit local baseline risks version collision or build rejection during manual and CI submissions.
- **Suggested direction:** Explicitly declare `"versionCode": 1` in `app.json` under `expo.android`.

#### 8. Low-Resolution App Icon & Invalid Notification Icon Assets
- **Severity:** High
- **Category:** BUILD & PLAY STORE READINESS
- **Location:** `smuct-unicompanion-moblie/app.json` (lines 8, 54) & `src/assets/icons8-university-60.png`
- **Issue:** The primary app icon and notification icon point to a 60x60 pixel asset (`icons8-university-60.png`).
- **Why it matters:** Google Play requires a 512x512 PNG app icon (and iOS requires a 1024x1024 asset); using a 60x60 asset leads to severe pixelation and EAS asset generation failures. Additionally, Android status bar notifications require a monochromatic silhouette (white with transparent background); using a full-color 60px image causes Android 8.0+ to render notifications as distorted solid white squares.
- **Suggested direction:** Provide a high-resolution 1024x1024 PNG for `"icon"` and create a dedicated transparent monochrome icon (alpha-only) for `expo-notifications`.

#### 9. Uncompressed Multi-Megabyte Camera Uploads Exhausting Memory and Data
- **Severity:** High
- **Category:** PERFORMANCE & MEMORY
- **Location:** `src/services/cloudinary-service.ts` (lines 54–75)
- **Issue:** Images picked from the gallery or camera are converted straight into `FormData` and uploaded raw without compression or resizing.
- **Why it matters:** Modern mobile camera photos range from 8 MB to 25 MB. Uploading raw files burns user mobile data, causes slow or failing uploads over 3G/4G, and directly triggers Out-Of-Memory crashes on the backend's 512 MB Render instance (which buffers uploads in RAM).
- **Suggested direction:** Install `expo-image-manipulator` and compress/downscale images on the client (e.g., max width 1280px, JPEG quality 0.75) prior to uploading.

#### 10. React Native Standard `<Image>` Lacks Disk Caching in High-Volume Feeds
- **Severity:** High
- **Category:** PERFORMANCE & MEMORY
- **Location:** 
  - `src/screens/campus-hub/memes/components/meme-card.tsx` (lines 188–199)
  - `src/screens/campus-hub/marketplace/components/listing-card.tsx`
  - `src/screens/campus-hub/lost-found/components/detail/lf-image-gallery.tsx`
- **Issue:** All feed cards render remote Cloudinary images using React Native's built-in `<Image>` component instead of `expo-image`.
- **Why it matters:** React Native's standard `<Image>` on Android does not cache remote images to disk across app sessions and does not perform progressive decoding. Scrolling long feeds with uncompressed media leads to high memory spikes, frame drops, and Out-Of-Memory crashes on mid-range Android devices.
- **Suggested direction:** Replace all list/card `<Image>` instances with `expo-image`, enabling automatic disk caching, progressive loading, and memory recycling.

#### 11. Permanent User Stagnation via `staleTime: Infinity` on Current User Query
- **Severity:** High
- **Category:** STATE MANAGEMENT & DATA FETCHING
- **Location:** `src/hooks/use-current-user.ts` (lines 70–75)
- **Issue:** The `currentUser` query configures:
  ```typescript
  staleTime: Infinity,
  gcTime: 1000 * 60 * 60 * 24,
  refetchOnMount: false,
  refetchOnReconnect: false,
  ```
- **Why it matters:** Once cached, user profile details, roles, restriction statuses (`isRestricted`), and email verification flags are **never revalidated** with the server during the app lifecycle. If an admin bans, demotes, or updates a student, the mobile client continues operating under stale permissions until the app process is terminated.
- **Suggested direction:** Lower `staleTime` to 5–10 minutes, allow `refetchOnMount: true` (or `refetchOnReconnect: true`), and trigger cache invalidation upon critical app state transitions.

#### 12. Offline Logout Trap (Users Unable to Sign Out on Network Failure)
- **Severity:** High
- **Category:** SECURITY (CLIENT-SIDE) / ERROR HANDLING
- **Location:** `src/screens/profile/utils.ts` (lines 130–154)
- **Issue:** `performLogout` executes `await authClient.signOut()` before clearing SecureStore credentials. If the device is offline or the backend server is unreachable, `signOut()` throws an error and execution branches into the `catch` block.
- **Why it matters:** The code that removes local auth tokens (`SecureStore.deleteItemAsync`) and redirects to `/login` is skipped entirely. A student without internet connectivity or experiencing server outages is completely locked into their session and cannot sign out.
- **Suggested direction:** Wrap token deletion and client-side cache clearing in a `finally` block so local session state is purged and navigation occurs regardless of whether the remote sign-out call succeeds.

#### 13. Missing 401 Response Interceptor in Axios API Client
- **Severity:** High
- **Category:** STATE MANAGEMENT & DATA FETCHING
- **Location:** `src/services/api.ts` (lines 116–146)
- **Issue:** `api` defines a request interceptor to attach bearer tokens, but includes **no response interceptor** for handling HTTP 401 Unauthorized responses.
- **Why it matters:** When an access token expires or is invalidated server-side, subsequent API calls fail with unhandled 401 errors. The user is left looking at broken or perpetual loading states with no automatic token refresh and no redirection to the login screen.
- **Suggested direction:** Attach an Axios response interceptor that intercepts 401 errors, purges stale SecureStore credentials, and triggers `router.replace('/(auth)/login')`.

---

### Medium Severity

#### 14. Missing In-App Offline Detection & State Feedback
- **Severity:** Medium
- **Category:** ERROR HANDLING & NETWORK RESILIENCE
- **Location:** `smuct-unicompanion-moblie/package.json` (line 25) & `src/screens/home/index.tsx`
- **Issue:** `expo-network` is installed as a project dependency but is never imported or utilized in `src/`.
- **Why it matters:** When an offline user opens the app, screens display deceptive states (e.g., the Home screen displays "No recent notices." instead of an offline alert), confusing students as to whether there is actually no data or no connectivity.
- **Suggested direction:** Implement a global network connectivity listener using `expo-network` (or `@react-native-community/netinfo`) that renders a subtle offline banner and disables network-bound action buttons when disconnected.

#### 15. Home Screen Lacks Pull-to-Refresh
- **Severity:** Medium
- **Category:** ERROR HANDLING & NETWORK RESILIENCE
- **Location:** `src/screens/home/index.tsx` (lines 101–107)
- **Issue:** The main dashboard `<ScrollView>` contains no `refreshControl` prop.
- **Why it matters:** If data fails to load on launch or if a new campus notice/class routine update is published while the app is running, users have no way to manually pull-to-refresh their dashboard.
- **Suggested direction:** Add a `<RefreshControl>` component to the dashboard `<ScrollView>` that refetches `myHubs`, `notices`, and `weather` queries simultaneously.

#### 16. Missing Push Token Refresh Listener (FCM Token Rotation)
- **Severity:** Medium
- **Category:** PUSH NOTIFICATIONS
- **Location:** `src/features/notifications/useNotificationObserver.ts` (lines 30–34)
- **Issue:** Push token synchronization only executes once when `isAuthenticated` transitions to true; there is no listener for runtime token refresh events.
- **Why it matters:** When Firebase Cloud Messaging (FCM) rotates the device token in the background, the server's record becomes obsolete. Subsequent university push notifications (class notices, assessment deadlines) fail silently until the user manually logs out and back in.
- **Suggested direction:** Add `Notifications.addPushTokenListener` inside `useNotificationObserver` to automatically sync refreshed push tokens to the backend.

#### 17. Unbounded & Truncated Complaint Queries (Missing Pagination)
- **Severity:** Medium
- **Category:** STATE MANAGEMENT & DATA FETCHING
- **Location:** `src/features/complaints/useComplaints.ts` (lines 19–25) & `src/screens/complaints/index.tsx` (line 92)
- **Issue:** `useMyComplaints` and `useAllComplaintsAdmin` use standard `useQuery` without pagination or infinite query handlers.
- **Why it matters:** The screens only display the first page of results (typically 10 items). Users or administrators with more than 10 complaints cannot view or manage older records.
- **Suggested direction:** Refactor complaint queries to `useInfiniteQuery` with FlatList `onEndReached` listeners.

#### 18. Duplicate Conflicting Route Definitions in Expo Router
- **Severity:** Medium
- **Category:** CODE QUALITY & ARCHITECTURE
- **Location:** 
  - `src/app/forum/[id].tsx` vs. `src/app/(tabs)/forum/[id].tsx`
  - `src/app/hub/[id]/reviews.tsx` (940 lines of abandoned screen code alongside `ReviewTab.tsx`)
- **Issue:** Redundant and duplicate route files exist across the file-based routing tree.
- **Why it matters:** Coexisting duplicate routes cause route matching ambiguity, complicate deep-link handling, and inflate the compiled application bundle size.
- **Suggested direction:** Remove redundant route files, standardizing forum post navigation under `src/app/forum/[id].tsx` and deleting the abandoned `src/app/hub/[id]/reviews.tsx`.

#### 19. Premature Token Persistence Bypasses Student Onboarding
- **Severity:** Medium
- **Category:** SECURITY (CLIENT-SIDE)
- **Location:** `src/screens/login/hooks/use-login-form.ts` (lines 68–89, 151–174)
- **Issue:** In `handleLogin`, authentication tokens are written to `SecureStore` before checking student onboarding status via `getStudentProfile()`.
- **Why it matters:** If `getStudentProfile()` fails due to a network glitch or server 500 error, the user remains on the login screen, but their token is permanently stored. On subsequent app launch, `useSplashFlow` detects the saved token and routes directly to `/(tabs)`, permanently bypassing the mandatory onboarding flow.
- **Suggested direction:** Only persist session tokens to permanent storage after student profile verification completes successfully, or record an explicit `isOnboarded: true` flag in `SecureStore`.

#### 20. Web LocalStorage Session Leakage on Logout
- **Severity:** Medium
- **Category:** SECURITY (CLIENT-SIDE)
- **Location:** `src/screens/profile/utils.ts` (lines 139–144)
- **Issue:** When running on web, `performLogout` only executes SecureStore deletions (which are no-ops on web) and fails to clear `better-auth.session_token` and `better-auth_session_data` from `localStorage`.
- **Why it matters:** User credentials and sessions remain active in browser storage on shared university computer lab devices.
- **Suggested direction:** Add `localStorage.removeItem(...)` calls for all auth tokens when `Platform.OS === 'web'`.

#### 21. Fragmented Design Tokens Across Feature Modules
- **Severity:** Medium
- **Category:** UI/UX CONSISTENCY
- **Location:** 
  - `src/theme/colors.ts`
  - `src/app/admin-bus-manage.tsx` (`BENTO_COLORS`)
  - `src/screens/campus-hub/shared/design-tokens.ts` (`CAMPUS_HUB_COLORS`)
  - `src/screens/admin-calendar/constants.ts` (`THEME`)
- **Issue:** Multiple feature directories define their own distinct color constants and styling tokens rather than consuming the core design system.
- **Why it matters:** This produces subtle visual inconsistencies (competing shades of navy `#131b2e` vs `#00033a`, backgrounds `#f8f9fa` vs `#f7f9fb`) and complicates theme maintenance.
- **Suggested direction:** Consolidate all shared Bento tokens, colors, and shadows into `src/theme/` and re-export them cleanly.

---

### Low Severity

#### 22. Dead Mock Data Bundled in Repository
- **Severity:** Low
- **Category:** CODE QUALITY & ARCHITECTURE
- **Location:** `src/data/` (`alumni.json`, `bus-schedule.json`, `calender.json`, `notice.json`)
- **Issue:** Static JSON mock files are bundled in the repository but never imported by any active screen or service.
- **Why it matters:** Adds dead weight to repository size and creates developer confusion regarding where data originates.
- **Suggested direction:** Delete unused JSON files, retaining only `src/data/programs.ts`.

#### 23. Large Unused Web Dependencies in Package Configuration
- **Severity:** Low
- **Category:** PERFORMANCE & MEMORY
- **Location:** `smuct-unicompanion-moblie/package.json` (lines 10, 15)
- **Issue:** The web package `"@lottiefiles/dotlottie-react"` is installed in the React Native project but never imported. Additionally, the full server-side package `"better-auth"` is installed alongside `"@better-auth/expo"`.
- **Why it matters:** Bloats `node_modules` and risks bundling server database adapters into the client JavaScript bundle.
- **Suggested direction:** Remove `@lottiefiles/dotlottie-react` and ensure only client-specific better-auth subpath exports are bundled.

#### 24. Missing List Virtualization Windowing Parameters
- **Severity:** Low
- **Category:** PERFORMANCE & MEMORY
- **Location:** `src/screens/campus-hub/memes/index.tsx` (lines 283–300) & `src/screens/directory/FacultyDirectoryView.tsx`
- **Issue:** `<FlatList>` components omit performance tuning props such as `windowSize`, `maxToRenderPerBatch`, `initialNumToRender`, and `removeClippedSubviews`.
- **Why it matters:** In long lists with complex cards, FlatList renders too many off-screen items, leading to higher memory consumption and occasional frame skips during fast scrolling.
- **Suggested direction:** Add standard windowing props (`windowSize={5}`, `maxToRenderPerBatch={5}`, `initialNumToRender={6}`, `removeClippedSubviews={Platform.OS === 'android'}`).

#### 25. Hardcoded EAS Project ID Fallback
- **Severity:** Low
- **Category:** PUSH NOTIFICATIONS
- **Location:** `src/services/push-token.service.ts` (line 73)
- **Issue:** The project ID `"e5163abb-47dc-4ffe-9cf6-40b794db19a3"` is hardcoded as a fallback.
- **Why it matters:** If the Expo project is transferred or cloned to another Expo organization/account, push token generation will silently fail or bind to the wrong project.
- **Suggested direction:** Exclusively rely on `Constants.expoConfig?.extra?.eas?.projectId` and throw a descriptive warning if absent.

---

### Nitpick Severity

#### 26. Android Package Name Uses Personal Username
- **Severity:** Nitpick
- **Category:** BUILD & PLAY STORE READINESS
- **Location:** `smuct-unicompanion-moblie/app.json` (line 26)
- **Issue:** `package` is declared as `"com.killuazoldyck.smuctunicompanionmobile"`.
- **Why it matters:** Once published to Google Play, the package name is permanently immutable. Using a personal anime reference rather than an official institutional identifier (e.g. `com.smuct.unicompanion` or `edu.bd.smuct.unicompanion`) looks unbranded and unprofessional.
- **Suggested direction:** Rename the package namespace to an official university format before creating the first Google Play Console release.

#### 27. 116 ESLint Warnings in Codebase
- **Severity:** Nitpick
- **Category:** CODE QUALITY & ARCHITECTURE
- **Location:** Codebase-wide
- **Issue:** Running `npm run lint` yields 116 warnings regarding unused variables and missing hook dependencies in `useEffect` arrays.
- **Why it matters:** Clutters build output and obscures genuine logic warnings.
- **Suggested direction:** Clean up unused imports and verify hook dependency arrays.

---

## Play Store Rejection Risk Summary

Submitting the current mobile codebase to the Google Play Console for review will result in **immediate rejection** under the following policy checks:

| Policy Check | Current Codebase Status | Play Store Risk Level | Primary Consequence |
| :--- | :--- | :--- | :--- |
| **In-App Account Deletion Requirement** | Missing; no deletion action in profile or settings | ⛔ **Guaranteed Rejection** | Rejection under *User Data - Account Deletion* policy. |
| **User Generated Content (UGC) Moderation** | Public feeds (Forum, Memes, Marketplace) lack report & block buttons | ⛔ **Guaranteed Rejection** | Rejection under *User Generated Content* policy. |
| **In-App Privacy Policy Accessibility** | No privacy policy link on auth or profile screens | ⛔ **Guaranteed Rejection** | Rejection under *User Data - Prominent Disclosures* policy. |
| **Google Drive OAuth Compliance** | Uses deprecated Implicit Grant (`response_type=token`) | ⚠️ **High Rejection Risk** | Google OAuth Consent Screen verification failure; hourly token expiration. |
| **Release Versioning (`versionCode`)** | Missing `versionCode` in `app.json` | ⚠️ **Build Failure** | EAS / Play Console upload rejected due to unversioned bundle. |
| **Asset Dimension Standards** | App icon is 60x60; notification icon lacks alpha mask | ⚠️ **Build / Review Flag** | Artifact validation error in Play Console; distorted solid white notifications on Android. |
