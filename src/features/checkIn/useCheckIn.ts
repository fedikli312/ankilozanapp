import { useCallback, useState } from "react";

import { db } from "../../db";
import { getBodyAreasForCheckIn, getCheckInByDate, upsertCheckIn, type UpsertCheckInInput } from "../../repositories";
import { generateId } from "../../shared/id";
import { todayDateOnly } from "../../shared/today";
import { clearCheckInDraft, getCheckInDraft, type CheckInDraft } from "./checkInDraft";
import type { CheckInFormValue } from "./CheckInForm";

export type SaveCheckInInput = Omit<UpsertCheckInInput, "id" | "date">;

export function useCheckIn() {
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
        }
      : undefined;

  /** One per calendar day, editable same-day via upsert (Tech Arch §H — protected behavior). */
  const save = useCallback(
    (input: SaveCheckInInput) => {
      upsertCheckIn(db, { id: generateId(), date: today, ...input });
      clearCheckInDraft();
      refresh();
    },
    [today, refresh],
  );

  return { today, todaysCheckIn, initialValue, save };
}
