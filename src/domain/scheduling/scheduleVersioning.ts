/**
 * Pure transformation for the "edit a schedule" operation (Tech Arch §F
 * invariant 2). The repository layer performs the actual two-step write
 * (UPDATE the old row's effectiveUntil, INSERT the new row); this function
 * only computes what those two writes should contain, so the rule is
 * testable without a database.
 */
export function applyScheduleVersioning(effectiveDate: string) {
  return {
    /** Apply to the currently-active schedule row. */
    supersedeCurrentVersion: { effectiveUntil: effectiveDate },
    /** Use as the base for the newly-inserted schedule row. */
    newVersionEffectiveFrom: effectiveDate,
  };
}
