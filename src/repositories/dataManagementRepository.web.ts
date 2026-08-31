/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * dataManagementRepository.ts's exported signature exactly; native builds
 * never load this file (Metro `.web.ts` platform resolution). Unlike the
 * native version (a permanent local wipe), the web preview re-seeds after
 * clearing, since "Delete all local data" on a demo dataset should return
 * to a clean, still-inspectable preview rather than a permanently empty one.
 */
import { resetWebPreviewStore } from "./web/store";

export function deleteAllLocalData(_db: unknown): void {
  resetWebPreviewStore();
}
