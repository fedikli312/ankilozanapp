import { Children, Fragment, type ReactNode } from "react";
import { View } from "react-native";

import { useTheme } from "../useTheme";
import { Hairline } from "./Hairline";
import { SectionLabel } from "./SectionLabel";

export type SectionProps = {
  /** Optional section header, rendered with `SectionLabel`'s existing uppercase treatment. */
  title?: string;
  /** Row-shaped elements (typically `ListRow`) — a hairline is inserted between each, matching `GroupedList`'s own separator rule, but with no outer box. */
  children: ReactNode;
  /**
   * "default" (no tone change) — the everyday, container-free grouping.
   * "document" — a quieter, more structured register for report-facing
   * content (Appointment Summary, Labs) per `docs/DESIGN_DIRECTION_2_0.md`
   * §1's named exception: tighter row spacing, no extra top margin before
   * the label, meant to read as one continuous document rather than a
   * screen's worth of everyday sections.
   */
  tone?: "default" | "document";
};

/**
 * Design System 2.0's primary grouped-content primitive — replaces
 * `GroupedList`'s default triple-framing (`surface` fill + 1px border +
 * 16px radius, applied to nearly every section on nearly every screen,
 * `docs/DESIGN_RESEARCH_2_0.md` §3 item 1) with the "whitespace +
 * typography + hairlines" language `docs/DESIGN_DIRECTION_2_0.md` §7
 * calls for. No box, no fill, no border — a label, then rows separated by
 * hairlines, then whitespace before the next section.
 *
 * `GroupedList` was kept alongside this component through the phased
 * Design-B→I rollout so legacy screens kept rendering unchanged
 * (`docs/DESIGN_REDESIGN_PLAN_2_0.md` §26), then deleted in Design-I's
 * final pass once every screen had migrated to `Section` and it had zero
 * remaining consumers. A genuine card/boxed treatment is still available
 * via a dedicated `QuietSurface` for the rare moment content actually
 * needs that prominence — never as the default.
 */
export function Section({ title, children, tone = "default" }: SectionProps) {
  const { spacing } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);
  const document = tone === "document";

  return (
    <View style={{ marginBottom: document ? spacing.lg : spacing.xl }}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <View>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <Hairline /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
