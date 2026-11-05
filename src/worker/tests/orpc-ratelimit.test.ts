import { env } from "cloudflare:workers";
import { reset } from "cloudflare:test";
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi/fetch";
import { createRouterClient, type RouterClient } from "@orpc/server";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { createContext } from "@/server/orpc/orpc.context";
import { handleAPI as handleWorkerAPI } from "@/server/orpc/orpc.handler";
import { router } from "@/server/orpc/orpc.router";
import { contract } from "@/shared/orpc/orpc.contract";
import { services } from "./bindings";
import { articles } from "./articles";

let nextAddress = 1;
let address: string;
const slug = articles[0].slug;

beforeEach(() => {
  address = `192.0.2.${nextAddress++}`;
});

afterEach(reset);

function handleAPI(request: Request) {
  return handleWorkerAPI(request, services);
}

function request(path: string, method = "GET", clientIP = address) {
  return handleAPI(
    new Request(`http://localhost/api${path}`, {
      method,
      headers: { "cf-connecting-ip": clientIP, "x-request-source": "ssr" },
    }),
  );
}

async function exhaust(binding: RateLimit) {
  for (let attempt = 0; attempt < 1000; attempt++) {
    if (!(await binding.limit({ key: address })).success) return;
  }

  throw new Error("The native rate-limit binding did not reject requests.");
}

describe("native Cloudflare API rate limiting", () => {
  it("rejects writes across articles without changing likes, while another IP remains independent", async () => {
    await exhaust(env.LIKES_WRITE_BURST_RATE_LIMITER);
    const response = await request(`/articles/${slug}/likes`, "POST");

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      defined: true,
      code: "TOO_MANY_REQUESTS",
      data: {},
    });
    expect(response.headers.has("Retry-After")).toBe(false);
    expect(response.headers.has("RateLimit-Remaining")).toBe(false);
    expect((await request(`/articles/${articles[1].slug}/likes`, "POST")).status).toBe(429);
    await expect(env.ARTICLE_LIKES.getByName(slug).getCount()).resolves.toEqual({ count: 0 });
    await expect(env.ARTICLE_LIKES.getByName(articles[1].slug).getCount()).resolves.toEqual({
      count: 0,
    });

    const client: RouterClient<typeof router> = createORPCClient(
      new OpenAPILink(contract, {
        url: "/api",
        origin: "http://localhost",
        headers: { "cf-connecting-ip": address },
        fetch: (url, init) => handleAPI(new Request(url, init)),
      }),
    );

    await expect(client.articles.likes.add({ slug })).rejects.toMatchObject({
      defined: true,
      code: "TOO_MANY_REQUESTS",
    });
    const independent = await request(`/articles/${slug}/likes`, "POST", "198.51.100.1");

    expect(independent.status).toBe(200);
    await expect(independent.json()).resolves.toEqual({ count: 1 });
  });

  it("enforces the minute write quota even when the burst quota has capacity", async () => {
    await exhaust(env.LIKES_WRITE_RATE_LIMITER);
    const response = await request(`/articles/${slug}/likes`, "POST");

    expect(response.status).toBe(429);
    await expect(env.ARTICLE_LIKES.getByName(slug).getCount()).resolves.toEqual({ count: 0 });
    expect((await request(`/articles/${slug}/likes`)).status).toBe(200);
  });

  it("keeps read quotas separate and leaves health and direct SSR calls available", async () => {
    await exhaust(env.SEARCH_RATE_LIMITER);
    expect((await request("/articles")).status).toBe(429);
    expect((await request(`/articles/${slug}/likes`)).status).toBe(200);
    await exhaust(env.LIKES_READ_RATE_LIMITER);
    expect((await request(`/articles/${slug}/likes`)).status).toBe(429);
    expect((await request("/health")).status).toBe(200);
    const ssr = createRouterClient(router, {
      context: () =>
        createContext({
          headers: new Headers({ "cf-connecting-ip": address }),
          services,
          source: "ssr",
        }),
    });

    await expect(ssr.articles.get({})).resolves.toMatchObject({ total: 3 });
    await expect(ssr.articles.likes.get({ slug })).resolves.toEqual({ count: 0 });
    expect((await request("/articles")).status).toBe(429);
  });

  it("normalizes IP aliases before selecting rate-limit keys", () => {
    const key = (clientIP: string) =>
      createContext({ headers: new Headers({ "cf-connecting-ip": clientIP }), services }).clientIP;

    expect(key(" ::ffff:192.0.2.1 ")).toBe(key("192.0.2.1"));
    expect(key("2001:0db8:0000:0000:0000:0000:0000:0001")).toBe(key("2001:db8::1"));
    expect(key("invalid")).toBe("unknown");
    expect(key("fe80::1%eth0")).toBe("unknown");
    expect(key("192.0.2.1, 192.0.2.2")).toBe("unknown");
  });
});
