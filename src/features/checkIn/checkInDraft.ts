import type { BodyAreaRegion } from "../../repositories";

/**
 * Transient, in-memory draft for the check-in sheet (UX spec §E: "If the
 * user dismisses the sheet before saving, partial entries are preserved
 * locally and restored if they reopen the check-in the same day"). Scoped
 * to the current app session only — the app has no local key-value
 * persistence dependency yet (no AsyncStorage in package.json), and adding
 * one solely for this narrow, same-session case would be a new dependency
 * for a V1-minimal feature; a full app kill+relaunch starts a fresh draft.
 * Flagged as a deviation, not a silent gap — revisit if this proves
 * insufficient. Same transient-module pattern as onboardingDraft.ts.
 */
export type CheckInDraft = {
  date: string;
  pain: number;
  fatigue: number;
  morningStiffnessBucket: "none" | "under_15" | "15_30" | "30_60" | "over_60";
  wellbeing?: number;
  bodyAreas: BodyAreaRegion[];
  notes: string;
};

let draft: CheckInDraft | null = null;

export function getCheckInDraft(forDate: string): CheckInDraft | null {
  return draft && draft.date === forDate ? draft : null;
}

export function setCheckInDraft(next: CheckInDraft): void {
  draft = next;
}

export function clearCheckInDraft(): void {
  draft = null;
}
