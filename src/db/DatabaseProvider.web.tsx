import type { PropsWithChildren } from "react";

/**
 * Dev-web-preview-only — see src/repositories/web/store.ts. The native
 * DatabaseProvider gates rendering on real expo-sqlite migrations; the web
 * preview's data is an already-seeded in-memory store with no migration
 * concept, so there is nothing to wait on. Native iOS/Android builds never
 * load this file (Metro `.web.ts` platform resolution).
 */
export function DatabaseProvider({ children }: PropsWithChildren) {
  return children;
}
