import { useMemo } from "react";

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  room?: string;
}

export const useTodaysClasses = (myHubs: any[] | undefined): ClassSession[] => {
  return useMemo(() => {
    if (!myHubs || myHubs.length === 0) return [];
    const todayStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    const classesToday: ClassSession[] = [];

    myHubs.forEach((membership: any) => {
      const hub = membership.hub;
      if (!hub || hub.isArchived) return;

      let scheduleArray = hub.weeklyClassSchedule;
      if (typeof scheduleArray === "string") {
        try {
          scheduleArray = JSON.parse(scheduleArray);
        } catch (e) {
          scheduleArray = [];
        }
      }

      if (Array.isArray(scheduleArray)) {
        scheduleArray.forEach((session: any) => {
          if (session.day === todayStr) {
            classesToday.push({
              id: `${hub.id}-${session.startTime}`,
              courseCode: hub.courseCode,
              courseName: hub.courseName,
              startTime: session.startTime,
              endTime: session.endTime,
              room: session.room,
            });
          }
        });
      }
    });
    return classesToday;
  }, [myHubs]);
};
