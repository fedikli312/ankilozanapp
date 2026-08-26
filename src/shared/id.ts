/**
 * A practically-unique local ID — not cryptographically secure, and
 * deliberately not dependent on `crypto.randomUUID()` (unreliable across
 * Hermes/RN versions without an extra native polyfill dependency). V1 is
 * local-only with no cross-device sync, so global uniqueness guarantees
 * beyond "unique within this device's database" aren't required yet; a
 * future sync layer can introduce a stronger ID scheme without this
 * function's callers changing (Tech Arch §T).
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
