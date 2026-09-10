export type MedicationAdministrationStatus = "pending" | "taken" | "missed" | "skipped";

export type MedicationAdministrationLike = {
  id: string;
  scheduledFor: string;
  status: MedicationAdministrationStatus;
  actualTime: string | null;
};

export type MedicationDetailPresentation<T extends MedicationAdministrationLike> = {
  /** The single earliest still-`pending` administration — the one actionable dose Medication Detail's "current/next dose" section shows. `null` when nothing is pending (schedule fully resolved, or archived). May be overdue (before `today`), due today, or genuinely upcoming — this derivation makes no distinction; the caller renders whatever date/time it actually is. */
  currentDose: T | null;
  /**
   * Additional `pending` administrations whose date falls strictly before
   * `today`, besides `currentDose` itself — real backlog (a user never
   * acted on an old reminder), capped at `NEEDS_ATTENTION_LIMIT` so this
   * stays a small subordinate list, never a wall of rows.
   */
  needsAttention: T[];
  /** Resolved (`taken`/`missed`/`skipped`) administrations, most-recent-first, capped at `RECENT_HISTORY_LIMIT`. Never includes `pending` rows — a future or unresolved dose is not history. */
  recentHistory: T[];
  /** True when more resolved administrations exist beyond `recentHistory` — drives whether "View full history" is shown. */
  hasMoreHistory: boolean;
  /** Total resolved administration count (taken + missed + skipped) — for the full-history screen's own use, not rendered here. */
  totalResolvedCount: number;
};

export const RECENT_HISTORY_LIMIT = 5;
export const NEEDS_ATTENTION_LIMIT = 5;

/** Every resolved (`taken`/`missed`/`skipped`) administration, most-recent-first — the unbounded list the full-history route pages through. Shared by `presentMedicationDetail` (which then caps it) so there's exactly one resolved/sort implementation. */
export function resolvedMedicationHistory<T extends MedicationAdministrationLike>(administrations: readonly T[]): T[] {
  return administrations
    .filter((a) => a.status !== "pending")
    .slice()
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));
}

/**
 * Pure presenter — Medication Detail's history architecture fix (Furkan-
 * requested restructuring). Takes the full, already-fetched administration
 * list for one medication (every status, every date, exactly what
 * `getAdministrationsForMedication` already returns — no new domain query)
 * and partitions it into the three things the screen actually needs:
 * one actionable current dose, a small backlog of anything older left
 * unresolved, and a capped recent-history preview. Never touches storage,
 * never computes a schedule — `min`/`max`/reused date-string comparisons
 * only, so this is trivially unit-testable without SQLite.
 */
export function presentMedicationDetail<T extends MedicationAdministrationLike>(
  administrations: readonly T[],
  today: string,
): MedicationDetailPresentation<T> {
  const pending = administrations
    .filter((a) => a.status === "pending")
    .slice()
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));

  const resolved = resolvedMedicationHistory(administrations);

  const currentDose = pending[0] ?? null;
  const backlog = pending.slice(1).filter((a) => a.scheduledFor.slice(0, 10) < today);

  return {
    currentDose,
    needsAttention: backlog.slice(0, NEEDS_ATTENTION_LIMIT),
    recentHistory: resolved.slice(0, RECENT_HISTORY_LIMIT),
    hasMoreHistory: resolved.length > RECENT_HISTORY_LIMIT,
    totalResolvedCount: resolved.length,
  };
}
