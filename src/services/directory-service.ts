import api from "./api";

export interface TeacherDirectoryItem {
  id: string;
  name: string;
  email: string;
  teacherProfile?: {
    designation: string;
    department: string;
    phone?: string | null;
    roomNo?: string | null;
    image?: string | null;
  } | null;
}

export const getDirectoryTeachers = async (): Promise<TeacherDirectoryItem[]> => {
  const res = await api.get("/directory/teachers");
  return res.data?.data || [];
};
export const getDirectoryTeachersAPI = getDirectoryTeachers;
export const getTeachersDirectoryAPI = getDirectoryTeachers;
