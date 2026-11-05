import { env } from "cloudflare:workers";
import { reset } from "cloudflare:test";
import { afterEach, expect, it } from "vite-plus/test";
import { handleAPI } from "@/server/orpc/orpc.handler";
import { services } from "./bindings";
import { articles } from "./articles";

afterEach(reset);

it("keeps each overlapping request on its explicitly supplied likes storage", async () => {
  const first = env.ARTICLE_LIKES.getByName("request-services-first");
  const second = env.ARTICLE_LIKES.getByName("request-services-second");

  await first.addLike();
  const { promise: gate, resolve: release } = Promise.withResolvers<void>();
  let arrived = 0;
  const requestServices = [first, second].map((stub) => ({
    ...services,
    likes: {
      get: () => stub.getCount(),
      async add() {
        if (++arrived === 2) release();
        await gate;

        return stub.addLike();
      },
    },
  }));
  const responses = await Promise.all(
    requestServices.map((services) =>
      handleAPI(
        new Request(`http://localhost/api/articles/${articles[0].slug}/likes`, { method: "POST" }),
        services,
      ),
    ),
  );

  expect(responses.map((response) => response.status)).toEqual([200, 200]);
  await expect(Promise.all(responses.map((response) => response.json()))).resolves.toEqual([
    { count: 2 },
    { count: 1 },
  ]);
});
