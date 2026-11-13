import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { forumQueryKeys } from "@/features/forum/useForum";
import {
  acceptUgcTerms,
  createForumReport,
  getAdminForumReports,
  getCachedUgcTermsAccepted,
  getUgcTermsStatus,
  reviewAdminForumReport,
  setCachedUgcTermsAccepted,
  type AdminForumReportsResponse,
  type AdminReportStatusFilter,
  type AdminReportTargetFilter,
  type CreateUgcReportInput,
  type ReviewAdminForumReportInput,
  type UgcTermsStatus,
} from "@/services/ugc-service";

export const ugcQueryKeys = {
  terms: (userId?: string) => ["ugcTerms", userId || "current"] as const,
  adminReports: (params?: Record<string, unknown>) =>
    ["adminForumReports", params] as const,
};

export const useUgcTermsStatus = (userId?: string, enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getCachedUgcTermsAccepted(userId).then((cachedAt) => {
      if (!active || !cachedAt) return;
      const existing = queryClient.getQueryData<UgcTermsStatus>(
        ugcQueryKeys.terms(userId),
      );
      if (!existing) {
        queryClient.setQueryData<UgcTermsStatus>(ugcQueryKeys.terms(userId), {
          accepted: true,
          ugcTermsAcceptedAt: cachedAt,
        });
      }
    });
    return () => {
      active = false;
    };
  }, [userId, queryClient]);

  const query = useQuery<UgcTermsStatus>({
    queryKey: ugcQueryKeys.terms(userId),
    queryFn: ({ signal }) => getUgcTermsStatus(signal),
    enabled: enabled && Boolean(userId),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!userId || !query.data) return;
    setCachedUgcTermsAccepted(
      query.data.accepted ? query.data.ugcTermsAcceptedAt : null,
      userId,
    );
  }, [userId, query.data]);

  return query;
};

export const useAcceptUgcTerms = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => acceptUgcTerms(),
    onSuccess: (status) => {
      setCachedUgcTermsAccepted(status.ugcTermsAcceptedAt, userId);
      queryClient.setQueryData(ugcQueryKeys.terms(userId), status);
    },
  });
};

export const useCreateForumReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUgcReportInput) => createForumReport(input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
      if (variables.targetType === "FORUM_POST") {
        queryClient.invalidateQueries({
          queryKey: forumQueryKeys.detail(variables.targetId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["adminForumReports"] });
    },
  });
};

export const useAdminForumReports = (
  params?: {
    status?: AdminReportStatusFilter;
    targetType?: AdminReportTargetFilter;
    page?: number;
    limit?: number;
  },
  enabled = true,
) => {
  return useQuery<AdminForumReportsResponse>({
    queryKey: ugcQueryKeys.adminReports(params),
    queryFn: ({ signal }) => getAdminForumReports(params, signal),
    enabled,
    staleTime: 1000 * 30,
  });
};

export const useReviewAdminForumReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      input,
    }: {
      reportId: string;
      input: ReviewAdminForumReportInput;
    }) => reviewAdminForumReport(reportId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminForumReports"] });
      queryClient.invalidateQueries({ queryKey: forumQueryKeys.all });
    },
  });
};
