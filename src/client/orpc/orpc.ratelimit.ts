import { ORPCError } from "@orpc/client";
import { createSignal } from "solid-js";
import { useToast } from "@/client/ui/toast";
import { m } from "@/paraglide/messages";

export function createRateLimitNotice() {
  const toaster = useToast();
  const [limited, setLimited] = createSignal(false);

  function handle(error: unknown) {
    setLimited(false);
    if (!(error instanceof ORPCError) || error.code !== "TOO_MANY_REQUESTS") return false;

    setLimited(true);
    toaster.create({
      id: "api-rate-limit",
      type: "warning",
      title: m.api_rate_limited(),
    });

    return true;
  }

  return { limited, handle };
}
