import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyHubsAPI,
  getHubDetailsAPI,
  getAvailableTeachersAPI,
  createHubAPI,
  joinHubAPI,
  updateHubAPI,
  archiveHubAPI,
  deleteHubAPI,
  updateMemberRoleAPI,
  removeMemberAPI,
  getAssessmentsAPI,
  createAssessmentAPI,
  getAssessmentSubmissionsAPI,
  submitAssessmentAPI,
  gradeSubmissionAPI,
  bulkGradeAPI,
  getResourcesAPI,
  createResourceAPI,
  getAnnouncementsAPI,
  createAnnouncementAPI,
  addAnnouncementCommentAPI,
  getDiscussionsAPI,
  createDiscussionAPI,
  replyDiscussionAPI,
  getReviewsAPI,
  submitReviewAPI,
} from "@/services/hub-service";
import {
  CreateHubInput,
  UpdateHubInput,
  CreateAssessmentInput,
  CreateResourceInput,
  CreateAnnouncementInput,
  CreateDiscussionInput,
  SubmitReviewInput,
} from "./types";

export const useMyHubs = () => {
  return useQuery({
    queryKey: ["myHubs"],
    queryFn: getMyHubsAPI,
  });
};

export const useHubDetails = (hubId: string) => {
  return useQuery({
    queryKey: ["hubDetails", hubId],
    queryFn: () => getHubDetailsAPI(hubId),
    enabled: !!hubId,
  });
};

export const useAvailableTeachers = () => {
  return useQuery({
    queryKey: ["availableTeachers"],
    queryFn: getAvailableTeachersAPI,
  });
};

export const useCreateHub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHubInput) => createHubAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
    },
  });
};

export const useJoinHub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (joinCode: string) => joinHubAPI(joinCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
    },
  });
};

export const useUpdateHub = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateHubInput) => updateHubAPI(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDetails", hubId] });
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
    },
  });
};

export const useArchiveHub = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isArchived: boolean) => archiveHubAPI(hubId, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDetails", hubId] });
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
    },
  });
};

export const useDeleteHub = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hubId: string) => deleteHubAPI(hubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
    },
  });
};

export const useUpdateMemberRole = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      updateMemberRoleAPI(hubId, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDetails", hubId] });
    },
  });
};

export const useRemoveMember = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMemberAPI(hubId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubDetails", hubId] });
    },
  });
};

// --- Assessments Hooks ---
export const useAssessments = (hubId: string) => {
  return useQuery({
    queryKey: ["assessments", hubId],
    queryFn: () => getAssessmentsAPI(hubId),
    enabled: !!hubId,
  });
};

export const useCreateAssessment = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssessmentInput) => createAssessmentAPI(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments", hubId] });
      queryClient.invalidateQueries({ queryKey: ["myHubs"] });
    },
  });
};

export const useAssessmentSubmissions = (assessmentId: string) => {
  return useQuery({
    queryKey: ["submissions", assessmentId],
    queryFn: () => getAssessmentSubmissionsAPI(assessmentId),
    enabled: !!assessmentId,
  });
};

export const useSubmitAssessment = (hubId: string, assessmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submittedUrl: string) => submitAssessmentAPI(assessmentId, submittedUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments", hubId] });
      queryClient.invalidateQueries({ queryKey: ["submissions", assessmentId] });
    },
  });
};

export const useGradeSubmission = (assessmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, marks }: { submissionId: string; marks: number }) =>
      gradeSubmissionAPI(submissionId, marks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", assessmentId] });
    },
  });
};

export const useBulkGrade = (assessmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (grades: { studentId: string; marks: number }[]) =>
      bulkGradeAPI(assessmentId, grades),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", assessmentId] });
    },
  });
};

// --- Resources Hooks ---
export const useResources = (hubId: string) => {
  return useQuery({
    queryKey: ["resources", hubId],
    queryFn: () => getResourcesAPI(hubId),
    enabled: !!hubId,
  });
};

export const useCreateResource = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateResourceInput) => createResourceAPI(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", hubId] });
    },
  });
};

// --- Content Hooks ---
export const useAnnouncements = (hubId: string) => {
  return useQuery({
    queryKey: ["announcements", hubId],
    queryFn: () => getAnnouncementsAPI(hubId),
    enabled: !!hubId,
  });
};

export const useCreateAnnouncement = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => createAnnouncementAPI(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", hubId] });
    },
  });
};

export const useAddAnnouncementComment = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ announcementId, content }: { announcementId: string; content: string }) =>
      addAnnouncementCommentAPI(hubId, announcementId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements", hubId] });
    },
  });
};

export const useDiscussions = (hubId: string) => {
  return useQuery({
    queryKey: ["discussions", hubId],
    queryFn: () => getDiscussionsAPI(hubId),
    enabled: !!hubId,
  });
};

export const useCreateDiscussion = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscussionInput) => createDiscussionAPI(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", hubId] });
    },
  });
};

export const useReplyDiscussion = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ discussionId, content }: { discussionId: string; content: string }) =>
      replyDiscussionAPI(hubId, discussionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", hubId] });
    },
  });
};

// --- Reviews Hooks ---
export const useReviews = (hubId: string) => {
  return useQuery({
    queryKey: ["reviews", hubId],
    queryFn: () => getReviewsAPI(hubId),
    enabled: !!hubId,
  });
};

export const useSubmitReview = (hubId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitReviewInput) => submitReviewAPI(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", hubId] });
    },
  });
};
