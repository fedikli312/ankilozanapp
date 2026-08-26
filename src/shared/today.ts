/**
 * The device's current local calendar date (`YYYY-MM-DD`) — deliberately
 * using local, not UTC, getters, since a date-only value represents a
 * wall-clock calendar day (Tech Arch §H). Kept out of src/domain so domain
 * functions stay pure/deterministic; this is an app-layer "what is today,
 * right now" primitive, not domain logic.
 */
export function todayDateOnly(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
