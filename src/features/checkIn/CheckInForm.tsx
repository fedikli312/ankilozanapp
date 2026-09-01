import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, TextField, useTheme } from "../../design-system";
import { useTranslation } from "../../localization";
import { CHECK_IN_NOTE_MAX_LENGTH } from "../../domain/constants";
import type { BodyAreaRegion } from "../../repositories";
import { getCheckInPresentation } from "../../personalization/getCheckInPresentation";
import { usePersonalizationProfile } from "../../personalization/usePersonalizationProfile";
import { BodyRegionMap } from "./BodyRegionMap";
import { FatigueSelector } from "./FatigueSelector";
import { PainScale } from "./PainScale";
import { StiffnessSelector } from "./StiffnessSelector";
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

const WELLBEING_LEVELS = [1, 2, 3, 4, 5];

const DEFAULT_VALUE: CheckInFormValue = {
  pain: 0,
  fatigue: 0,
  morningStiffnessBucket: "none",
  bodyAreas: [],
  notes: "",
};

/**
 * Phase O — Daily Check-in 2.0 (Product 2.0 spec). Same one-sheet
 * experience, same default/optional field split as before (UX spec §E:
 * default fields always visible, optional fields behind a single
 * "+ Add more" disclosure) — this is a visual/interaction upgrade of the
 * existing hierarchy, not a restructure of it. Pain/Stiffness/Fatigue keep
 * their exact stored semantics (0–10 int / 5-value enum / 0–10 int);
 * Wellbeing's existing Chip row is kept as-is (already exactly 5 states,
 * already visually lighter than the new controls — no bespoke component
 * needed for something that already works and is already appropriately
 * lightweight). Body Map is new (§ BodyRegionMap); Note is unchanged.
 */
export function CheckInForm({ initialValue, onSave, onChangeDraft }: CheckInFormProps) {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const profile = usePersonalizationProfile();
  const personalization = getCheckInPresentation(profile);
  const [value, setValue] = useState<CheckInFormValue>(initialValue ?? DEFAULT_VALUE);
  // Auto-expands when editing an existing entry that already used the
  // secondary section (unchanged behavior), OR when personalization says
  // Wellbeing/Body Map matter enough to this user to skip the extra tap
  // (Phase R brief §12/§13) — never auto-fills a value, only visibility.
  const [showMore, setShowMore] = useState(
    initialValue?.wellbeing !== undefined ||
      (initialValue?.bodyAreas.length ?? 0) > 0 ||
      (initialValue?.notes.length ?? 0) > 0 ||
      personalization.autoExpandMore,
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
      <View style={{ marginBottom: spacing.lg }}>
        <PainScale
          value={value.pain}
          onChange={(pain) => setValue((prev) => ({ ...prev, pain }))}
          priorityIndicator={personalization.emphasizedCoreSymptoms.includes("pain")}
        />
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        <StiffnessSelector
          value={value.morningStiffnessBucket}
          onChange={(morningStiffnessBucket) => setValue((prev) => ({ ...prev, morningStiffnessBucket }))}
          priorityIndicator={personalization.emphasizedCoreSymptoms.includes("stiffness")}
        />
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        <FatigueSelector
          value={value.fatigue}
          onChange={(fatigue) => setValue((prev) => ({ ...prev, fatigue }))}
          priorityIndicator={personalization.emphasizedCoreSymptoms.includes("fatigue")}
        />
      </View>

      {!showMore ? (
        <Button label={t("checkIn.addMore")} onPress={() => setShowMore(true)} variant="secondary" />
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginBottom: spacing.xs }}>
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("checkIn.wellbeingLabel")}</Text>
            {personalization.wellbeingEmphasized ? (
              <Text style={{ fontSize: typography.micro.fontSize, color: colors.accent }}>· {t("checkIn.priorityIndicator")}</Text>
            ) : null}
          </View>
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

          <View style={{ marginBottom: spacing.md }}>
            <BodyRegionMap value={value.bodyAreas} onToggle={toggleBodyArea} priorityAreas={personalization.priorityBodyAreas} />
          </View>

          <TextField
            label={t("checkIn.noteLabel")}
            placeholder={t("checkIn.notePrompt")}
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
