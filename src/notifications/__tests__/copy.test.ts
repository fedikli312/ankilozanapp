import { buildNotificationContent } from "../copy";
import { translate } from "../../localization/i18n";

describe("buildNotificationContent", () => {
  it("defaults to the generic, privacy-preserving body", () => {
    const content = buildNotificationContent({ locale: "en", detailOptIn: false });
    expect(content.body).toBe(translate("en", "notifications.defaultBody"));
  });

  it("stays generic even with a detailed body if the user has not opted in", () => {
    const content = buildNotificationContent({
      locale: "en",
      detailOptIn: false,
      detailedBody: "Take your Sulfasalazine",
    });
    expect(content.body).toBe(translate("en", "notifications.defaultBody"));
  });

  it("uses the detailed body only when opted in AND a detailed body is supplied", () => {
    const content = buildNotificationContent({
      locale: "en",
      detailOptIn: true,
      detailedBody: "Take your Sulfasalazine",
    });
    expect(content.body).toBe("Take your Sulfasalazine");
  });

  it("falls back to generic when opted in but no detailed body was supplied", () => {
    const content = buildNotificationContent({ locale: "en", detailOptIn: true });
    expect(content.body).toBe(translate("en", "notifications.defaultBody"));
  });

  it("renders the Turkish translation for the tr locale", () => {
    const content = buildNotificationContent({ locale: "tr", detailOptIn: false });
    expect(content.body).toBe(translate("tr", "notifications.defaultBody"));
    expect(content.body).not.toBe(translate("en", "notifications.defaultBody"));
  });
});
