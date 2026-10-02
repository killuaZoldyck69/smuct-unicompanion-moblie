import { Platform } from "react-native";

export const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  lightSlate: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  emerald: "#10b981",
  gold: "#f59e0b",
  indigo: "#4f46e5",
  rose: "#f43f5e",
  shadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
};

export const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const RATING_LABELS: Record<number, string> = {
  1: "Needs Improvement",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent Course",
};

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  isAnonymous: boolean;
  answers?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
  studentId?: string;
  student?: {
    id?: string;
    name: string;
    email?: string;
    image?: string | null;
    studentProfile?: any;
  };
}

export type RatingDistribution = Record<number, number>;

export interface ReviewsDataResponse {
  reviews: ReviewItem[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  isReviewOpen: boolean;
  reviewQuestions: string[];
  hasSubmitted: boolean;
  myReview: ReviewItem | null;
}

export interface ReviewTabProps {
  hubId: string;
  isTeacher?: boolean;
  canManage: boolean;
  canSubmit: boolean;
  currentUserId?: string;
}
