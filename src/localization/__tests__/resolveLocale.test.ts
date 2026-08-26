import { resolveLocale } from "../resolveLocale";

describe("resolveLocale", () => {
  it("uses the system language when it's supported and there is no override", () => {
    expect(resolveLocale("tr", null)).toBe("tr");
    expect(resolveLocale("en", null)).toBe("en");
  });

  it("falls back to English for an unsupported system language", () => {
    expect(resolveLocale("fr", null)).toBe("en");
    expect(resolveLocale(null, null)).toBe("en");
  });

  it("lets an explicit user override win over the system language", () => {
    expect(resolveLocale("en", "tr")).toBe("tr");
    expect(resolveLocale("tr", "en")).toBe("en");
  });
});
