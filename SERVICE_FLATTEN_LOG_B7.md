# Service, Utils & Hooks Flattening Log: B7.4

## Date: 2026-08-29
## Target: React Native / Expo Mobile Application (`smuct-unicompanion-moblie`)

---

## 1. Overview
In accordance with [Expo's Official App Folder Structure Best Practices](https://expo.dev/blog/expo-app-folder-structure-best-practices):
1. **`src/services/`**: Flattened into single dedicated service files per API domain containing plain async functions wrapping the Axios `api` instance. All 17+ raw inline queries and duplicate endpoint definitions have been consolidated into single sources of truth.
2. **`src/utils/`**: Consolidated all date/time formatting utilities (`formatDate`, `formatDateWithDay`, `formatDateTime`, `formatTime`, `format12HourTime`, `formatFullDateTime`) into kebab-case `src/utils/date-formatter.ts`.
3. **`src/hooks/`**: Standardized hook filenames to kebab-case (`use-countdown.ts`, `use-current-user.ts`, `use-todays-classes.ts`, `use-weather-forecast.ts`) and confirmed data transformations are isolated from screens.

---

## 2. Flat Service Files in `src/services/`

| Service File | Endpoints Handled | Functions Exported |
|---|---|---|
| `api.ts` | Base Axios client instance | Axios singleton with Bearer token interceptor |
| `auth-client.ts` | Better-Auth client | `authClient` instance |
| `supabase.ts` | Supabase client singleton | `supabase` client |
| `auth-service.ts` | `/students/onboard`, `/students/profile/image` | `onboardStudentAPI`, `updateInitialProfileImageAPI`, `getSessionUser` |
| `hub-service.ts` | `/hubs/my`, `/hubs/:id`, `/hubs/available-teachers`, `/hubs`, `/hubs/join`, `/hubs/:id/assessments`, `/hubs/:id/resources`, `/hubs/:id/content/*`, `/hubs/:id/reviews` | `getMyHubs`, `getHubDetails`, `getAvailableTeachers`, `createHub`, `joinHub`, `updateHub`, `archiveHub`, `deleteHub`, `updateMemberRole`, `removeMember`, `getAssessments`, `createAssessment`, `getAssessmentSubmissions`, `submitAssessment`, `gradeSubmission`, `bulkGrade`, `getResources`, `createResource`, `getAnnouncements`, `createAnnouncement`, `addAnnouncementComment`, `getDiscussions`, `createDiscussion`, `replyDiscussion`, `getReviews`, `submitReview` |
| `forum-service.ts` | `/forum`, `/forum/:id`, `/forum/:id/responses`, `/forum/:id/resolve` | `getForumPosts`, `getSingleForumPost`, `createForumPost`, `updateForumPost`, `resolveForumPost`, `deleteForumPost`, `createForumResponse` |
| `blood-service.ts` | `/blood`, `/blood/:id`, `/blood/:id/respond`, `/blood/:id/resolve` | `getBloodFeed`, `getBloodPostById`, `createBloodPost`, `respondBloodPost`, `resolveBloodPost`, `deleteBloodPost` |
| `notice-service.ts` | `/notices`, `/notices/:id` | `getNotices`, `getNoticeById`, `createNotice`, `deleteNotice` |
| `event-service.ts` | `/events`, `/events/:id` | `getEvents`, `getEventById`, `createEvent`, `deleteEvent` |
| `alumni-service.ts` | `/alumni`, `/alumni/:id` | `getAlumniList`, `getAlumniById`, `createAlumni`, `updateAlumni`, `deleteAlumni` |
| `bus-service.ts` | `/buses`, `/buses/:id` | `getBusSchedules`, `createBusRoute`, `deleteBusRoute` |
| `calendar-service.ts` | `/calendars`, `/calendars/:id` | `getAcademicCalendars`, `createAcademicCalendar`, `deleteAcademicCalendar` |
| `directory-service.ts` | `/directory/teachers` | `getDirectoryTeachers` |
| `schedule-service.ts` | Re-exports bus, calendar, and directory services | Unified schedule domain exports |
| `field-service.ts` | `/field/settings`, `/field/my-bookings`, `/field/schedule`, `/field/bookings`, `/field/book`, `/field/bookings/:id/status` | `getFieldSettings`, `updateFieldSettings`, `getMyFieldBookings`, `getFieldSchedule`, `getAllFieldBookingsAdmin`, `createFieldBooking`, `updateFieldBookingStatus` |
| `complaint-service.ts` | `/complaints/my`, `/complaints`, `/complaints/:id`, `/complaints/:id/status` | `getMyComplaints`, `getAllComplaintsAdmin`, `getComplaintById`, `createComplaint`, `updateComplaintStatus`, `deleteComplaint` |
| `student-service.ts` | `/students/profile`, `/students/profile/image` | `getStudentProfile`, `updateStudentProfile`, `updateStudentProfileImage` |
| `teacher-service.ts` | `/teachers/profile`, `/teachers/profile/image` | `getTeacherProfile`, `updateTeacherProfile`, `updateTeacherProfileImage` |
| `admin-service.ts` | `/users`, `/users/:id/role`, `/users/:id` | `getAllUsersAdmin`, `updateUserRoleAdmin`, `deleteUserAdmin` |

---

## 3. Screens & Call Sites Updated

| Screen / Component | Service / Hook Used | Changes Made |
|---|---|---|
| `src/screens/cgpa-calculator/index.tsx` | `getMyHubs` (`@/services/hub-service`) | Replaced raw `api.get("/hubs/my")` with `getMyHubs` service |
| `src/screens/login/index.tsx` | `getStudentProfile` (`@/services/student-service`) | Replaced raw `api.get("/students/profile")` with `getStudentProfile` service |
| `src/screens/onboard/index.tsx` | `updateStudentProfile` (`@/services/student-service`), `onboardStudentAPI` (`@/services/auth-service`) | Replaced raw `api.patch("/students/profile")` with typed service calls |
| `src/screens/hubs/index.tsx` | `getStudentProfile`, `getTeacherProfile`, `useJoinHub`, `useCreateHub` | Replaced inline `api.get` and `api.post` with domain services and hooks |
| `src/screens/hub-detail/index.tsx` | `createAnnouncement`, `createDiscussion`, `replyDiscussion`, `updateMemberRole`, `removeMember`, `createResource`, `addAnnouncementComment`, `updateHub`, `deleteHub`, `archiveHub`, `createAssessment` | Replaced 10 inline `api.post`/`api.patch`/`api.delete` calls with typed domain service methods |
| `src/screens/field-booking/index.tsx` | `@/utils/date-formatter`, `@/services/field-service` | Consolidated date formatting and field booking hooks |
| `src/screens/home/index.tsx` | `use-weather-forecast`, `use-todays-classes`, `use-current-user` | Kebab-case hooks and modular data transformation |
| `src/screens/blood/index.tsx` | `@/utils/date-formatter`, `@/services/blood-service` | Standardized date formatters & services |
| `src/screens/profile/components/*` | `@/services/student-service`, `@/services/teacher-service` | Removed all duplicate local service calls |

---

## 4. Verification Results

- **TypeScript Compilation (`npx tsc --noEmit`)**: Exited with code `0` (Zero type errors).
- **Expo Config Validation (`npx expo config --type public`)**: Exited with code `0`.
- **Elimination of Duplication**: No duplicate route paths remain in screen render functions.
