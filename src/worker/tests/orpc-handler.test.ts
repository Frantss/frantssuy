import { reset } from "cloudflare:test";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { handleAPI as handleWorkerAPI } from "@/server/orpc/orpc.handler";
import { services } from "./bindings";

afterEach(reset);

function handleAPI(request: Request) {
  return handleWorkerAPI(request, services);
}

describe("OpenAPI transport", () => {
  it("routes GET /api/health and returns plain JSON", async () => {
    const response = await handleAPI(new Request("http://localhost/api/health"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  it.each(["/api/missing", "/health", "/api-other/health"])("returns 404 for %s", async (path) => {
    const response = await handleAPI(new Request(`http://localhost${path}`));

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("Not found");
  });

  it("rejects POST for the GET-only health procedure", async () => {
    const response = await handleAPI(
      new Request("http://localhost/api/health", { method: "POST" }),
    );

    expect(response.status).toBe(404);
  });

  it.each(["GET", "POST"])("rejects unknown articles on %s", async (method) => {
    const response = await handleAPI(
      new Request("http://localhost/api/articles/missing/likes", { method }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      code: "NOT_FOUND",
      message: "Article not found",
    });
  });
});
