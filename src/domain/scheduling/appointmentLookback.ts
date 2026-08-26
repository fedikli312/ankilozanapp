import { APPOINTMENT_PREPARATION_FALLBACK_LOOKBACK_DAYS } from "../constants";
import { addDays, isBefore } from "../dateUtils";

export type AppointmentForLookback = {
  type: "rheumatology" | "laboratory" | "imaging" | "other";
  date: string;
};

export type AppointmentPreparationRange = {
  rangeStart: string;
  rangeEnd: string;
};

/**
 * Resolves the Appointment Preparation lookback range (Tech Arch §J):
 * the most recent prior rheumatology appointment if one exists, otherwise
 * a fixed fallback window. Computed at read time — never a stored/FK'd
 * "previous appointment" reference, so out-of-order appointment entry
 * stays correct.
 */
export function resolveAppointmentPreparationLookback(
  appointments: readonly AppointmentForLookback[],
  targetAppointmentDate: string,
): AppointmentPreparationRange {
  const priorRheumatologyAppointments = appointments
    .filter((a) => a.type === "rheumatology" && isBefore(a.date, targetAppointmentDate))
    .sort((a, b) => (isBefore(a.date, b.date) ? 1 : -1));

  const previous = priorRheumatologyAppointments[0];

  return {
    rangeStart: previous
      ? previous.date
      : addDays(targetAppointmentDate, -APPOINTMENT_PREPARATION_FALLBACK_LOOKBACK_DAYS),
    rangeEnd: targetAppointmentDate,
  };
}
