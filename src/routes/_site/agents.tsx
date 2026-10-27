import { createFileRoute } from "@tanstack/solid-router";
import { AgentsPage } from "@/client/features/portfolio/agents-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/agents")({
  head: () => {
    const metadata = seo({
      title: `${m.page_agents()} · ${profile.name}`,
      description: m.meta_agents({ name: profile.name }),
      path: "/agents",
      image: site.socialImage,
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: AgentsPage,
});
