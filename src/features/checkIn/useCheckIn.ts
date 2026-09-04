import { useCallback, useState } from "react";

import { db } from "../../db";
import { getBodyAreasForCheckIn, getCheckInByDate, upsertCheckIn, type UpsertCheckInInput } from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";
import { clearCheckInDraft, getCheckInDraft, type CheckInDraft } from "./checkInDraft";
import { resolveDefaultHighSymptomDay } from "./resolveDefaultHighSymptomDay";
import type { CheckInFormValue } from "./CheckInForm";

export type SaveCheckInInput = Omit<UpsertCheckInInput, "id" | "date">;

export type UseCheckInOptions = {
  /**
   * Product 2.1 Phase Y — true when the user arrived via Today's explicit
   * "Symptoms more intense today?" entry point (brief §2). Only ever
   * changes the toggle's *starting position* on a genuinely fresh entry
   * (see `defaultHighSymptomDay` below) — a saved or drafted value always
   * takes precedence, so it can never silently override real data.
   */
  highSymptomDayEntry?: boolean;
};

export function useCheckIn({ highSymptomDayEntry = false }: UseCheckInOptions = {}) {
  const today = todayDateOnly();
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const todaysCheckIn = getCheckInByDate(db, today);
  const bodyAreas = todaysCheckIn ? getBodyAreasForCheckIn(db, todaysCheckIn.id) : [];
  const draft: CheckInDraft | null = getCheckInDraft(today);

  const initialValue: CheckInFormValue | undefined = draft
    ? draft
    : todaysCheckIn
      ? {
          pain: todaysCheckIn.pain,
          fatigue: todaysCheckIn.fatigue,
          morningStiffnessBucket: todaysCheckIn.morningStiffnessBucket,
          wellbeing: todaysCheckIn.wellbeing ?? undefined,
          bodyAreas,
          notes: todaysCheckIn.notes ?? "",
          isHighSymptomDay: todaysCheckIn.isHighSymptomDay,
        }
      : undefined;

  // Only used by CheckInForm when `initialValue` is undefined (brief §5's
  // preserve-saved-value rule always wins over this) — a fresh entry via
  // the High-Symptom Day path starts the toggle on, still fully visible
  // and changeable before save (brief §2/§4).
  const defaultHighSymptomDay = resolveDefaultHighSymptomDay(highSymptomDayEntry, draft !== null, !!todaysCheckIn);

  /** One per calendar day, editable same-day via upsert (Tech Arch §H — protected behavior). */
  const save = useCallback(
    (input: SaveCheckInInput) => {
      upsertCheckIn(db, { id: generateId(), date: today, ...input });
      clearCheckInDraft();
      refresh();
    },
    [today, refresh],
  );

  return { today, todaysCheckIn, initialValue, defaultHighSymptomDay, save };
}
