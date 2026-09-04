import type { TimelineEvent } from "../../domain/timeline";

export type Translate = (key: string, options?: Record<string, unknown>) => string;

export type TimelineEventPresentation = {
  label: string;
  /** Omitted (not an empty string) when there is nothing to show — screens should treat this the same way `ListRow`'s own optional `caption` prop already does. */
  caption?: string;
  accessibilityLabel: string;
  /** Where tapping this row navigates, or `null` when it should stay read-only (Phase X brief §13: "if navigation semantics are ambiguous, keep the Timeline event read-only"). Only an appointment (always, its detail route already exists) and today's own check-in/high-symptom-day (the only date `/check-in` can actually edit — every other screen in this app applies the same rule, e.g. `useSymptomsHistory`'s own history list) are ever navigable. Medication, injection, and lab events have no per-record detail route to link to yet, so they stay informational. Typed as exactly the two route shapes this function ever returns, not a bare `string`, so `router.push` stays fully typed at the call site. */
  route: "/check-in" | `/appointments/${string}` | null;
};

/**
 * Phase X — turns one Phase W `TimelineEvent` into exactly the two lines a
 * `ListRow` shows, reusing existing translation keys wherever one already
 * fits (`symptoms.rowLabel`, `checkIn.stiffnessCompact.*`,
 * `checkIn.bodyArea.*`, `medications.status.*`, `injections.status.*`,
 * `appointments.type.*`/`status.*`, `labs.marker.*`) rather than
 * duplicating that vocabulary. Free-text notes are never read here — the
 * underlying `CheckInTimelineEvent` type doesn't even carry one (Phase W),
 * so there is structurally nothing to accidentally surface (brief §8).
 * Pure: takes `t` and `today` as parameters rather than importing
 * `useTranslation`/`todayDateOnly` itself, so it's testable without a
 * component or a database.
 */
export function presentTimelineEvent(event: TimelineEvent, t: Translate, today: string): TimelineEventPresentation {
  const { label, caption, route } = buildContent(event, t, today);
  return {
    label,
    caption,
    accessibilityLabel: caption ? `${label}. ${caption}` : label,
    route,
  };
}

function buildContent(
  event: TimelineEvent,
  t: Translate,
  today: string,
): { label: string; caption?: string; route: "/check-in" | `/appointments/${string}` | null } {
  switch (event.type) {
    case "check_in":
    case "high_symptom_day": {
      const stiffness = t(`checkIn.stiffnessCompact.${event.morningStiffnessBucket}`);
      const bodyAreas = event.bodyAreas.map((region) => t(`checkIn.bodyArea.${region}`)).join(", ");
      const route = event.date === today ? "/check-in" : null;

      if (event.type === "high_symptom_day") {
        return {
          label: t("timeline.highSymptomDay"),
          caption: [t("timeline.painOutOfTen", { pain: event.pain }), stiffness, bodyAreas]
            .filter(Boolean)
            .join(" · "),
          route,
        };
      }
      return {
        label: t("symptoms.rowLabel", { pain: event.pain, fatigue: event.fatigue }),
        caption: [stiffness, bodyAreas].filter(Boolean).join(" · "),
        route,
      };
    }

    case "medication":
      return {
        label: event.medicationName,
        caption: t(`medications.status.${event.status}`),
        route: null,
      };

    case "injection":
      return {
        label: event.treatmentName,
        caption: t(`injections.status.${event.status}`),
        route: null,
      };

    case "lab":
      return {
        label: t(`labs.marker.${event.marker}`),
        caption: `${event.value} ${event.unit}`,
        route: null,
      };

    case "appointment": {
      const typeLabel = t(`appointments.type.${event.appointmentType}`);
      const label = event.doctorOrInstitution || typeLabel;
      const caption =
        event.status === "scheduled" ? typeLabel : `${typeLabel} · ${t(`appointments.status.${event.status}`)}`;
      return { label, caption, route: `/appointments/${event.sourceId}` };
    }
  }
}
