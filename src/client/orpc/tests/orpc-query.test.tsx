import { useStore } from "@nanostores/solid";
import { ORPCError } from "@orpc/client";
import { createMemo, createSignal, type Setter } from "solid-js";
import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { useQueries, type Queries } from "@/client/orpc/orpc.query";
import { client } from "@/client/orpc/orpc.transport";
import {
  article_addLikeStore,
  article_likesStore,
} from "@/client/features/portfolio/article-likes.query";
import { getRouter } from "@/router";

vi.mock("@/routeTree.gen", async () => {
  const { createRootRoute } = await import("@tanstack/solid-router");

  return { routeTree: createRootRoute() };
});

let dispose: (() => void) | undefined;
const clients: Queries[] = [];

afterEach(() => {
  dispose?.();
  dispose = undefined;
  clients.splice(0).forEach((queries) => queries.cache.clear());
  vi.unstubAllGlobals();
});

function createRouter() {
  const router = getRouter();

  clients.push(router.options.context.queries);

  return router;
}

describe("oRPC with Nano Query", () => {
  it("provides the router cache, deduplicates requests, and keeps router instances isolated", async () => {
    const fetch = vi.fn(async () => Response.json({ status: "ok" }));

    vi.stubGlobal("fetch", fetch);
    const router = createRouter();
    const other = createRouter();
    const Wrap = router.options.Wrap!;
    let provided: Queries | undefined;

    function Health() {
      provided = useQueries();
      const query = useStore(
        provided.createFetcherStore("health", { fetcher: () => client.health() }),
      );

      return <output>{query().data?.status}</output>;
    }

    const container = document.createElement("div");

    dispose = render(
      () => (
        <Wrap>
          <Health />
          <Health />
        </Wrap>
      ),
      container,
    );

    await vi.waitFor(() => expect(container.textContent).toBe("okok"));
    expect(provided).toBe(router.options.context.queries);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(other.options.context.queries.cache.size).toBe(0);
  });

  it("hydrates prefetched data without another request", async () => {
    const fetch = vi.fn(async () => Response.json({ count: 7 }));

    vi.stubGlobal("fetch", fetch);
    const server = createRouter();

    await article_likesStore(server.options.context.queries, "first").fetch();
    const snapshot = await server.options.dehydrate!();
    const browser = createRouter();

    await browser.options.hydrate!(JSON.parse(JSON.stringify(snapshot)));
    const Wrap = browser.options.Wrap!;

    function Likes() {
      const query = useStore(article_likesStore(useQueries(), "first"));

      return <output>{query().data?.count}</output>;
    }

    const container = document.createElement("div");

    dispose = render(
      () => (
        <Wrap>
          <Likes />
        </Wrap>
      ),
      container,
    );
    expect(container.textContent).toBe("7");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("hydrates failed queries with their oRPC error and cooldown data", async () => {
    const data = { limit: 30, remaining: 0, reset: Date.now() + 2000 };
    const fetch = vi.fn(async () =>
      Response.json(
        {
          defined: true,
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests",
          data,
        },
        { status: 429 },
      ),
    );

    vi.stubGlobal("fetch", fetch);
    const server = createRouter();

    await article_likesStore(server.options.context.queries, "first").fetch();
    const snapshot = await server.options.dehydrate!();
    const browser = createRouter();

    await browser.options.hydrate!(JSON.parse(JSON.stringify(snapshot)));
    const result = await article_likesStore(browser.options.context.queries, "first").fetch();

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toBeInstanceOf(ORPCError);
      expect(result.error.data).toEqual(data);
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("keeps a completed like when an older read finishes afterward", async () => {
    let finish!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      finish = resolve;
    });
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ count: 3 }))
      .mockImplementationOnce(() => pending)
      .mockResolvedValueOnce(Response.json({ count: 4 }));

    vi.stubGlobal("fetch", fetch);
    const queries = createRouter().options.context.queries;
    const store = article_likesStore(queries, "first");

    dispose = store.listen(() => {});
    await vi.waitFor(() => expect(store.get().data?.count).toBe(3));
    store.revalidate();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    const pendingRead = store.get().promise;

    await article_addLikeStore(queries).mutate("first");
    expect(store.get().data?.count).toBe(4);
    finish(Response.json({ count: 3 }));
    await pendingRead;
    expect(store.get().loading).toBe(false);
    expect(store.get().data?.count).toBe(4);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("tracks reactive inputs and shares REST mutation results with readers", async () => {
    const counts: Record<string, number> = { first: 2, second: 7 };
    const fetch = vi.fn(async (url: string, init: RequestInit) => {
      const slug = new URL(url, location.origin).pathname.split("/")[3];

      if (init.method === "POST") counts[slug] += 1;

      return Response.json({ count: counts[slug] });
    });

    vi.stubGlobal("fetch", fetch);
    const router = createRouter();
    const Wrap = router.options.Wrap!;
    let setSlug!: Setter<string>;
    let addLike!: () => Promise<unknown>;

    function Likes() {
      const queries = useQueries();
      const [slug, updateSlug] = createSignal("first");
      const subscription = createMemo(() => useStore(article_likesStore(queries, slug())));
      const mutation = useStore(article_addLikeStore(queries));

      setSlug = updateSlug;
      addLike = () => mutation().mutate(slug());

      return <output>{subscription()().data?.count}</output>;
    }

    const container = document.createElement("div");

    dispose = render(
      () => (
        <Wrap>
          <Likes />
          <Likes />
        </Wrap>
      ),
      container,
    );
    await vi.waitFor(() => expect(container.textContent).toBe("22"));
    setSlug("second");
    await vi.waitFor(() => expect(container.textContent).toBe("27"));
    await addLike();
    await vi.waitFor(() => expect(container.textContent).toBe("28"));
    expect(
      fetch.mock.calls.some(
        ([url, init]) => url === "/api/articles/second/likes" && init.method === "POST",
      ),
    ).toBe(true);
    await expect(
      article_likesStore(router.options.context.queries, "first").fetch(),
    ).resolves.toEqual({ data: { count: 2 } });
  });
});
