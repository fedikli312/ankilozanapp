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
