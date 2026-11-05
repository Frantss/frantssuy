import handler, { type ServerEntry } from "@tanstack/solid-start/server-entry";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import server from "@/server";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";

vi.mock("@tanstack/solid-start/server-entry", () => ({
  default: { fetch: vi.fn() },
  createServerEntry: (entry: ServerEntry) => entry,
}));

const limiter = { limit: vi.fn() };
const options = {
  context: {
    services: {
      likes: { get: vi.fn(), add: vi.fn() },
      rateLimits: {
        search: limiter,
        likesRead: limiter,
        likesWriteBurst: limiter,
        likesWrite: limiter,
      },
    },
  },
};

beforeEach(() => {
  vi.mocked(handler.fetch).mockReset();
});

describe("server locale", () => {
  it("renders readable localized HTML when gzip is accepted", async () => {
    vi.mocked(handler.fetch).mockImplementation(
      async () =>
        new Response(m.page_work(), { headers: { "content-type": "text/html; charset=utf-8" } }),
    );
    const response = await server.fetch(
      new Request("http://localhost/work", {
        headers: { cookie: "x-frantss-locale=es", "accept-encoding": "gzip" },
      }),
      options,
    );

    expect(response.headers.get("cache-control")).toBe("private, no-cache");
    await expect(response.text()).resolves.toBe("Experiencia");
  });

  it.each([
    ["", "en", "Work"],
    ["x-frantss-locale=en", "en", "Work"],
    ["x-frantss-locale=es", "es", "Experiencia"],
    ["x-frantss-locale=fr", "en", "Work"],
    ["PARAGLIDE_LOCALE=es", "en", "Work"],
  ])("renders %s using %s", async (cookie, locale, text) => {
    const request = new Request("http://localhost/work", { headers: { cookie } });

    vi.mocked(handler.fetch).mockImplementation(async () => {
      await Promise.resolve();
      expect(getLocale()).toBe(locale);

      return new Response(m.page_work());
    });

    const response = await server.fetch(request, options);

    await expect(response.text()).resolves.toBe(text);
  });

  it.each([
    ["/cv?print=1", "en"],
    ["/cv/", "en"],
    ["/cv-extra", "es"],
  ])("uses the correct locale for a Spanish request to %s", async (path, locale) => {
    vi.mocked(handler.fetch).mockImplementation(async () => new Response(getLocale()));

    const response = await server.fetch(
      new Request(`http://localhost${path}`, {
        headers: { cookie: "x-frantss-locale=es" },
      }),
      options,
    );

    await expect(response.text()).resolves.toBe(locale);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("isolates overlapping English and Spanish requests across async work", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let remaining = 2;

    vi.mocked(handler.fetch).mockImplementation(async () => {
      if (--remaining === 0) release();
      await gate;

      return new Response(m.page_work());
    });

    const responses = await Promise.all(
      ["en", "es"].map(async (locale) =>
        server.fetch(
          new Request("http://localhost/work", {
            headers: { cookie: `x-frantss-locale=${locale}` },
          }),
          options,
        ),
      ),
    );

    await expect(Promise.all(responses.map((response) => response.text()))).resolves.toEqual([
      "Work",
      "Experiencia",
    ]);
  });

  it.each([
    ["", "en_US"],
    ["x-frantss-locale=es", "es_UY"],
    ["x-frantss-locale=fr", "en_US"],
  ])("matches social metadata to the request locale for %s", async (cookie, locale) => {
    vi.mocked(handler.fetch).mockImplementation(async () => {
      const metadata = seo({
        title: m.page_work(),
        description: m.meta_work({ name: "Francisco Bongiovanni" }),
        path: "/work",
        image: site.socialImage,
      });

      return Response.json(metadata);
    });

    const response = await server.fetch(
      new Request("http://localhost/work", { headers: { cookie } }),
      options,
    );
    const metadata = await response.json();

    expect(metadata.meta).toContainEqual({ property: "og:locale", content: locale });
  });
});
