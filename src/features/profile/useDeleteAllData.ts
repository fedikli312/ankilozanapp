import { useCallback, useState } from "react";

import { db } from "../../db";
import { cancelAllScheduledNotifications } from "../../notifications/client";
import { deleteAllLocalData } from "../../repositories";

/**
 * Profile → "Delete all local data" (UX spec §L). Cancels every OS-scheduled
 * notification first, then clears every table — there is no backend/account
 * in V1, so this is the complete deletion, not a partial "health data only"
 * wipe (see dataManagementRepository.ts).
 */
export function useDeleteAllData() {
  const [deleting, setDeleting] = useState(false);

  const deleteAll = useCallback(async () => {
    setDeleting(true);
    try {
      await cancelAllScheduledNotifications();
      deleteAllLocalData(db);
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteAll, deleting };
}
