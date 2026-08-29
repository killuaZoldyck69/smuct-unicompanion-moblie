# Component Reorganization Log: B7.3 — Reorganize `src/components/`

## Date: 2026-08-29
## Target: React Native / Expo Mobile Application (`smuct-unicompanion-moblie`)

---

## 1. Overview
In accordance with [Expo's Official App Folder Structure Best Practices](https://expo.dev/blog/expo-app-folder-structure-best-practices):
- `src/components/` now holds **only reusable UI primitives** shared across 2 or more screens.
- All **screen-specific components, cards, and modals** have been relocated into their respective screen's `src/screens/<name>/components/` folder.
- All component filenames have been standardized to **kebab-case** (per Expo's current Jan 2026 guidelines).
- All component style definitions (`StyleSheet.create({...})`) are colocated within their respective component files.

---

## 2. Component Reorganization Map

### A. Shared Cross-Screen Components (Retained in `src/components/`)

| Original Path | New Path | Description |
|---|---|---|
| `src/components/ui/Avatar.tsx` | `src/components/ui/avatar.tsx` | Shared user avatar primitive |
| `src/components/ui/Button.tsx` | `src/components/ui/button.tsx` | Shared button primitive |
| `src/components/ui/EmptyState.tsx` | `src/components/ui/empty-state.tsx` | Shared empty placeholder display |
| `src/components/ui/Input.tsx` | `src/components/ui/input.tsx` | Shared text input primitive |
| `src/components/ui/LoadingOverlay.tsx` | `src/components/ui/loading-overlay.tsx` | Shared full-screen loading spinner |
| `src/components/layout/ScreenHeader.tsx` | `src/components/layout/screen-header.tsx` | Shared navigation screen header |

---

### B. Screen-Specific Components (Relocated to `src/screens/<name>/components/`)

#### 1. Hubs Dashboard Screen (`src/screens/hubs/components/`)
| Original Path | New Path |
|---|---|
| `src/components/hub/CreateHubModal.tsx` | `src/screens/hubs/components/create-hub-modal.tsx` |
| `src/components/hub/SearchableTeacherSelect.tsx` | `src/screens/hubs/components/searchable-teacher-select.tsx` |
| `src/components/hub/HubCard.tsx` | `src/screens/hubs/components/hub-card.tsx` |

#### 2. Hub Detail Screen (`src/screens/hub-detail/components/`)
| Original Path | New Path |
|---|---|
| `src/components/hub/HubHeader.tsx` | `src/screens/hub-detail/components/hub-header.tsx` |
| `src/components/hub/UploadResourceModal.tsx` | `src/screens/hub-detail/components/upload-resource-modal.tsx` |
| `src/components/hub/cards/AnnouncementCard.tsx` | `src/screens/hub-detail/components/announcement-card.tsx` |
| `src/components/hub/cards/ResourceCard.tsx` | `src/screens/hub-detail/components/resource-card.tsx` |
| `src/components/hub/cards/DiscussionCard.tsx` | `src/screens/hub-detail/components/discussion-card.tsx` |
| `src/components/hub/cards/MemberRow.tsx` | `src/screens/hub-detail/components/member-row.tsx` |
| `src/components/hub/cards/AssessmentCard.tsx` | `src/screens/hub-detail/components/assessment-detail-card.tsx` |
| `src/components/hub/modals/AnnouncementCommentsModal.tsx` | `src/screens/hub-detail/components/announcement-comments-modal.tsx` |
| `src/components/hub/modals/AskQuestionModal.tsx` | `src/screens/hub-detail/components/ask-question-modal.tsx` |
| `src/components/hub/modals/CreateAnnouncementModal.tsx` | `src/screens/hub-detail/components/create-announcement-modal.tsx` |
| `src/components/hub/modals/CreateCourseworkModal.tsx` | `src/screens/hub-detail/components/create-coursework-modal.tsx` |
| `src/components/hub/modals/DiscussionRepliesModal.tsx` | `src/screens/hub-detail/components/discussion-replies-modal.tsx` |
| `src/components/hub/modals/EditHubModal.tsx` | `src/screens/hub-detail/components/edit-hub-modal.tsx` |
| `src/components/hub/modals/HubOptionsModal.tsx` | `src/screens/hub-detail/components/hub-options-modal.tsx` |
| `src/components/hub/modals/ManageMemberModal.tsx` | `src/screens/hub-detail/components/manage-member-modal.tsx` |

#### 3. Profile Screen (`src/screens/profile/components/`)
| Original Path | New Path |
|---|---|
| `src/components/profile/StudentProfile.tsx` | `src/screens/profile/components/student-profile.tsx` |
| `src/components/profile/TeacherProfile.tsx` | `src/screens/profile/components/teacher-profile.tsx` |
| `src/components/profile/AdminProfile.tsx` | `src/screens/profile/components/admin-profile.tsx` |

---

## 3. Verification Results

- **TypeScript Compilation (`npx tsc --noEmit`)**: Exited with code `0` (Zero compiler/type errors).
- **Directory Structure Cleanliness**: `src/components/` now contains strictly `layout/` and `ui/`.
