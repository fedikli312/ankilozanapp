import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { InjectionForm } from "@/features/injections/InjectionForm";
import { useInjections } from "@/features/injections/useInjections";
import type { CreateInjectionFormInput } from "@/features/injections/useInjections";

export default function AddInjectionScreen() {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const router = useRouter();
  const { addInjection } = useInjections();
  const [submitting, setSubmitting] = useState(false);
  const [remindersOff, setRemindersOff] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSubmit = async (input: CreateInjectionFormInput) => {
    setSubmitting(true);
    setSaveError(false);
    try {
      const outcome = await addInjection(input);
      if (outcome === "permission-denied") {
        setRemindersOff(true);
        setSubmitting(false);
        return;
      }
      router.back();
    } catch {
      setSaveError(true);
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: typography.headline.fontSize, fontWeight: typography.headline.fontWeight, color: colors.textPrimary, marginBottom: spacing.md }}>
        {t("injections.addAction")}
      </Text>
      {remindersOff ? (
        <Text style={{ color: colors.statusWarning, marginBottom: spacing.sm }}>{t("notifications.remindersOff")}</Text>
      ) : null}
      {saveError ? <Text style={{ color: colors.statusDanger, marginBottom: spacing.sm }}>{t("common.saveError")}</Text> : null}
      <InjectionForm onSubmit={handleSubmit} submitting={submitting} />
    </ScreenContainer>
  );
}
