import { presentMedicationDetail, NEEDS_ATTENTION_LIMIT, RECENT_HISTORY_LIMIT } from "../presentMedicationDetail";
import type { MedicationAdministrationLike } from "../presentMedicationDetail";

function admin(
  id: string,
  scheduledFor: string,
  status: MedicationAdministrationLike["status"],
  actualTime: string | null = null,
): MedicationAdministrationLike {
  return { id, scheduledFor, status, actualTime };
}

describe("presentMedicationDetail", () => {
  const today = "2026-09-09";

  it("picks the earliest pending administration as the current dose", () => {
    const result = presentMedicationDetail(
      [
        admin("a", "2026-09-11T08:00", "pending"),
        admin("b", "2026-09-09T08:00", "pending"),
        admin("c", "2026-09-10T08:00", "pending"),
      ],
      today,
    );
    expect(result.currentDose?.id).toBe("b");
  });

  it("returns null current dose when nothing is pending", () => {
    const result = presentMedicationDetail([admin("a", "2026-09-08T08:00", "taken", "2026-09-08T08:00")], today);
    expect(result.currentDose).toBeNull();
  });

  it("treats an overdue pending dose (before today) as the current dose, not future ones", () => {
    const result = presentMedicationDetail(
      [admin("overdue", "2026-09-05T08:00", "pending"), admin("future", "2026-09-15T08:00", "pending")],
      today,
    );
    expect(result.currentDose?.id).toBe("overdue");
  });

  it("distinguishes unresolved (needsAttention) from recorded (recentHistory) — future scheduled doses are never treated as history", () => {
    const result = presentMedicationDetail(
      [
        admin("current", "2026-09-01T08:00", "pending"), // earliest pending -> currentDose
        admin("backlog-1", "2026-09-03T08:00", "pending"), // pending, before today -> needsAttention
        admin("backlog-2", "2026-09-05T08:00", "pending"), // pending, before today -> needsAttention
        admin("future", "2026-09-20T08:00", "pending"), // pending, AFTER today -> neither backlog nor history
        admin("taken-1", "2026-09-08T08:00", "taken", "2026-09-08T08:05"),
      ],
      today,
    );
    expect(result.currentDose?.id).toBe("current");
    expect(result.needsAttention.map((a) => a.id)).toEqual(["backlog-1", "backlog-2"]);
    expect(result.recentHistory.map((a) => a.id)).toEqual(["taken-1"]);
    // The future pending row must appear nowhere in either list.
    expect(result.needsAttention.some((a) => a.id === "future")).toBe(false);
    expect(result.recentHistory.some((a) => a.id === "future")).toBe(false);
  });

  it("caps needsAttention at NEEDS_ATTENTION_LIMIT", () => {
    const backlog = Array.from({ length: NEEDS_ATTENTION_LIMIT + 4 }, (_, i) =>
      admin(`backlog-${i}`, `2026-08-${String(i + 1).padStart(2, "0")}T08:00`, "pending"),
    );
    const result = presentMedicationDetail([admin("current", "2026-08-01T07:00", "pending"), ...backlog], today);
    expect(result.needsAttention).toHaveLength(NEEDS_ATTENTION_LIMIT);
  });

  it("orders recentHistory most-recent-first and caps it at RECENT_HISTORY_LIMIT, exposing hasMoreHistory", () => {
    const resolved = Array.from({ length: RECENT_HISTORY_LIMIT + 3 }, (_, i) =>
      admin(`taken-${i}`, `2026-09-${String(i + 1).padStart(2, "0")}T08:00`, "taken", `2026-09-${String(i + 1).padStart(2, "0")}T08:05`),
    );
    const result = presentMedicationDetail(resolved, today);

    expect(result.recentHistory).toHaveLength(RECENT_HISTORY_LIMIT);
    expect(result.hasMoreHistory).toBe(true);
    expect(result.totalResolvedCount).toBe(resolved.length);
    // Most-recent-first: the highest-dated id should be first.
    expect(result.recentHistory[0].id).toBe(`taken-${RECENT_HISTORY_LIMIT + 2}`);
    for (let i = 1; i < result.recentHistory.length; i++) {
      expect(result.recentHistory[i - 1].scheduledFor >= result.recentHistory[i].scheduledFor).toBe(true);
    }
  });

  it("hasMoreHistory is false when resolved count is within the cap", () => {
    const result = presentMedicationDetail(
      [admin("a", "2026-09-01T08:00", "taken", "2026-09-01T08:00"), admin("b", "2026-09-02T08:00", "missed")],
      today,
    );
    expect(result.hasMoreHistory).toBe(false);
  });

  it("treats a same-day pending dose as current, not backlog (only strictly-before-today counts as needing attention)", () => {
    const result = presentMedicationDetail(
      [admin("today-dose", "2026-09-09T20:00", "pending"), admin("also-today", "2026-09-09T08:00", "pending")],
      today,
    );
    // Earliest by time wins as currentDose; the other same-day one is pending
    // but NOT before today, so it must not land in needsAttention either.
    expect(result.currentDose?.id).toBe("also-today");
    expect(result.needsAttention).toHaveLength(0);
  });
});
