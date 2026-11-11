import { PASTEL_THEMES, PastelTheme } from "./constants";
export {
  type ClassIntervalInfo,
  parseTimeToMinutes,
  timeToMinutes,
  formatTimeDisplay,
  calculateDuration,
  getEffectiveClassTimes,
  getEffectiveSessionWindow,
  calculateClassInterval,
  isSameCalendarDay,
  isClassNoticeEffective,
  isClassLiveNow,
  getCurrentWeekDays,
  parseWeeklySchedule,
} from "./schedule-logic";

export const getDeterministicColorTheme = (
  courseCode: string,
  courseName: string,
): PastelTheme => {
  const combined = `${courseCode} ${courseName}`.toLowerCase();

  if (
    combined.includes("structure") ||
    combined.includes("algorithm") ||
    combined.includes("database") ||
    combined.includes("data") ||
    combined.includes("network")
  ) {
    return PASTEL_THEMES.blue;
  }

  if (
    combined.includes("mobile") ||
    combined.includes("android") ||
    combined.includes("web") ||
    combined.includes("app") ||
    combined.includes("software")
  ) {
    return PASTEL_THEMES.mint;
  }

  if (
    combined.includes("java") ||
    combined.includes("oop") ||
    combined.includes("programming") ||
    combined.includes("python") ||
    combined.includes("math") ||
    combined.includes("calculus")
  ) {
    return PASTEL_THEMES.yellow;
  }

  if (
    combined.includes("design") ||
    combined.includes("art") ||
    combined.includes("multimedia") ||
    combined.includes("ui") ||
    combined.includes("graphics") ||
    combined.includes("english")
  ) {
    return PASTEL_THEMES.rose;
  }

  if (
    combined.includes("system") ||
    combined.includes("security") ||
    combined.includes("ai")
  ) {
    return PASTEL_THEMES.purple;
  }

  let sum = 0;
  for (let i = 0; i < combined.length; i++) {
    sum += combined.charCodeAt(i);
  }
  const themes = [
    PASTEL_THEMES.blue,
    PASTEL_THEMES.mint,
    PASTEL_THEMES.yellow,
    PASTEL_THEMES.rose,
    PASTEL_THEMES.purple,
    PASTEL_THEMES.white,
  ];
  return themes[sum % themes.length];
};

