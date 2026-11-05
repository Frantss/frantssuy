import type {} from "@tanstack/router-core";
import type { WorkerServices } from "../worker/services";

export type ServerRegistration = {
  requestContext: { services: WorkerServices };
};

// TypeScript 7 needs the owning package; Start's entry types also use the Solid re-export.
// https://github.com/TanStack/router/issues/8186
declare module "@tanstack/router-core" {
  interface Register {
    server: ServerRegistration;
  }
}

declare module "@tanstack/solid-router" {
  interface Register {
    server: ServerRegistration;
  }
}
