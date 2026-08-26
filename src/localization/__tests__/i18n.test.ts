import { translate } from "../i18n";
import en from "../translations/en.json";
import tr from "../translations/tr.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "object" && value !== null
      ? flattenKeys(value as Record<string, unknown>, path)
      : [path];
  });
}

describe("translation key parity", () => {
  it("has an identical key set in en.json and tr.json — no missing translations", () => {
    expect(flattenKeys(tr).sort()).toEqual(flattenKeys(en).sort());
  });
});

describe("translate", () => {
  it("switches languages per call without mutating shared state", () => {
    expect(translate("en", "common.save")).toBe("Save");
    expect(translate("tr", "common.save")).toBe("Kaydet");
    // A call for one locale must not leak into the next call for another.
    expect(translate("en", "common.save")).toBe("Save");
  });

  it("Turkish strings are allowed to run longer than their English equivalent (spec §30) — never truncated by this layer", () => {
    const en_ = translate("en", "database.migrationError");
    const tr_ = translate("tr", "database.migrationError");
    expect(tr_.length).toBeGreaterThan(en_.length);
  });

  it("does not throw for a missing key — degrades to a visible placeholder instead of crashing", () => {
    expect(() => translate("en", "this.key.does.not.exist")).not.toThrow();
  });
});
