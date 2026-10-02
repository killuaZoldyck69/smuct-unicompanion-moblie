import { useMemo } from "react";
import { CourseHubMember, MemberCounts } from "@/types/member.types";

export function useMemberSorting(members: CourseHubMember[] | undefined) {
  const sortedMembers = useMemo<CourseHubMember[]>(() => {
    if (!Array.isArray(members)) return [];

    const teachers: CourseHubMember[] = [];
    const leadership: CourseHubMember[] = [];
    const students: CourseHubMember[] = [];

    members.forEach((m) => {
      if (m.role === "TEACHER") {
        teachers.push(m);
      } else if (m.role === "CR" || m.role === "TA") {
        leadership.push(m);
      } else {
        students.push(m);
      }
    });

    teachers.sort((a, b) =>
      (a.user?.name || "").localeCompare(b.user?.name || ""),
    );

    leadership.sort((a, b) => {
      if (a.role !== b.role) return a.role === "CR" ? -1 : 1;
      return (a.user?.name || "").localeCompare(b.user?.name || "");
    });

    students.sort((a, b) =>
      (a.user?.name || "").localeCompare(b.user?.name || ""),
    );

    return [...teachers, ...leadership, ...students];
  }, [members]);

  const counts = useMemo<MemberCounts>(() => {
    const total = Array.isArray(members) ? members.length : 0;
    const teachers = Array.isArray(members)
      ? members.filter((m) => m.role === "TEACHER").length
      : 0;
    const students = total - teachers;

    return { total, teachers, students };
  }, [members]);

  return { sortedMembers, counts };
}
