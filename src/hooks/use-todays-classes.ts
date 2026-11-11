import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { parseWeeklySchedule } from "@/screens/schedule/utils";
import { ClassRoutineItem, TodayStats } from "@/screens/schedule/constants";

export type { ClassRoutineItem };

export interface TodaysClassesResult {
  classes: ClassRoutineItem[];
  stats: TodayStats;
  liveClass?: ClassRoutineItem;
  nextClass?: ClassRoutineItem;
}

const getMinuteBucket = (): number => Math.floor(Date.now() / 60_000) * 60_000;

export const useTodaysClassesData = (
  myHubs: any[] | null | undefined,
): TodaysClassesResult => {
  const [minuteTick, setMinuteTick] = useState<number>(getMinuteBucket);

  useEffect(() => {
    const updateTick = () => setMinuteTick(getMinuteBucket());
    const interval = setInterval(updateTick, 60_000);
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        updateTick();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  return useMemo(() => {
    const { todayStats, scheduleSections } = parseWeeklySchedule(
      myHubs,
      new Date(minuteTick),
    );
    const todaySection = scheduleSections.find(
      (sec) => sec.title === todayStats.weekday,
    );
    const classes = todaySection ? todaySection.data : [];

    return {
      classes,
      stats: todayStats,
      liveClass: todayStats.liveClass,
      nextClass: todayStats.nextClass,
    };
  }, [myHubs, minuteTick]);
};

export const useTodaysClasses = (
  myHubs: any[] | null | undefined,
): ClassRoutineItem[] => {
  const data = useTodaysClassesData(myHubs);
  return data.classes;
};
