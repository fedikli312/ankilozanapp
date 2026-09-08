import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button, Chip, Section, TextField, ToggleRow, useTheme } from "../../design-system";
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
  /** Product 2.1 Phase Y — user-declared only, see `CheckInForm`'s own doc comment. */
  isHighSymptomDay: boolean;
};

export type CheckInFormProps = {
  initialValue?: CheckInFormValue;
  onSave: (input: SaveCheckInInput) => void;
  onChangeDraft?: (value: CheckInFormValue) => void;
  /**
   * Phase Y: true only when the user arrived via Today's explicit
   * "Symptoms more intense today?" entry point (brief §2) — used solely to
   * seed the toggle's starting position on a *fresh* entry (no draft, no
   * existing today's check-in already covers this via `initialValue`,
   * which always wins). The user can still review and change it before
   * saving; nothing is forced silently.
   */
  defaultHighSymptomDay?: boolean;
};

const WELLBEING_LEVELS = [1, 2, 3, 4, 5];

const DEFAULT_VALUE: CheckInFormValue = {
  pain: 0,
  fatigue: 0,
  morningStiffnessBucket: "none",
  bodyAreas: [],
  notes: "",
  isHighSymptomDay: false,
};

/**
 * Daily Check-in — one continuous interaction (Design System 2.0, Phase
 * Design-D §9/§10). Pain, Morning stiffness, Fatigue, and High-Symptom Day
 * are composed as one hairline-separated flow (`Section`, no card/border
 * per member) rather than four independently-boxed modules, so the whole
 * primary sequence reads as one interaction family: label, choice, next.
 * Pain/Stiffness/Fatigue keep their exact stored semantics (0–10 int /
 * 5-value enum / 0–10 int) — this is a visual/interaction upgrade of the
 * existing hierarchy, not a restructure of it. Optional fields
 * (Wellbeing/Body Map/Note) stay behind the single "More" disclosure,
 * unchanged in content and semantics — the Body Map itself is intentionally
 * NOT redesigned this phase (brief §17); its own doc comment records why.
 *
 * Product 2.1 Phase Y — High-Symptom Day: a user-declared-only marker
 * ("Symptoms feel more intense than usual today"). It is never inferred
 * from pain/fatigue/stiffness/body-area values — no threshold anywhere in
 * this file sets it. It defaults to false on every normal check-in, and
 * to true only when the caller passes `defaultHighSymptomDay` (Today's
 * explicit secondary entry point) on a fresh entry with no existing
 * value to preserve — and even then it's just the toggle's starting
 * position, fully visible and changeable before save (brief §2/§4/§11).
 */
export function CheckInForm({ initialValue, onSave, onChangeDraft, defaultHighSymptomDay }: CheckInFormProps) {
  const { t } = useTranslation();
  const { colors, typography, spacing } = useTheme();
  const profile = usePersonalizationProfile();
  const personalization = getCheckInPresentation(profile);
  const [value, setValue] = useState<CheckInFormValue>(
    initialValue ?? { ...DEFAULT_VALUE, isHighSymptomDay: defaultHighSymptomDay ?? false },
  );
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
      {/* One continuous interaction (brief §9/§10) — Pain, Morning
          stiffness, Fatigue, and High-Symptom Day as hairline-separated
          members of the same `Section`, not four separately boxed
          modules. High-Symptom Day stays in this always-visible primary
          sequence (never behind "+ More") since a user-declared-only
          marker must stay reviewable/changeable before every save (brief
          §2/§13/§14) — `ToggleRow`'s native Switch already exposes on/off
          to screen readers and isn't color-only. */}
      <Section>
        <View style={{ paddingVertical: spacing.md }}>
          <PainScale
            value={value.pain}
            onChange={(pain) => setValue((prev) => ({ ...prev, pain }))}
            priorityIndicator={personalization.emphasizedCoreSymptoms.includes("pain")}
          />
        </View>
        <View style={{ paddingVertical: spacing.md }}>
          <StiffnessSelector
            value={value.morningStiffnessBucket}
            onChange={(morningStiffnessBucket) => setValue((prev) => ({ ...prev, morningStiffnessBucket }))}
            priorityIndicator={personalization.emphasizedCoreSymptoms.includes("stiffness")}
          />
        </View>
        <View style={{ paddingVertical: spacing.md }}>
          <FatigueSelector
            value={value.fatigue}
            onChange={(fatigue) => setValue((prev) => ({ ...prev, fatigue }))}
            priorityIndicator={personalization.emphasizedCoreSymptoms.includes("fatigue")}
          />
        </View>
        <View style={{ paddingVertical: spacing.md }}>
          <ToggleRow
            label={t("checkIn.highSymptomDay.label")}
            description={t("checkIn.highSymptomDay.description")}
            value={value.isHighSymptomDay}
            onValueChange={(isHighSymptomDay) => setValue((prev) => ({ ...prev, isHighSymptomDay }))}
          />
        </View>
      </Section>

      {!showMore ? (
        <Button label={t("checkIn.addMore")} onPress={() => setShowMore(true)} variant="secondary" />
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xxs, marginBottom: spacing.xs }}>
            <Text style={{ fontSize: typography.caption.fontSize, color: colors.textSecondary }}>{t("checkIn.wellbeingLabel")}</Text>
            {personalization.wellbeingEmphasized ? (
              <Text style={{ fontSize: typography.micro.fontSize, color: colors.brandPrimary }}>· {t("checkIn.priorityIndicator")}</Text>
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

      <View style={{ marginTop: spacing.sm }}>
        <Button
          label={t("checkIn.save")}
          onPress={() =>
            onSave({
              pain: value.pain,
              fatigue: value.fatigue,
              morningStiffnessBucket: value.morningStiffnessBucket,
              wellbeing: value.wellbeing,
              isHighSymptomDay: value.isHighSymptomDay,
              bodyAreas: value.bodyAreas,
              notes: value.notes.trim() ? value.notes.trim() : undefined,
            })
          }
        />
      </View>
    </View>
  );
}
