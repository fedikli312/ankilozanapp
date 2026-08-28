import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import { db } from "../../db";
import {
  createLabResult,
  deleteLabResult,
  getLabResultsByMarker,
  updateLabResult,
  type UpdateLabResultInput,
} from "../../repositories";
import { generateId } from "../../shared/id";

export type LabMarker = "CRP" | "ESR";

export type CreateLabResultFormInput = {
  value: number;
  unit: string;
  recordedDate: string;
  institution?: string;
  notes?: string;
};

/** Pre-filled with the marker's standard unit (UX spec §I) — reduces entry error. */
export const LAB_MARKER_DEFAULT_UNIT: Record<LabMarker, string> = {
  CRP: "mg/L",
  ESR: "mm/hr",
};

export function useLabResults(marker: LabMarker) {
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const results = getLabResultsByMarker(db, marker);
  const latest = results[0] ?? null;

  const addResult = useCallback(
    (input: CreateLabResultFormInput) => {
      createLabResult(db, { id: generateId(), marker, ...input });
      refresh();
    },
    [marker, refresh],
  );

  const editResult = useCallback(
    (id: string, patch: UpdateLabResultInput) => {
      updateLabResult(db, id, patch);
      refresh();
    },
    [refresh],
  );

  const removeResult = useCallback(
    (id: string) => {
      deleteLabResult(db, id);
      refresh();
    },
    [refresh],
  );

  return { results, latest, addResult, editResult, removeResult };
}
