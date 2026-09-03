import { CourseEntry, GRADE_MAP } from "./constants";

export interface CGPAResult {
  totalCredits: number;
  calculatedCGPA: string;
  coursesCount: number;
  standingInfo: {
    text: string;
    color: string;
  };
}

export const calculateCGPA = (courses: CourseEntry[]): CGPAResult => {
  let totalCredits = 0;
  let totalPoints = 0;
  let gradedCourses = 0;

  courses.forEach((c) => {
    const creditNum = parseFloat(c.credit);
    const gradePoint = GRADE_MAP[c.grade];

    if (!isNaN(creditNum) && creditNum > 0 && gradePoint !== undefined) {
      totalCredits += creditNum;
      totalPoints += creditNum * gradePoint;
      gradedCourses += 1;
    }
  });

  const gpaNum = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const gpaStr = totalCredits > 0 ? gpaNum.toFixed(2) : "0.00";

  let standing = "Enter grades to estimate";
  let standingColor = "#c1dcff";

  if (totalCredits > 0) {
    if (gpaNum >= 3.75) {
      standing = "First Class / Excellent";
      standingColor = "#34d399";
    } else if (gpaNum >= 3.25) {
      standing = "Very Good Standing";
      standingColor = "#60a5fa";
    } else if (gpaNum >= 3.0) {
      standing = "Good Standing";
      standingColor = "#93c5fd";
    } else if (gpaNum >= 2.5) {
      standing = "Satisfactory";
      standingColor = "#fde047";
    } else {
      standing = "Academic Probation Risk";
      standingColor = "#f87171";
    }
  }

  return {
    totalCredits: Number(totalCredits.toFixed(2)),
    calculatedCGPA: gpaStr,
    coursesCount: gradedCourses,
    standingInfo: { text: standing, color: standingColor },
  };
};

export const sanitizeCredit = (val: string): string => {
  // Allow only digits and a single period
  const cleaned = val.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join("")}`;
  }
  return cleaned;
};
