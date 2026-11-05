import type {} from "./server/request-context";
import handler, { createServerEntry } from "@tanstack/solid-start/server-entry";
import { paraglideMiddleware } from "@/paraglide/server";
import { cache_personalContent } from "@/shared/cache-control";

export default createServerEntry({
  async fetch(request, options) {
    const response = await paraglideMiddleware(request, () => handler.fetch(request, options));

    if (
      response.headers.get("content-type")?.startsWith("text/html") &&
      !response.headers.has("cache-control")
    ) {
      response.headers.set("cache-control", cache_personalContent);
    }

    return response;
  },
});
