import api from "./api";

export interface WeeklyClassScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export interface TermExamItem {
  type: string;
  date?: string;
  time?: string;
  room?: string;
}

export interface CreateHubInput {
  title?: string;
  courseCode: string;
  courseName: string;
  section?: string;
  semester?: number;
  semesterNumber?: number;
  credit?: number;
  batch: string;
  department?: string;
  description?: string;
  schedule?: any[];
  weeklyClassSchedule?: WeeklyClassScheduleItem[] | any;
  termOffer?: string;
  teacherId?: string;
  isReviewOpen?: boolean;
}

export interface UpdateHubInput {
  title?: string;
  courseCode?: string;
  courseName?: string;
  section?: string;
  semester?: number;
  semesterNumber?: number;
  batch?: string;
  department?: string;
  description?: string;
  schedule?: any[];
  weeklyClassSchedule?: any;
  termOffer?: string;
  termExams?: TermExamItem[];
  isReviewOpen?: boolean;
}

export interface CreateAssessmentInput {
  title: string;
  description?: string;
  type: "ASSIGNMENT" | "QUIZ" | "PRESENTATION" | string;
  deadline: string | Date;
  totalMarks: number;
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  fileUrl?: string;
  driveUrl?: string;
  fileType?: string;
  category?: string;
  isStudentNote?: boolean;
}

export interface CreateAnnouncementInput {
  title?: string;
  content: string;
  attachedLinkUrl?: string;
  attachedLinkTitle?: string;
}

export interface CreateDiscussionInput {
  title: string;
  content: string;
}

export interface SubmitReviewInput {
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
  answers?: any;
}

export const getMyHubs = async () => {
  const res = await api.get("/hubs/my");
  return res.data?.data || [];
};
export const getMyHubsAPI = getMyHubs;

export const getHubDetails = async (hubId: string) => {
  const res = await api.get(`/hubs/${hubId}`);
  return res.data?.data;
};
export const getHubDetailsAPI = getHubDetails;

export const getAvailableTeachers = async () => {
  const res = await api.get("/hubs/available-teachers");
  return res.data?.data || [];
};
export const getAvailableTeachersAPI = getAvailableTeachers;

export const createHub = async (data: CreateHubInput) => {
  const res = await api.post("/hubs", data);
  return res.data?.data;
};
export const createHubAPI = createHub;

export const joinHub = async (joinCode: string) => {
  const res = await api.post("/hubs/join", { joinCode });
  return res.data?.data;
};
export const joinHubAPI = joinHub;

export const updateHub = async (hubId: string, data: UpdateHubInput) => {
  const res = await api.patch(`/hubs/${hubId}`, data);
  return res.data?.data;
};
export const updateHubAPI = updateHub;

export const archiveHub = async (hubId: string, isArchived: boolean = true) => {
  const res = await api.patch(`/hubs/${hubId}/archive`, { isArchived });
  return res.data?.data;
};
export const archiveHubAPI = archiveHub;

export const deleteHub = async (hubId: string) => {
  const res = await api.delete(`/hubs/${hubId}`);
  return res.data?.data;
};
export const deleteHubAPI = deleteHub;

export const updateMemberRole = async (
  hubId: string,
  memberId: string,
  role: string,
) => {
  const res = await api.patch(`/hubs/${hubId}/members/${memberId}`, { role });
  return res.data?.data;
};
export const updateMemberRoleAPI = updateMemberRole;

export const removeMember = async (hubId: string, memberId: string) => {
  const res = await api.delete(`/hubs/${hubId}/members/${memberId}`);
  return res.data?.data;
};
export const removeMemberAPI = removeMember;

// Assessments
export const getAssessments = async (hubId: string) => {
  const res = await api.get(`/hubs/${hubId}/assessments`);
  return res.data?.data || [];
};
export const getAssessmentsAPI = getAssessments;

export const createAssessment = async (
  hubId: string,
  data: CreateAssessmentInput,
) => {
  const res = await api.post(`/hubs/${hubId}/assessments`, data);
  return res.data?.data;
};
export const createAssessmentAPI = createAssessment;

export const getAssessmentSubmissions = async (assessmentId: string) => {
  const res = await api.get(`/hubs/assessments/${assessmentId}/submissions`);
  return res.data?.data || [];
};
export const getAssessmentSubmissionsAPI = getAssessmentSubmissions;

export const submitAssessment = async (
  assessmentId: string,
  submittedUrl: string,
) => {
  const res = await api.post(`/hubs/assessments/${assessmentId}/submit`, {
    submittedUrl,
  });
  return res.data?.data;
};
export const submitAssessmentAPI = submitAssessment;

export const gradeSubmission = async (
  submissionId: string,
  marks: number,
) => {
  const res = await api.patch(`/hubs/assessments/submissions/${submissionId}/grade`, {
    marks,
  });
  return res.data?.data;
};
export const gradeSubmissionAPI = gradeSubmission;

export const bulkGrade = async (
  assessmentId: string,
  grades: { studentId: string; marks: number }[],
) => {
  const res = await api.post(
    `/hubs/assessments/${assessmentId}/bulk-grade`,
    grades,
  );
  return res.data?.data;
};
export const bulkGradeAPI = bulkGrade;

// Resources
export const getResources = async (hubId: string) => {
  const res = await api.get(`/hubs/${hubId}/resources`);
  return res.data?.data || [];
};
export const getResourcesAPI = getResources;

export const createResource = async (
  hubId: string,
  data: CreateResourceInput,
) => {
  const res = await api.post(`/hubs/${hubId}/resources`, data);
  return res.data?.data;
};
export const createResourceAPI = createResource;

// Announcements & Discussions
export const getAnnouncements = async (hubId: string) => {
  const res = await api.get(`/hubs/${hubId}/content/announcements`);
  return res.data?.data || [];
};
export const getAnnouncementsAPI = getAnnouncements;

export const createAnnouncement = async (
  hubId: string,
  data: CreateAnnouncementInput,
) => {
  const res = await api.post(`/hubs/${hubId}/content/announcements`, data);
  return res.data?.data;
};
export const createAnnouncementAPI = createAnnouncement;

export const addAnnouncementComment = async (
  hubId: string,
  announcementId: string,
  content: string,
) => {
  const res = await api.post(
    `/hubs/${hubId}/content/announcements/${announcementId}/comments`,
    { content },
  );
  return res.data?.data;
};
export const addAnnouncementCommentAPI = addAnnouncementComment;

export const getDiscussions = async (hubId: string) => {
  const res = await api.get(`/hubs/${hubId}/content/discussions`);
  return res.data?.data || [];
};
export const getDiscussionsAPI = getDiscussions;

export const createDiscussion = async (
  hubId: string,
  data: CreateDiscussionInput,
) => {
  const res = await api.post(`/hubs/${hubId}/content/discussions`, data);
  return res.data?.data;
};
export const createDiscussionAPI = createDiscussion;

export const replyDiscussion = async (
  hubId: string,
  discussionId: string,
  content: string,
) => {
  const res = await api.post(
    `/hubs/${hubId}/content/discussions/${discussionId}/reply`,
    { content },
  );
  return res.data?.data;
};
export const replyDiscussionAPI = replyDiscussion;

// Reviews
export const getReviews = async (hubId: string) => {
  const res = await api.get(`/hubs/${hubId}/reviews`);
  return res.data?.data || { reviews: [], totalReviews: 0, averageRating: 0 };
};
export const getReviewsAPI = getReviews;

export const submitReview = async (
  hubId: string,
  data: SubmitReviewInput,
) => {
  const res = await api.post(`/hubs/${hubId}/reviews`, data);
  return res.data?.data;
};
export const submitReviewAPI = submitReview;
