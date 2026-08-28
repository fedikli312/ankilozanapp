import { useCallback, useState } from "react";

import { db } from "../../db";
import { getUserPreferences, updateUserPreferences } from "../../repositories";
import type { SupportedLocale } from "../../localization";

export function useProfile() {
  const [, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((count) => count + 1), []);

  const preferences = getUserPreferences(db);

  const setLanguageOverride = useCallback(
    (languageOverride: SupportedLocale | null) => {
      updateUserPreferences(db, { languageOverride });
      refresh();
    },
    [refresh],
  );

  const setNotificationDetailOptIn = useCallback(
    (notificationDetailOptIn: boolean) => {
      updateUserPreferences(db, { notificationDetailOptIn });
      refresh();
    },
    [refresh],
  );

  return {
    languageOverride: preferences?.languageOverride ?? null,
    notificationDetailOptIn: preferences?.notificationDetailOptIn ?? false,
    setLanguageOverride,
    setNotificationDetailOptIn,
  };
}
