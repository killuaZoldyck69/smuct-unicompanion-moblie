import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();

function readSrc(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function loadExportedFunction(relPath, fnName) {
  const source = readSrc(relPath);
  const start = source.indexOf(`export const ${fnName}`);
  assert.notEqual(start, -1, `${fnName} must be exported in ${relPath}`);
  const snippet = source.slice(start, source.indexOf("\n};", start) + 3);
  const { outputText } = ts.transpileModule(snippet, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const mod = { exports: {} };
  const fn = new Function("exports", "module", outputText);
  fn(mod.exports, mod);
  return mod.exports[fnName];
}

describe("Academic Calendar security, DB & reliability audit checks", () => {
  it("extracts backend API error messages safely with fallback via getCalendarApiErrorMessage", () => {
    const getCalendarApiErrorMessage = loadExportedFunction(
      "src/services/calendar-service.ts",
      "getCalendarApiErrorMessage",
    );

    assert.equal(
      getCalendarApiErrorMessage(
        {
          message: "Request failed with status code 422",
          response: { data: { message: "CSV validation failed at Row 2" } },
        },
        "Fallback",
      ),
      "CSV validation failed at Row 2",
    );
    assert.equal(
      getCalendarApiErrorMessage({ message: "Network Error" }, "Fallback"),
      "Network Error",
    );
    assert.equal(
      getCalendarApiErrorMessage({ response: { data: { message: "   " } } }, "Fallback"),
      "Fallback",
    );
    assert.equal(getCalendarApiErrorMessage(null, "Fallback"), "Fallback");
  });

  it("invalidates calendarKeys.upcoming on calendar and event mutations", () => {
    const useScheduleSrc = readSrc("src/features/schedule/useSchedule.ts");
    assert.ok(useScheduleSrc.includes("upcoming: [\"academicEvents\", \"upcoming\"] as const"));
    assert.ok(
      useScheduleSrc.includes("qc.invalidateQueries({ queryKey: calendarKeys.upcoming });"),
      "invalidateCalendarQueries must invalidate calendarKeys.upcoming",
    );
  });

  it("avoids duplicate parallel fetches on student AcademicCalendarScreen mount & refresh", () => {
    const studentScreen = readSrc("src/screens/academic-calendar/index.tsx");
    assert.ok(studentScreen.includes("shouldFetchFallbackList"));
    assert.ok(studentScreen.includes("useAcademicCalendars(shouldFetchFallbackList)"));
    assert.ok(studentScreen.includes("const currentRes = await refetchCurrent();"));
    assert.equal(
      studentScreen.includes("Promise.all([refetchCurrent(), refetchAll()])"),
      false,
      "onRefresh should not unconditionally fire both queries in parallel",
    );
  });

  it("enforces MAX_CSV_BYTES size check before reading file contents into memory", () => {
    const csvModal = readSrc("src/screens/admin-calendar/components/CsvImportModal.tsx");
    assert.ok(csvModal.includes("const MAX_CSV_BYTES = 500_000;"));
    assert.ok(csvModal.includes("asset.size > MAX_CSV_BYTES"));
    assert.ok(csvModal.includes("content.length > MAX_CSV_BYTES"));
    assert.ok(csvModal.includes("getCalendarApiErrorMessage"));
  });

  it("rethrows errors cleanly, rolls back orphaned CSV calendars, and guards concurrent mutations", () => {
    const adminScreen = readSrc("src/screens/admin-calendar/index.tsx");
    assert.ok(adminScreen.includes("getCalendarApiErrorMessage"));
    assert.ok(adminScreen.includes("isExportingRef"));
    assert.ok(adminScreen.includes("if (updateStatusMutation.isPending) return;"));
    assert.ok(adminScreen.includes("if (duplicateCalendarMutation.isPending) return;"));
    assert.ok(adminScreen.includes("if (deleteCalendarMutation.isPending) return;"));
    assert.ok(adminScreen.includes("if (deleteEventMutation.isPending) return;"));
    assert.ok(adminScreen.includes("disabled={duplicateCalendarMutation.isPending}"));
    assert.ok(adminScreen.includes("let createdCalendarId: string | null = null;"));
    assert.ok(
      adminScreen.includes("deleteCalendarMutation.mutateAsync(createdCalendarId)"),
      "handleCommitCsvImport must roll back orphaned draft calendar if step 2 fails",
    );

    const nodeModal = readSrc("src/screens/admin-calendar/components/NodeInspectorModal.tsx");
    const createModal = readSrc("src/screens/admin-calendar/components/CreateCalendarModal.tsx");
    const audienceModal = readSrc("src/screens/admin-calendar/components/EditAudienceModal.tsx");
    assert.ok(nodeModal.includes("getCalendarApiErrorMessage"));
    assert.ok(createModal.includes("getCalendarApiErrorMessage"));
    assert.ok(audienceModal.includes("getCalendarApiErrorMessage"));
    assert.ok(audienceModal.includes('targetBatch: isGlobal ? "" : targetBatch.trim()'));
  });
});
