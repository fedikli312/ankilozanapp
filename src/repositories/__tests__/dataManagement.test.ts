import { createTestDatabase } from "../../db/testUtils/testDatabase";
import {
  appointment,
  dailyCheckIn,
  injectionTreatment,
  labResult,
  medication,
  onboardingState,
  userPreferences,
} from "../../db/schema";
import { deleteAllLocalData } from "../dataManagementRepository";

describe("dataManagementRepository", () => {
  it("clears every table, including onboarding state and preferences, to return the app to first-launch state", () => {
    const { db } = createTestDatabase();

    db.insert(medication).values({ id: "med-1", name: "Adalimumab", dose: "40mg" }).run();
    db.insert(injectionTreatment).values({ id: "inj-1", name: "Etanercept", dose: "50mg" }).run();
    db.insert(appointment).values({ id: "appt-1", type: "rheumatology", date: "2026-09-05" }).run();
    db.insert(labResult).values({ id: "lab-1", marker: "CRP", value: 6, unit: "mg/L", recordedDate: "2026-08-01" }).run();
    db.insert(dailyCheckIn).values({ id: "ci-1", date: "2026-08-26", pain: 4, fatigue: 3, morningStiffnessBucket: "under_15" }).run();
    db.insert(onboardingState).values({ id: "default", completed: true }).run();
    db.insert(userPreferences).values({ id: "default", languageOverride: "tr" }).run();

    deleteAllLocalData(db);

    expect(db.select().from(medication).all()).toHaveLength(0);
    expect(db.select().from(injectionTreatment).all()).toHaveLength(0);
    expect(db.select().from(appointment).all()).toHaveLength(0);
    expect(db.select().from(labResult).all()).toHaveLength(0);
    expect(db.select().from(dailyCheckIn).all()).toHaveLength(0);
    expect(db.select().from(onboardingState).all()).toHaveLength(0);
    expect(db.select().from(userPreferences).all()).toHaveLength(0);
  });
});
