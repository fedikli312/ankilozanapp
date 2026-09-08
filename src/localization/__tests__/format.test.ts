import { formatDate, formatNumber, formatWeekday } from "../format";

describe("formatDate", () => {
  it("formats the same date differently per locale", () => {
    const date = new Date(Date.UTC(2026, 7, 26)); // August 26, 2026

    const en = formatDate(date, "en");
    const tr = formatDate(date, "tr");

    expect(en).toContain("August");
    expect(tr).toContain("Ağustos");
    expect(en).not.toBe(tr);
  });
});

describe("formatNumber", () => {
  it("uses the correct decimal separator per locale", () => {
    expect(formatNumber(1234.5, "en")).toBe("1,234.5");
    expect(formatNumber(1234.5, "tr")).toBe("1.234,5");
  });
});

describe("formatWeekday", () => {
  it("formats the same date's weekday differently per locale", () => {
    const date = new Date(Date.UTC(2026, 8, 8)); // September 8, 2026 — a Tuesday

    const en = formatWeekday(date, "en");
    const tr = formatWeekday(date, "tr");

    expect(en).toBe("Tuesday");
    expect(tr).toBe("Salı");
  });
});
