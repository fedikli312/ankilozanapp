/**
 * Dev-web-preview-only — see src/repositories/web/store.ts. Not wired into
 * any UI (matches native, where this is also an unused dev utility); kept
 * only for interface parity. Native iOS/Android builds never load this file
 * (Metro `.web.ts` platform resolution).
 */
export async function resetLocalDatabaseDevOnly(): Promise<void> {
  if (!__DEV__) {
    throw new Error("resetLocalDatabaseDevOnly is not available outside development");
  }
}
