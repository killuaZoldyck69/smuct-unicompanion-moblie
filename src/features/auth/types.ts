export interface OnboardStudentInput {
  studentId: string;
  faculty: string;
  department: string;
  program: string;
  batch: string;
  currentSemester: number;
  section: string;
}

export interface UpdateProfileImageInput {
  imageUrl: string;
}
