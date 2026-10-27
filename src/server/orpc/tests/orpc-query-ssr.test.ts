import { afterAll, afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createQueries } from "@/client/orpc/orpc.query";
import { client } from "@/client/orpc/orpc.transport";
import { db } from "@/server/db/db";
import { createContext } from "@/server/orpc/orpc.context";

const current = vi.hoisted(() => ({ request: new Request("http://localhost/") }));

vi.mock("@tanstack/solid-start/server", () => ({
  getRequestHeaders: () => current.request.headers,
}));
vi.mock("@/server/orpc/orpc.context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/orpc/orpc.context")>();

  return { ...actual, createContext: vi.fn(actual.createContext) };
});

afterEach(() => vi.unstubAllGlobals());
afterAll(() => db.$client.end());

describe("oRPC Nano Query during SSR", () => {
  it("calls handlers without fetch and creates context for each incoming request", async () => {
    const fetch = vi.fn(() => {
      throw new Error("SSR must not fetch its own API");
    });

    vi.stubGlobal("fetch", fetch);
    const queries = createQueries();

    try {
      current.request = new Request("https://first.example/writing", {
        headers: { "x-request-id": "first" },
      });
      await expect(
        queries.createFetcherStore("health", { fetcher: () => client.health() }).fetch(),
      ).resolves.toEqual({
        data: { status: "ok" },
      });
      expect(createContext).toHaveBeenNthCalledWith(1, {
        headers: current.request.headers,
        source: "ssr",
      });
      current.request = new Request("https://second.example/projects", {
        headers: { "x-request-id": "second" },
      });
      const other = createQueries();

      await expect(
        other.createFetcherStore("health", { fetcher: () => client.health() }).fetch(),
      ).resolves.toEqual({
        data: { status: "ok" },
      });
      expect(createContext).toHaveBeenNthCalledWith(2, {
        headers: current.request.headers,
        source: "ssr",
      });
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      queries.cache.clear();
    }
  });
});
