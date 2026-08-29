# Mobile Architecture Restructure Log (B7)

## Overview
This document records the architectural migration of the React Native / Expo mobile application (`smuct-unicompanion-moblie`) into a modular **Feature-Slice Architecture** with separated services, TanStack Query hooks, shared UI primitives, extracted domain computation hooks, and unified formatting utilities.

---

## 1. Consolidated Utilities & Hooks

### A. Date & Time Formatter (`src/utils/dateFormatter.ts`)
Consolidated 3+ duplicate inline date and time formatting implementations (`app/field-booking.tsx`, `app/complaints.tsx`, `app/(tabs)/blood.tsx`) into a single source of truth:
- `formatDate(dateString: string)`: `DD MMM YYYY` (e.g. `24 Aug 2026`)
- `formatDateWithDay(dateString: string)`: `ddd, DD MMM YYYY` (e.g. `Mon, 24 Aug 2026`)
- `formatDateTime(dateString: string)`: `DD MMM YYYY, HH:MM AM/PM`
- `formatTime(dateString: string)`: `HH:MM AM/PM`
- `format12HourTime(dateString: string)`: `DD MMM YYYY, H:MM AM/PM`

### B. Extracted Data-Transformation Hooks (`src/hooks/`)
- `src/hooks/useTodaysClasses.ts`: Extracted 36-line schedule parsing and class extraction logic out of `app/(tabs)/index.tsx`.
- `src/hooks/useWeatherForecast.ts`: Extracted hourly forecast calculations, weather fetching, `getWeatherDetails`, and `formatHour` logic out of `app/(tabs)/index.tsx`.

### C. Shared UI Primitives (`src/components/ui/` & `src/components/layout/`)
- `src/components/ui/Button.tsx`: Variant-aware button (primary, secondary, danger, outline) with loading and disabled states.
- `src/components/ui/Input.tsx`: Form input component with label, left/right icons, error states, and theme typography.
- `src/components/ui/Avatar.tsx`: Profile image component with fallback initials generator.
- `src/components/ui/EmptyState.tsx`: Accessible empty state view with Feather icons and typography tokens.
- `src/components/ui/LoadingOverlay.tsx`: Non-blocking modal loading overlay with activity indicator.
- `src/components/layout/ScreenHeader.tsx`: Consistent header bar with back navigation, titles, and action slots.

---

## 2. Feature Slices Created (`src/features/<feature>/`)

Each feature slice contains:
1. `types.ts`: Domain models, request inputs, and response structures.
2. `<feature>Service.ts`: Direct HTTP API endpoints using `src/services/api.ts` (single source of endpoint definitions).
3. `use<Feature>.ts`: TanStack Query hooks (`useQuery`, `useMutation`) with query cache invalidation.

### Feature 1: `auth` (`src/features/auth/`)
- **Endpoints**: `/users/onboard/student`, `/users/avatar`
- **Hooks**: `useOnboardStudent`, `useUpdateAvatar`
- **Refactored Screens**: `app/(auth)/onboard.tsx`

### Feature 2: `hubs` (`src/features/hubs/`)
- **Endpoints**: `/hubs/my`, `/hubs/:id`, `/hubs/:id/announcements`, `/hubs/:id/discussions`, `/hubs/:id/resources`, `/hubs/:id/assessments`, `/hubs/available-teachers`, `/hubs/:id/reviews`
- **Hooks**: `useMyHubs`, `useHubDetails`, `useAnnouncements`, `useDiscussions`, `useResources`, `useAssessments`, `useAvailableTeachers`, `useHubReviews`, `useCreateHubAnnouncement`, `useCreateHubDiscussion`
- **Refactored Screens**: `app/(tabs)/hubs.tsx`, `app/hub/[id].tsx`, `app/my-schedule.tsx`, `app/(tabs)/index.tsx`

### Feature 3: `forum` (`src/features/forum/`)
- **Endpoints**: `/forum`, `/forum/:id`, `/forum/:id/upvote`, `/forum/:id/resolve`, `/forum/:id/comment`, `/forum/:id/comment/:commentId/upvote`
- **Hooks**: `useForumPosts`, `useForumPost`, `useCreateForumPost`, `useUpvoteForumPost`, `useResolveForumPost`, `useDeleteForumPost`, `useAddForumComment`, `useUpvoteForumComment`
- **Refactored Screens**: `app/(tabs)/forum.tsx`, `app/admin/forum.tsx`

### Feature 4: `blood` (`src/features/blood/`)
- **Endpoints**: `/blood`, `/blood/:id/resolve`, `/blood/:id`
- **Hooks**: `useBloodFeed`, `useCreateBloodPost`, `useResolveBloodPost`, `useDeleteBloodPost`
- **Refactored Screens**: `app/(tabs)/blood.tsx`, `app/admin/blood.tsx`

### Feature 5: `profile` (`src/features/profile/`)
- **Endpoints**: `/users/student-profile`, `/users/teacher-profile`, `/users/avatar`
- **Services**: `studentService.ts`, `teacherService.ts`
- **Hooks**: `useStudentProfile`, `useTeacherProfile` (includes image-picking + Supabase-upload + PATCH orchestration)
- **Refactored Components**: `src/components/profile/StudentProfile.tsx`, `src/components/profile/TeacherProfile.tsx`

### Feature 6: `notices` (`src/features/notices/`)
- **Endpoints**: `/notices`, `/notices/:id`
- **Hooks**: `useNotices`, `useNoticeDetails`, `useCreateNotice`, `useDeleteNotice`
- **Refactored Screens**: `app/notices.tsx`, `app/(tabs)/index.tsx`, `app/admin/notices.tsx`

### Feature 7: `events` (`src/features/events/`)
- **Endpoints**: `/events`, `/events/:id`
- **Hooks**: `useCampusEvents`, `useEventDetails`, `useCreateCampusEvent`, `useDeleteCampusEvent`
- **Refactored Screens**: `app/events.tsx`, `app/admin/events.tsx`

### Feature 8: `alumni` (`src/features/alumni/`)
- **Endpoints**: `/alumni`, `/alumni/:id`
- **Hooks**: `useAlumniList`, `useCreateAlumni`, `useUpdateAlumni`, `useDeleteAlumni`
- **Refactored Screens**: `app/alumni.tsx`, `app/admin/alumni.tsx`

### Feature 9: `complaints` (`src/features/complaints/`)
- **Endpoints**: `/complaints/my`, `/complaints`, `/complaints/:id/status`, `/complaints/:id`
- **Hooks**: `useMyComplaints`, `useAllComplaintsAdmin`, `useCreateComplaint`, `useUpdateComplaintStatus`, `useDeleteComplaint`
- **Refactored Screens**: `app/complaints.tsx`, `app/admin/complaints.tsx`

### Feature 10: `field-booking` (`src/features/field-booking/`)
- **Endpoints**: `/field/settings`, `/field/my-bookings`, `/field/schedule`, `/field/bookings`, `/field/book`, `/field/bookings/:id/status`
- **Hooks**: `useFieldSettings`, `useMyFieldBookings`, `useFieldSchedule`, `useAllFieldBookingsAdmin`, `useCreateFieldBooking`, `useUpdateFieldSettings`, `useUpdateFieldBookingStatus`
- **Refactored Screens**: `app/field-booking.tsx`, `app/admin/field-booking.tsx`

### Feature 11: `schedule` (`src/features/schedule/`)
- **Endpoints**: `/buses`, `/buses/:id`, `/calendars`, `/directory/teachers`
- **Hooks**: `useBusSchedules`, `useCreateBusRoute`, `useDeleteBusRoute`, `useAcademicCalendars`, `useTeachersDirectory`
- **Refactored Screens**: `app/bus-schedule.tsx`, `app/admin-bus-manage.tsx`, `app/academic_calendar.tsx`, `app/directory.tsx`

### Feature 12: `admin` (`src/features/admin/`)
- **Endpoints**: `/users`, `/users/:id/role`, `/users/:id`
- **Hooks**: `useAllUsersAdmin`, `useUpdateUserRoleAdmin`, `useDeleteUserAdmin`

---

## 3. Verification & Testing

- **TypeScript Compilation**: Executed `npx tsc --noEmit` on `smuct-unicompanion-moblie` with exit code `0` (Zero TypeScript errors).
- **Backend API Build**: Executed `npm run build` on `sumct-unicompanion-api` with exit code `0` (Prisma client regenerated, bundle produced successfully).
- **Endpoint Centralization**: Over 17+ duplicate endpoint paths across screen files have been eliminated, and all routes are routed through strongly typed domain services and query hooks.
