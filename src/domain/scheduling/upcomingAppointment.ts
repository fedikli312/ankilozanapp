import { UPCOMING_APPOINTMENT_WINDOW_DAYS } from "../constants";
import { diffInDays } from "../dateUtils";

/**
 * Today's "upcoming appointment" surfacing rule (Tech Arch §D) — a fixed
 * window, read from the named constant, never re-typed per screen.
 */
export function isAppointmentUpcoming(
  appointmentDate: string,
  today: string,
  windowDays: number = UPCOMING_APPOINTMENT_WINDOW_DAYS,
): boolean {
  const daysUntil = diffInDays(today, appointmentDate);
  return daysUntil >= 0 && daysUntil <= windowDays;
}
