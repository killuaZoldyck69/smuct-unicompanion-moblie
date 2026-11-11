import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_API_BASE_URL,
  resolveApiBaseUrl,
} from "../src/services/api-config.ts";
import { shouldHandleSessionInvalidation } from "../src/services/auth-session-policy.ts";
import {
  isClassLiveNow,
  isClassNoticeEffective,
  parseTimeToMinutes,
  parseWeeklySchedule,
} from "../src/screens/schedule/schedule-logic.ts";
import { parseSemesterDisplay } from "../src/utils/academic-ordinal.ts";

test("Mobile-6: resolveApiBaseUrl handles missing or whitespace values without throwing", () => {
  assert.equal(resolveApiBaseUrl(undefined), DEFAULT_API_BASE_URL);
  assert.equal(resolveApiBaseUrl("   "), DEFAULT_API_BASE_URL);
  assert.equal(
    resolveApiBaseUrl("https://api.example.edu///"),
    "https://api.example.edu",
  );
});

test("Mobile-13: shouldHandleSessionInvalidation flags 401 and restriction 403 but skips login routes", () => {
  assert.equal(shouldHandleSessionInvalidation(401, "/hubs/my", {}), true);
  assert.equal(
    shouldHandleSessionInvalidation(403, "/hubs/my", {
      error: "Forbidden. Your account has been restricted by an administrator.",
    }),
    true,
  );
  assert.equal(
    shouldHandleSessionInvalidation(403, "/hubs/my", {
      error: "Forbidden. Admin access required.",
    }),
    false,
  );
  assert.equal(
    shouldHandleSessionInvalidation(401, "/auth/sign-in/email", {}),
    false,
  );
});

test("Schedule edge cases: midnight 00:00 parsing and isClassLiveNow", () => {
  assert.equal(parseTimeToMinutes("00:00"), 0);
  assert.equal(parseTimeToMinutes("12:00 AM"), 0);
  assert.equal(parseTimeToMinutes("invalid"), null);

  // Wednesday at 00:30 AM
  const wednesdayMidnight = new Date(2026, 10, 11, 0, 30, 0);
  assert.equal(
    isClassLiveNow("Wednesday", "00:00", "01:30", wednesdayMidnight),
    true,
  );
});

test("Schedule activeNotice blocks future-dated notices while keeping same-day and 24h night-before notices", () => {
  const mondayMorning = new Date(2026, 10, 9, 9, 0, 0); // Mon Nov 9 2026 09:00 local

  const nextWeekNotice = new Date(2026, 10, 16, 9, 0, 0).toISOString();
  assert.equal(isClassNoticeEffective(nextWeekNotice, mondayMorning), false);

  const sundayNightNotice = new Date(2026, 10, 8, 21, 0, 0).toISOString();
  assert.equal(isClassNoticeEffective(sundayNightNotice, mondayMorning), true);

  const staleNotice = new Date(2026, 10, 2, 9, 0, 0).toISOString();
  assert.equal(isClassNoticeEffective(staleNotice, mondayMorning), false);

  const { todayStats } = parseWeeklySchedule(
    [
      {
        id: "m1",
        role: "STUDENT",
        hub: {
          id: "hub-1",
          courseCode: "CSE-301",
          courseName: "Algorithms",
          weeklyClassSchedule: [
            {
              day: "Monday",
              startTime: "10:00 AM",
              endTime: "11:30 AM",
              room: "402",
            },
          ],
          classNotices: [
            {
              id: "n-future",
              hubId: "hub-1",
              authorId: "u1",
              type: "CANCELLED",
              message: "Cancelled next week",
              targetDay: "Monday",
              effectiveDate: nextWeekNotice,
              isActive: true,
              createdAt: mondayMorning.toISOString(),
            },
          ],
        },
      },
    ],
    mondayMorning,
  );

  // Cancelled notice from next week must NOT attach or prevent today's nextClass
  assert.equal(todayStats.nextClass?.courseCode, "CSE-301");
  assert.equal(todayStats.nextClass?.activeNotice, undefined);
});

test("Schedule parseWeeklySchedule handles TIME_CHANGE notices and excludes CANCELLED classes from live/next", () => {
  const mondayMorning = new Date(2026, 10, 9, 9, 30, 0); // Mon Nov 9 2026 09:30 local
  const todayIso = mondayMorning.toISOString();

  const { todayStats } = parseWeeklySchedule(
    [
      {
        id: "m1",
        role: "STUDENT",
        hub: {
          id: "hub-cancelled",
          courseCode: "CSE-101",
          courseName: "Intro",
          weeklyClassSchedule: [
            { day: "Monday", startTime: "09:00 AM", endTime: "10:30 AM", room: "101" },
          ],
          classNotices: [
            {
              id: "n-cancel",
              hubId: "hub-cancelled",
              authorId: "u1",
              type: "CANCELLED",
              message: "Cancelled",
              targetDay: "Monday",
              effectiveDate: todayIso,
              isActive: true,
              createdAt: todayIso,
            },
          ],
        },
      },
      {
        id: "m2",
        role: "STUDENT",
        hub: {
          id: "hub-rescheduled",
          courseCode: "CSE-202",
          courseName: "Database",
          weeklyClassSchedule: [
            { day: "Monday", startTime: "08:30 AM", endTime: "10:00 AM", room: "202" },
          ],
          classNotices: [
            {
              id: "n-move",
              hubId: "hub-rescheduled",
              authorId: "u1",
              type: "TIME_CHANGE",
              message: "Moved later",
              targetDay: "Monday",
              effectiveDate: todayIso,
              newTime: "11:00 AM",
              isActive: true,
              createdAt: todayIso,
            },
          ],
        },
      },
    ],
    mondayMorning,
  );

  assert.equal(todayStats.liveClass, undefined);
  assert.equal(todayStats.nextClass?.courseCode, "CSE-202");
});

test("parseSemesterDisplay splits semester ordinals cleanly for superscript UI", () => {
  assert.deepEqual(parseSemesterDisplay(9), {
    numberPart: "9",
    suffix: "th",
    trailingText: "Sem",
    accessibilityLabel: "9th Sem",
  });
  assert.deepEqual(parseSemesterDisplay(1), {
    numberPart: "1",
    suffix: "st",
    trailingText: "Sem",
    accessibilityLabel: "1st Sem",
  });
  assert.deepEqual(parseSemesterDisplay("2nd"), {
    numberPart: "2",
    suffix: "nd",
    trailingText: "Sem",
    accessibilityLabel: "2nd Sem",
  });
  assert.deepEqual(parseSemesterDisplay("SEM 3"), {
    numberPart: "3",
    suffix: "rd",
    trailingText: "Sem",
    accessibilityLabel: "3rd Sem",
  });
  assert.deepEqual(parseSemesterDisplay("11th Sem"), {
    numberPart: "11",
    suffix: "th",
    trailingText: "Sem",
    accessibilityLabel: "11th Sem",
  });
  assert.equal(parseSemesterDisplay(""), null);
  assert.equal(parseSemesterDisplay(null), null);
});
