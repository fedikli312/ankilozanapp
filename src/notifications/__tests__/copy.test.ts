import { buildNotificationContent, DEFAULT_NOTIFICATION_BODY } from "../copy";

describe("buildNotificationContent", () => {
  it("defaults to the generic, privacy-preserving body", () => {
    const content = buildNotificationContent({ detailOptIn: false });
    expect(content.body).toBe(DEFAULT_NOTIFICATION_BODY);
  });

  it("stays generic even with a detailed body if the user has not opted in", () => {
    const content = buildNotificationContent({
      detailOptIn: false,
      detailedBody: "Take your Sulfasalazine",
    });
    expect(content.body).toBe(DEFAULT_NOTIFICATION_BODY);
  });

  it("uses the detailed body only when opted in AND a detailed body is supplied", () => {
    const content = buildNotificationContent({
      detailOptIn: true,
      detailedBody: "Take your Sulfasalazine",
    });
    expect(content.body).toBe("Take your Sulfasalazine");
  });

  it("falls back to generic when opted in but no detailed body was supplied", () => {
    const content = buildNotificationContent({ detailOptIn: true });
    expect(content.body).toBe(DEFAULT_NOTIFICATION_BODY);
  });
});
