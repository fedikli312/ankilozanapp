/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * scheduledNotificationRepository.ts's exported signatures exactly; native
 * builds never load this file (Metro `.web.ts` platform resolution). Since
 * src/notifications/client.web.ts already no-ops every OS scheduling call
 * on web, this bookkeeping table stays empty in practice — kept for
 * interface parity only.
 */
import { webPreviewStore } from "./web/store";

export type SourceType = "medication" | "injection" | "appointment" | "lab_reminder";

export type CreateScheduledNotificationInput = {
  id: string;
  sourceType: SourceType;
  sourceId: string;
  notificationIdentifier: string;
  scheduledFor: string;
  isRepeating?: boolean;
};

export function createScheduledNotification(_db: unknown, input: CreateScheduledNotificationInput): void {
  webPreviewStore.scheduledNotifications.push({
    id: input.id,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    notificationIdentifier: input.notificationIdentifier,
    scheduledFor: input.scheduledFor,
    isRepeating: input.isRepeating ?? false,
    createdAt: new Date().toISOString(),
  });
}

export function getScheduledNotificationsForSource(_db: unknown, sourceType: SourceType, sourceId: string) {
  return webPreviewStore.scheduledNotifications.filter(
    (n) => n.sourceType === sourceType && n.sourceId === sourceId,
  );
}

export function deleteScheduledNotification(_db: unknown, id: string): void {
  webPreviewStore.scheduledNotifications = webPreviewStore.scheduledNotifications.filter(
    (n) => n.id !== id,
  );
}

export function deleteScheduledNotificationsForSource(
  _db: unknown,
  sourceType: SourceType,
  sourceId: string,
): void {
  webPreviewStore.scheduledNotifications = webPreviewStore.scheduledNotifications.filter(
    (n) => !(n.sourceType === sourceType && n.sourceId === sourceId),
  );
}

export function getAllScheduledNotifications(_db: unknown) {
  return webPreviewStore.scheduledNotifications.slice();
}
