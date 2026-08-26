import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import { db } from "./client";
import migrations from "./migrations/migrations";

/**
 * Runs pending migrations before any screen reads the database (Tech Arch
 * §Q: "migrations run transactionally on launch, before any UI reads the
 * database"). This is the one place app-shell code touches the database
 * layer directly — feature code never does; it only ever goes through
 * src/repositories.
 */
export function DatabaseProvider({ children }: PropsWithChildren) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text>Couldn&apos;t prepare your data. Please restart the app.</Text>
      </View>
    );
  }

  if (!success) {
    return <View style={{ flex: 1 }} />;
  }

  return children;
}
