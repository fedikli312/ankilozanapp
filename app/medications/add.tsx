import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { MedicationForm } from "@/features/medications/MedicationForm";
import { useMedications } from "@/features/medications/useMedications";
import type { CreateMedicationFormInput } from "@/features/medications/useMedications";

export default function AddMedicationScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { addMedication } = useMedications();
  const [submitting, setSubmitting] = useState(false);
  const [remindersOff, setRemindersOff] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSubmit = async (input: CreateMedicationFormInput) => {
    setSubmitting(true);
    setSaveError(false);
    try {
      const outcome = await addMedication(input);
      if (outcome === "permission-denied") {
        setRemindersOff(true);
        setSubmitting(false);
        return;
      }
      router.back();
    } catch {
      // Entered values stay in MedicationForm's own state — nothing is lost.
      setSaveError(true);
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: 20, fontWeight: "600", color: colors.textPrimary, marginBottom: 16 }}>
        {t("medications.addAction")}
      </Text>
      {remindersOff ? (
        <Text style={{ color: colors.statusWarning, marginBottom: 12 }}>{t("notifications.remindersOff")}</Text>
      ) : null}
      {saveError ? (
        <Text style={{ color: colors.statusDanger, marginBottom: 12 }}>{t("common.saveError")}</Text>
      ) : null}
      <MedicationForm onSubmit={handleSubmit} submitting={submitting} />
    </ScreenContainer>
  );
}
