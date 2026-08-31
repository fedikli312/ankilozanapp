/**
 * Dev-web-preview-only mock — see src/repositories/web/store.ts. Mirrors
 * appointmentRepository.ts's exported signatures exactly; native builds
 * never load this file (Metro `.web.ts` platform resolution).
 */
import { isAppointmentUpcoming } from "../domain/scheduling";
import { webPreviewStore } from "./web/store";

export type CreateAppointmentInput = {
  id: string;
  type: "rheumatology" | "laboratory" | "imaging" | "other";
  doctorOrInstitution?: string;
  date: string;
  time?: string;
  notes?: string;
  reminderLeadDays?: number;
};

export function createAppointment(_db: unknown, input: CreateAppointmentInput): void {
  const now = new Date().toISOString();
  webPreviewStore.appointments.push({
    id: input.id,
    type: input.type,
    doctorOrInstitution: input.doctorOrInstitution ?? null,
    date: input.date,
    time: input.time ?? null,
    notes: input.notes ?? null,
    reminderLeadDays: input.reminderLeadDays ?? 1,
    status: "scheduled",
    createdAt: now,
    updatedAt: now,
  });
}

export function updateAppointment(
  _db: unknown,
  id: string,
  patch: Partial<Omit<CreateAppointmentInput, "id">> & {
    status?: "scheduled" | "completed" | "cancelled";
  },
): void {
  const row = webPreviewStore.appointments.find((a) => a.id === id);
  if (!row) return;
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.doctorOrInstitution !== undefined) row.doctorOrInstitution = patch.doctorOrInstitution ?? null;
  if (patch.date !== undefined) row.date = patch.date;
  if (patch.time !== undefined) row.time = patch.time ?? null;
  if (patch.notes !== undefined) row.notes = patch.notes ?? null;
  if (patch.reminderLeadDays !== undefined) row.reminderLeadDays = patch.reminderLeadDays;
  if (patch.status !== undefined) row.status = patch.status;
  row.updatedAt = new Date().toISOString();
}

export function getAppointmentById(_db: unknown, id: string) {
  return webPreviewStore.appointments.find((a) => a.id === id);
}

export function getAllAppointments(_db: unknown) {
  return webPreviewStore.appointments.slice();
}

export function getUpcomingAppointments(_db: unknown, today: string) {
  return getAllAppointments(_db).filter(
    (a) => a.status === "scheduled" && isAppointmentUpcoming(a.date, today),
  );
}

export function getAllUpcomingAppointments(_db: unknown, today: string) {
  return getAllAppointments(_db)
    .filter((a) => a.status === "scheduled" && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getPastAppointments(_db: unknown, today: string) {
  return getAllAppointments(_db)
    .filter((a) => a.date < today || a.status !== "scheduled")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function cancelAppointment(_db: unknown, id: string): void {
  updateAppointment(_db, id, { status: "cancelled" });
}
