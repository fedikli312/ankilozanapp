import { addDays } from "../dateUtils";

export type LastInjectionAdministration = {
  scheduledFor: string;
  actualDate: string | null;
  status: "pending" | "completed" | "missed";
};

/**
 * Derived, never stored as a separately-editable field (Tech Arch §F
 * invariant 5). Uses the actual logged date when available so an
 * early/late injection re-anchors the schedule rather than silently
 * drifting from reality.
 */
export function calculateNextInjectionDate(
  lastAdministration: LastInjectionAdministration,
  intervalDays: number,
): string {
  const anchor = lastAdministration.actualDate ?? lastAdministration.scheduledFor;
  return addDays(anchor, intervalDays);
}
