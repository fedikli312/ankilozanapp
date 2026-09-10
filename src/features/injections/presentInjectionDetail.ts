export type InjectionAdministrationStatus = "pending" | "completed" | "missed";

export type InjectionAdministrationLike = {
  id: string;
  scheduledFor: string;
  status: InjectionAdministrationStatus;
  actualDate: string | null;
};

export type InjectionDetailPresentation<T extends InjectionAdministrationLike> = {
  /** Resolved (`completed`/`missed`) administrations, most-recent-first, capped at `RECENT_HISTORY_LIMIT`. The single `pending` row (the next/current injection, already surfaced separately via `nextInjectionDate`) never appears here — a future dose is not history. */
  recentHistory: T[];
  hasMoreHistory: boolean;
  totalResolvedCount: number;
};

export const RECENT_HISTORY_LIMIT = 5;

/** Every resolved (`completed`/`missed`) administration, most-recent-first — the unbounded list the full-history route pages through. Shared with `presentInjectionDetail` (which then caps it) so there's exactly one resolved/sort implementation. */
export function resolvedInjectionHistory<T extends InjectionAdministrationLike>(administrations: readonly T[]): T[] {
  return administrations
    .filter((a) => a.status !== "pending")
    .slice()
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));
}

/**
 * Pure presenter — same fix as Medication Detail's `presentMedicationDetail`,
 * adapted to injection semantics: unlike medications, the injection domain
 * only ever materializes one `pending` row at a time (`useInjectionDetail`'s
 * own `pending` lookup), so there is no "needs attention" backlog concept
 * here — completing or missing the current injection immediately creates
 * the next single pending row. This presenter's only job is keeping the
 * resolved-history preview capped and excluding the pending row from it.
 */
export function presentInjectionDetail<T extends InjectionAdministrationLike>(
  administrations: readonly T[],
): InjectionDetailPresentation<T> {
  const resolved = resolvedInjectionHistory(administrations);

  return {
    recentHistory: resolved.slice(0, RECENT_HISTORY_LIMIT),
    hasMoreHistory: resolved.length > RECENT_HISTORY_LIMIT,
    totalResolvedCount: resolved.length,
  };
}
