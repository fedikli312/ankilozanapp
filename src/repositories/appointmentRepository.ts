import { eq } from "drizzle-orm";

import { appointment } from "../db/schema";
import { isAppointmentUpcoming } from "../domain/scheduling";
import type { AppDatabase } from "./types";

export type CreateAppointmentInput = {
  id: string;
  type: "rheumatology" | "laboratory" | "imaging" | "other";
  doctorOrInstitution?: string;
  date: string;
  time?: string;
  notes?: string;
  reminderLeadDays?: number;
};

export function createAppointment(db: AppDatabase, input: CreateAppointmentInput): void {
  db.insert(appointment).values(input).run();
}

export function updateAppointment(
  db: AppDatabase,
  id: string,
  patch: Partial<Omit<CreateAppointmentInput, "id">> & {
    status?: "scheduled" | "completed" | "cancelled";
  },
): void {
  db.update(appointment)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(appointment.id, id))
    .run();
}

export function getAppointmentById(db: AppDatabase, id: string) {
  return db.select().from(appointment).where(eq(appointment.id, id)).get();
}

export function getAllAppointments(db: AppDatabase) {
  return db.select().from(appointment).all();
}

/** Uses the approved 14-day window (Tech Arch §D) via the domain function. */
export function getUpcomingAppointments(db: AppDatabase, today: string) {
  return getAllAppointments(db).filter(
    (a) => a.status === "scheduled" && isAppointmentUpcoming(a.date, today),
  );
}

/** Every future scheduled appointment, not just the 14-day Today window — the Appointments tab's full "Upcoming" list. */
export function getAllUpcomingAppointments(db: AppDatabase, today: string) {
  return getAllAppointments(db)
    .filter((a) => a.status === "scheduled" && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Past (UX spec §H): date has passed, or the appointment was explicitly
 * completed/cancelled — always kept, never deleted, so it remains a
 * historical record.
 */
export function getPastAppointments(db: AppDatabase, today: string) {
  return getAllAppointments(db)
    .filter((a) => a.date < today || a.status !== "scheduled")
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Cancel, never a hard delete (UX spec §H/§L historical-record principle — same rule as medication/injection history). */
export function cancelAppointment(db: AppDatabase, id: string): void {
  updateAppointment(db, id, { status: "cancelled" });
}
