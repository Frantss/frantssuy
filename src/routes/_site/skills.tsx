import { createFileRoute } from "@tanstack/solid-router";
import { SkillsPage } from "@/client/features/portfolio/skills-page";
import { profile } from "@/client/features/portfolio/portfolio.data";
import { seo } from "@/shared/seo/seo";
import { site } from "@/shared/seo/site";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_site/skills")({
  head: () => {
    const metadata = seo({
      title: `${m.page_skills()} · ${profile.name}`,
      description: m.meta_skills({ name: profile.name }),
      path: "/skills",
      image: site.socialImage,
    });

    return { meta: metadata.meta, links: metadata.links };
  },
  component: SkillsPage,
});
