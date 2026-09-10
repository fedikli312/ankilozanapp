import { presentInjectionDetail, RECENT_HISTORY_LIMIT } from "../presentInjectionDetail";
import type { InjectionAdministrationLike } from "../presentInjectionDetail";

function admin(
  id: string,
  scheduledFor: string,
  status: InjectionAdministrationLike["status"],
  actualDate: string | null = null,
): InjectionAdministrationLike {
  return { id, scheduledFor, status, actualDate };
}

describe("presentInjectionDetail", () => {
  it("excludes the pending row from recentHistory — a future/current injection is never history", () => {
    const result = presentInjectionDetail([
      admin("pending", "2026-09-15", "pending"),
      admin("completed-1", "2026-08-25", "completed", "2026-08-25"),
      admin("missed-1", "2026-08-04", "missed", null),
    ]);
    expect(result.recentHistory.some((a) => a.id === "pending")).toBe(false);
    expect(result.recentHistory.map((a) => a.id)).toEqual(["completed-1", "missed-1"]);
  });

  it("orders recentHistory most-recent-first and caps it at RECENT_HISTORY_LIMIT", () => {
    const resolved = Array.from({ length: RECENT_HISTORY_LIMIT + 2 }, (_, i) =>
      admin(`inj-${i}`, `2026-0${i + 1}-01`, "completed", `2026-0${i + 1}-01`),
    );
    const result = presentInjectionDetail(resolved);

    expect(result.recentHistory).toHaveLength(RECENT_HISTORY_LIMIT);
    expect(result.hasMoreHistory).toBe(true);
    expect(result.totalResolvedCount).toBe(resolved.length);
    expect(result.recentHistory[0].id).toBe(`inj-${RECENT_HISTORY_LIMIT + 1}`);
  });

  it("hasMoreHistory is false when resolved count is within the cap", () => {
    const result = presentInjectionDetail([admin("a", "2026-08-01", "completed", "2026-08-01")]);
    expect(result.hasMoreHistory).toBe(false);
  });

  it("returns an empty recentHistory when only a pending row exists", () => {
    const result = presentInjectionDetail([admin("pending", "2026-09-20", "pending")]);
    expect(result.recentHistory).toHaveLength(0);
    expect(result.totalResolvedCount).toBe(0);
  });
});
