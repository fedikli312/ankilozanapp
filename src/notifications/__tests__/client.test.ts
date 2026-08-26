import { toExpoWeekday } from "../client";

describe("toExpoWeekday", () => {
  it("converts the domain's 0(Sunday)-6(Saturday) convention to expo-notifications' 1-7", () => {
    expect(toExpoWeekday(0)).toBe(1); // Sunday
    expect(toExpoWeekday(1)).toBe(2); // Monday
    expect(toExpoWeekday(6)).toBe(7); // Saturday
  });
});
