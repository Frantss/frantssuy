import { createRouter as createTanStackRouter } from "@tanstack/solid-router";
import { createQueries, QueryContext } from "@/client/orpc/orpc.query";
import { aria_prefersReduced } from "@/client/lib/motion";
import { Frame } from "@/client/ui/frame";
import { routeTree } from "@/routeTree.gen";

export function getRouter() {
  const queries = createQueries();
  const router = createTanStackRouter({
    routeTree,
    context: { queries },
    dehydrate: () => ({ queries: queries.dehydrate() }),
    hydrate: (dehydrated) => queries.hydrate(dehydrated.queries),
    Wrap: (props) => (
      <QueryContext.Provider value={queries}>{props.children}</QueryContext.Provider>
    ),

    scrollRestoration: true,
    scrollRestorationBehavior: "instant",
    scrollToTopSelectors: [Frame.fillSelector],
    // Same-path navigations (a hash, or the current page's own link) keep the page scrolled, and a
    // snapshot of a scrolled page would be drawn over the header, so they skip the transition.
    defaultViewTransition: {
      types: ({ pathChanged }) => (aria_prefersReduced() || !pathChanged ? false : []),
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
