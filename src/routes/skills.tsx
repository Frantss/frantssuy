import { createFileRoute, redirect } from "@tanstack/solid-router";

export const Route = createFileRoute("/skills")({
  beforeLoad: () => {
    throw redirect({ to: "/agents", statusCode: 301 });
  },
});
