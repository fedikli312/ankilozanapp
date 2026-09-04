import { getLatestLabUnitByMarker } from "../getLatestLabUnit";

const RANGE = { rangeStart: "2026-08-05", rangeEnd: "2026-09-04" };

describe("getLatestLabUnitByMarker", () => {
  it("returns an empty map for no results", () => {
    expect(getLatestLabUnitByMarker([], RANGE)).toEqual({});
  });

  it("picks the most-recent-in-range result's own recorded unit per marker", () => {
    const results = [
      { marker: "CRP", unit: "mg/L", recordedDate: "2026-08-10" },
      { marker: "CRP", unit: "mg/L", recordedDate: "2026-08-25" },
      { marker: "ESR", unit: "mm/hr", recordedDate: "2026-08-20" },
    ];
    expect(getLatestLabUnitByMarker(results, RANGE)).toEqual({ CRP: "mg/L", ESR: "mm/hr" });
  });

  it("ignores results outside the range", () => {
    const results = [
      { marker: "CRP", unit: "mg/L", recordedDate: "2026-08-10" },
      { marker: "CRP", unit: "mg/dL", recordedDate: "2026-07-01" }, // out of range, and a different unit — must not win
    ];
    expect(getLatestLabUnitByMarker(results, RANGE)).toEqual({ CRP: "mg/L" });
  });

  it("uses the real recorded unit even if it genuinely differs from the marker's usual default (e.g. a user-edited unit)", () => {
    const results = [{ marker: "CRP", unit: "mg/dL", recordedDate: "2026-08-10" }];
    expect(getLatestLabUnitByMarker(results, RANGE)).toEqual({ CRP: "mg/dL" });
  });
});
