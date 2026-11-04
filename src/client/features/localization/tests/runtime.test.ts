import { afterEach, describe, expect, it } from "vite-plus/test";
import { getLocale, setLocale } from "@/paraglide/runtime";

afterEach(() => {
  document.cookie = "x-frantss-locale=; Path=/; Max-Age=0";
  document.cookie = "PARAGLIDE_LOCALE=; Path=/; Max-Age=0";
});

describe("locale detection", () => {
  it("falls back to English without a locale cookie", () => {
    expect(getLocale()).toBe("en");
  });

  it.each(["en", "es"] as const)("reads %s from the configured cookie", (locale) => {
    document.cookie = `x-frantss-locale=${locale}; Path=/`;
    expect(getLocale()).toBe(locale);
  });

  it("falls back to English for an unsupported cookie value", () => {
    document.cookie = "x-frantss-locale=fr; Path=/";
    expect(getLocale()).toBe("en");
  });

  it("ignores the default Paraglide cookie name", () => {
    document.cookie = "PARAGLIDE_LOCALE=es; Path=/";
    expect(getLocale()).toBe("en");
  });

  it("persists locale changes in the configured cookie", async () => {
    await setLocale("es", { reload: false });
    expect(document.cookie).toContain("x-frantss-locale=es");
    expect(getLocale()).toBe("es");
    expect(window.location.pathname).not.toMatch(/^\/es(?:\/|$)/);
  });

  it("keeps the CV English without changing the site's Spanish preference", () => {
    const originalUrl = window.location.href;

    document.cookie = "x-frantss-locale=es; Path=/";
    try {
      window.history.replaceState(null, "", "/cv?print=1");
      expect(getLocale()).toBe("en");
      expect(document.cookie).toContain("x-frantss-locale=es");

      window.history.replaceState(null, "", "/work");
      expect(getLocale()).toBe("es");
    } finally {
      window.history.replaceState(null, "", originalUrl);
    }
  });
});
