import { useMemo } from "react";
import { parseWeeklySchedule } from "@/screens/schedule/utils";
import { ClassRoutineItem, TodayStats } from "@/screens/schedule/constants";

export type { ClassRoutineItem };

export interface TodaysClassesResult {
  classes: ClassRoutineItem[];
  stats: TodayStats;
  liveClass?: ClassRoutineItem;
  nextClass?: ClassRoutineItem;
}

export const useTodaysClassesData = (
  myHubs: any[] | null | undefined
): TodaysClassesResult => {
  return useMemo(() => {
    const { todayStats, scheduleSections } = parseWeeklySchedule(myHubs);
    const todaySection = scheduleSections.find(
      (sec) => sec.title === todayStats.weekday
    );
    const classes = todaySection ? todaySection.data : [];

    return {
      classes,
      stats: todayStats,
      liveClass: todayStats.liveClass,
      nextClass: todayStats.nextClass,
    };
  }, [myHubs]);
};

export const useTodaysClasses = (
  myHubs: any[] | null | undefined
): ClassRoutineItem[] => {
  const data = useTodaysClassesData(myHubs);
  return data.classes;
};

