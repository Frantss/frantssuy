import { env } from "cloudflare:workers";
import { evictDurableObject, reset, runDurableObjectAlarm } from "cloudflare:test";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { call } from "@orpc/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { getArticleLikes } from "@/server/features/articles/$slug/likes.get";
import { addArticleLike } from "@/server/features/articles/$slug/likes.post";
import type { Context } from "@/server/orpc/orpc.context";
import { services } from "./bindings";

vi.mock("@/lib/articles/article-metadata", () => ({
  article_list: () => [{ slug: "likes-test-first" }, { slug: "likes-test-second" }],
}));

const router = { articles: { likes: { get: getArticleLikes, add: addArticleLike } } };
const handler = new OpenAPIHandler(router);

async function request(slug: string, method: "GET" | "POST" = "GET", body?: string, locale = "en") {
  const headers = new Headers({ "Accept-Language": locale });

  if (body !== undefined) headers.set("Content-Type", "application/json");

  const init: RequestInit = method === "POST" ? { method, body, headers } : { method, headers };
  const { response } = await handler.handle(
    new Request(`http://localhost/api/articles/${slug}/likes`, init),
    { prefix: "/api", context: { ...services, headers } },
  );

  if (!response) throw new Error("The likes API did not handle the request.");

  return response;
}

async function count(
  slug: string,
  method: "GET" | "POST" = "GET",
  body?: string,
  locale = "en",
): Promise<{ count: number }> {
  const response = await request(slug, method, body, locale);

  expect(response.status).toBe(200);

  return response.json();
}

afterEach(async () => {
  await reset();
});

describe("article likes in SQLite Durable Objects", () => {
  it("starts at zero and isolates article identities", async () => {
    const first = env.ARTICLE_LIKES.getByName("likes-test-first");
    const second = env.ARTICLE_LIKES.getByName("likes-test-second");

    await expect(first.getCount()).resolves.toEqual({ count: 0 });
    await expect(first.addLike()).resolves.toEqual({ count: 1 });
    await expect(second.getCount()).resolves.toEqual({ count: 0 });
    await expect(second.addLike()).resolves.toEqual({ count: 1 });
    await expect(first.getCount()).resolves.toEqual({ count: 1 });
  });

  it("adds one per HTTP request without trusting client counts or slugs", async () => {
    await expect(count("likes-test-first", "POST")).resolves.toEqual({ count: 1 });
    await expect(
      count("likes-test-first", "POST", JSON.stringify({ count: 100, slug: "likes-test-second" })),
    ).resolves.toEqual({ count: 2 });
    await expect(count("likes-test-first")).resolves.toEqual({ count: 2 });
    await expect(count("likes-test-second")).resolves.toEqual({ count: 0 });
  });

  it("keeps every concurrent increment, including the initial insert", async () => {
    const results = await Promise.all(
      Array.from({ length: 40 }, () => count("likes-test-first", "POST")),
    );

    expect(results.map(({ count }) => count).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 1),
    );
    await expect(count("likes-test-first")).resolves.toEqual({ count: 40 });
  });

  it("retains likes when the runtime evicts and reconstructs the object", async () => {
    const stub = env.ARTICLE_LIKES.getByName("likes-test-first");

    await stub.addLike();
    await expect(stub.addLike()).resolves.toEqual({ count: 2 });
    await evictDurableObject(stub);

    const restored = env.ARTICLE_LIKES.getByName("likes-test-first");

    await expect(restored.getCount()).resolves.toEqual({ count: 2 });
    await expect(restored.addLike()).resolves.toEqual({ count: 3 });
    await expect(count("likes-test-first")).resolves.toEqual({ count: 3 });
  });

  it("does not schedule an alarm that could erase likes", async () => {
    const stub = env.ARTICLE_LIKES.getByName("likes-test-first");

    await expect(stub.addLike()).resolves.toEqual({ count: 1 });
    await expect(runDurableObjectAlarm(stub)).resolves.toBe(false);
    await expect(stub.getCount()).resolves.toEqual({ count: 1 });
  });

  it("shares the canonical article counter across locales", async () => {
    await expect(count("likes-test-first", "POST")).resolves.toEqual({ count: 1 });
    await expect(count("likes-test-first", "POST", undefined, "es")).resolves.toEqual({
      count: 2,
    });
    await expect(count("likes-test-first", "GET", undefined, "es")).resolves.toEqual({
      count: 2,
    });
    await expect(count("likes-test-first")).resolves.toEqual({ count: 2 });
    const translatedSlug = await request("prueba-me-gusta-primero", "POST", undefined, "es");

    expect(translatedSlug.status).toBe(404);
    await expect(count("likes-test-first")).resolves.toEqual({ count: 2 });
  });

  it("rejects unknown article slugs for reads and writes", async () => {
    const read = await request("missing-article");
    const write = await request("missing-article", "POST");

    expect(read.status).toBe(404);
    expect(write.status).toBe(404);
    await expect(count("likes-test-first")).resolves.toEqual({ count: 0 });
  });

  it("validates procedure input before accessing article storage", async () => {
    const context: Context = { ...services, headers: new Headers() };

    await expect(call(getArticleLikes, { slug: "" }, { context })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(call(addArticleLike, { slug: "" }, { context })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(count("likes-test-first")).resolves.toEqual({ count: 0 });
  });
});
