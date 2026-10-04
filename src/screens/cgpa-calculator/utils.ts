import { CourseEntry, GRADE_MAP } from "./constants";

export interface CGPAResult {
  totalCredits: number;
  gradedCredits: number;
  remainingCredits: number;
  targetCredits: number;
  calculatedCGPA: string;
  coursesCount: number;
  gradedCoursesCount: number;
  standingInfo: {
    text: string;
    color: string;
  };
}

export const calculateCGPA = (
  courses: CourseEntry[],
  targetSemesterCredits = 20
): CGPAResult => {
  let totalCredits = 0;
  let gradedCredits = 0;
  let totalPoints = 0;
  let gradedCourses = 0;

  courses.forEach((c) => {
    const creditNum = parseFloat(c.credit);
    if (!isNaN(creditNum) && creditNum > 0) {
      totalCredits += creditNum;
      const gradePoint = GRADE_MAP[c.grade];
      if (gradePoint !== undefined) {
        gradedCredits += creditNum;
        totalPoints += creditNum * gradePoint;
        gradedCourses += 1;
      }
    }
  });

  // Calculate target credits (e.g., standard 20, or if total is higher, nearest 5)
  const targetCredits = Math.max(targetSemesterCredits, Math.ceil(totalCredits / 5) * 5 || 20);
  const remainingCredits = Math.max(0, targetCredits - gradedCredits);

  const gpaNum = gradedCredits > 0 ? totalPoints / gradedCredits : 0;
  const gpaStr = gradedCredits > 0 ? gpaNum.toFixed(2) : "0.00";

  let standing = "Enter grades to estimate";
  let standingColor = "#3b5bf5";

  if (gradedCredits > 0) {
    if (gpaNum >= 3.75) {
      standing = "First Class / Excellent";
      standingColor = "#059669";
    } else if (gpaNum >= 3.25) {
      standing = "Very Good Standing";
      standingColor = "#2563eb";
    } else if (gpaNum >= 3.0) {
      standing = "Good Standing";
      standingColor = "#0284c7";
    } else if (gpaNum >= 2.5) {
      standing = "Satisfactory";
      standingColor = "#d97706";
    } else {
      standing = "Academic Probation Risk";
      standingColor = "#dc2626";
    }
  }

  return {
    totalCredits: Math.round(totalCredits * 10) / 10,
    gradedCredits: Math.round(gradedCredits * 10) / 10,
    remainingCredits: Math.round(remainingCredits * 10) / 10,
    targetCredits,
    calculatedCGPA: gpaStr,
    coursesCount: courses.length,
    gradedCoursesCount: gradedCourses,
    standingInfo: { text: standing, color: standingColor },
  };
};

export const sanitizeCredit = (val: string): string => {
  const cleaned = val.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return cleaned;
};

