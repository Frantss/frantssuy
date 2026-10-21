import { For, Show } from "solid-js";
import { links_openInNewTab } from "@/client/lib/links";
import { Entry } from "@/client/ui/entry";
import { LocalizedMessage } from "@/client/ui/localized-message";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { portfolio_agent_skill_groups } from "./portfolio.data";

export function SkillsPage() {
  return (
    <Page class="max-w-[64ch] gap-8 wrap-anywhere">
      <PageTitle>{m.page_skills()}</PageTitle>
      <div class="grid gap-3">
        <p class="m-0">
          <LocalizedMessage message={m.skills_intro} />
        </p>
        <p class="m-0 text-xs text-muted">{m.skills_status()}</p>
      </div>
      <For each={portfolio_agent_skill_groups()}>
        {(group) => (
          <section aria-labelledby={`${group.id}-heading`} class="grid min-w-0 gap-3">
            <h2 id={`${group.id}-heading`} class="m-0 text-[10px] font-normal text-muted uppercase">
              {group.label}
            </h2>
            <Show when={group.description}>
              <p class="m-0 text-xs text-muted">{group.description}</p>
            </Show>
            <ul class="m-0 grid list-none gap-6 p-0">
              <For each={group.skills}>
                {(skill) => (
                  <li>
                    <Entry.Root id={skill.name}>
                      <h3 class="m-0 text-sm font-bold">
                        <a
                          href={`https://github.com/Frantss/frantss-skills/blob/main/skills/${skill.name}/SKILL.md`}
                          {...links_openInNewTab}
                          class="inline-flex min-h-11 items-center sm:min-h-0"
                        >
                          {skill.name.replace(/^frantss-/, "")}
                        </a>
                      </h3>
                      <p class="m-0 text-muted">{skill.description}</p>
                    </Entry.Root>
                  </li>
                )}
              </For>
            </ul>
          </section>
        )}
      </For>
    </Page>
  );
}
