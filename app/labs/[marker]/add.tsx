import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, ScreenContainer, useTheme } from "@/design-system";
import { useTranslation } from "@/localization";
import { LabResultForm } from "@/features/labs/LabResultForm";
import { useLabResults, type LabMarker } from "@/features/labs/useLabResults";

export default function AddOrEditLabResultScreen() {
  const { marker, id } = useLocalSearchParams<{ marker: LabMarker; id?: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { results, addResult, editResult, removeResult } = useLabResults(marker);

  const existing = id ? results.find((r) => r.id === id) : undefined;

  return (
    <ScreenContainer scroll>
      <Text style={{ fontSize: 20, fontWeight: "600", color: colors.textPrimary, marginBottom: 16 }}>
        {existing ? t("labs.form.editTitle") : t("labs.addAction")}
      </Text>
      <LabResultForm
        marker={marker}
        initialValue={
          existing
            ? {
                value: existing.value,
                unit: existing.unit,
                recordedDate: existing.recordedDate,
                institution: existing.institution ?? undefined,
                notes: existing.notes ?? undefined,
              }
            : undefined
        }
        submitLabel={existing ? t("common.save") : t("labs.form.save")}
        onSubmit={(input) => {
          if (existing) {
            editResult(existing.id, input);
          } else {
            addResult(input);
          }
          router.back();
        }}
      />
      {existing ? (
        <View style={{ marginTop: 16 }}>
          <Button
            label={t("labs.form.delete")}
            variant="destructive"
            onPress={() => {
              removeResult(existing.id);
              router.back();
            }}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
