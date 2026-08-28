import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, StepperField, TextField, useTheme } from "../../design-system";
import { useTranslation } from "../../localization";
import { CHECK_IN_NOTE_MAX_LENGTH } from "../../domain/constants";
import type { BodyAreaRegion } from "../../repositories";
import type { SaveCheckInInput } from "./useCheckIn";

export type CheckInFormValue = {
  pain: number;
  fatigue: number;
  morningStiffnessBucket: "none" | "under_15" | "15_30" | "30_60" | "over_60";
  wellbeing?: number;
  bodyAreas: BodyAreaRegion[];
  notes: string;
};

export type CheckInFormProps = {
  initialValue?: CheckInFormValue;
  onSave: (input: SaveCheckInInput) => void;
  onChangeDraft?: (value: CheckInFormValue) => void;
};

const STIFFNESS_BUCKETS: CheckInFormValue["morningStiffnessBucket"][] = [
  "none",
  "under_15",
  "15_30",
  "30_60",
  "over_60",
];

const WELLBEING_LEVELS = [1, 2, 3, 4, 5];

const BODY_AREAS: BodyAreaRegion[] = [
  "neck",
  "upper_back",
  "lower_back",
  "hips",
  "shoulders",
  "chest_ribs",
  "other",
];

const DEFAULT_VALUE: CheckInFormValue = {
  pain: 0,
  fatigue: 0,
  morningStiffnessBucket: "none",
  bodyAreas: [],
  notes: "",
};

/** UX spec §E: default fields always visible, optional fields behind a single "+ Add more" disclosure. Target 15–30 seconds. */
export function CheckInForm({ initialValue, onSave, onChangeDraft }: CheckInFormProps) {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const [value, setValue] = useState<CheckInFormValue>(initialValue ?? DEFAULT_VALUE);
  const [showMore, setShowMore] = useState(
    initialValue?.wellbeing !== undefined ||
      (initialValue?.bodyAreas.length ?? 0) > 0 ||
      (initialValue?.notes.length ?? 0) > 0,
  );

  useEffect(() => {
    onChangeDraft?.(value);
    // Only fires on actual field edits — not meant to run on every render of the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const toggleBodyArea = (area: BodyAreaRegion) => {
    setValue((prev) => ({
      ...prev,
      bodyAreas: prev.bodyAreas.includes(area)
        ? prev.bodyAreas.filter((a) => a !== area)
        : [...prev.bodyAreas, area],
    }));
  };

  return (
    <View>
      <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <StepperField
          label={t("checkIn.painLabel", { value: value.pain })}
          value={value.pain}
          min={0}
          max={10}
          onChange={(pain) => setValue((prev) => ({ ...prev, pain }))}
        />
      </View>

      <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
        {t("checkIn.stiffnessLabel")}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.lg }}>
        {STIFFNESS_BUCKETS.map((bucket) => (
          <Chip
            key={bucket}
            label={t(`checkIn.stiffness.${bucket}`)}
            selected={value.morningStiffnessBucket === bucket}
            onPress={() => setValue((prev) => ({ ...prev, morningStiffnessBucket: bucket }))}
          />
        ))}
      </View>

      <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <StepperField
          label={t("checkIn.fatigueLabel", { value: value.fatigue })}
          value={value.fatigue}
          min={0}
          max={10}
          onChange={(fatigue) => setValue((prev) => ({ ...prev, fatigue }))}
        />
      </View>

      {!showMore ? (
        <Button label={t("checkIn.addMore")} onPress={() => setShowMore(true)} variant="secondary" />
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
            {t("checkIn.wellbeingLabel")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md }}>
            {WELLBEING_LEVELS.map((level) => (
              <Chip
                key={level}
                label={t(`checkIn.wellbeing.${level}`)}
                selected={value.wellbeing === level}
                onPress={() => setValue((prev) => ({ ...prev, wellbeing: level }))}
              />
            ))}
          </View>

          <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary, marginBottom: spacing.xs }}>
            {t("checkIn.bodyAreaLabel")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md }}>
            {BODY_AREAS.map((area) => (
              <Chip
                key={area}
                label={t(`checkIn.bodyArea.${area}`)}
                selected={value.bodyAreas.includes(area)}
                onPress={() => toggleBodyArea(area)}
              />
            ))}
          </View>

          <TextField
            label={t("checkIn.noteLabel")}
            value={value.notes}
            onChangeText={(notes) => setValue((prev) => ({ ...prev, notes }))}
            multiline
            maxLength={CHECK_IN_NOTE_MAX_LENGTH}
            helperText={t("checkIn.noteCounter", { count: value.notes.length, max: CHECK_IN_NOTE_MAX_LENGTH })}
            accessibilityHint={t("checkIn.noteCounter", { count: value.notes.length, max: CHECK_IN_NOTE_MAX_LENGTH })}
          />
        </View>
      )}

      <Button
        label={t("checkIn.save")}
        onPress={() =>
          onSave({
            pain: value.pain,
            fatigue: value.fatigue,
            morningStiffnessBucket: value.morningStiffnessBucket,
            wellbeing: value.wellbeing,
            bodyAreas: value.bodyAreas,
            notes: value.notes.trim() ? value.notes.trim() : undefined,
          })
        }
      />
    </View>
  );
}
