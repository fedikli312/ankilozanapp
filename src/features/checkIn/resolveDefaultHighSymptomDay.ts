/**
 * Product 2.1 Phase Y — pure precedence rule for the High-Symptom Day
 * toggle's *starting position* when the check-in form first opens.
 *
 * A saved or drafted value always wins (`hasDraft`/`hasTodaysCheckIn`):
 * the explicit High-Symptom Day entry point only sets the toggle's
 * starting position on a genuinely fresh entry, never silently overriding
 * real data (brief §2/§4/§5). The user can still see and change the
 * result before saving — this only decides what they see first.
 */
export function resolveDefaultHighSymptomDay(
  highSymptomDayEntry: boolean,
  hasDraft: boolean,
  hasTodaysCheckIn: boolean,
): boolean {
  return highSymptomDayEntry && !hasDraft && !hasTodaysCheckIn;
}
