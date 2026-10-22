import { colors, spacing, typography, dimensions, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";
import { links_openInNewTab } from "@/client/lib/links";
import { Entry } from "@/client/ui/entry";
import { LocalizedMessage } from "@/client/ui/localized-message";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { portfolio_agent_skill_groups } from "./portfolio.data";

const styles = stylex.create({
  root: {
    maxWidth: dimensions.sizeArticle,
    gap: spacing.space8,
    overflowWrap: "anywhere",
  },
  intro: {
    display: "grid",
    gap: spacing.space3,
  },
  paragraph: {
    margin: 0,
  },
  note: {
    margin: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  section: {
    display: "grid",
    minWidth: 0,
    gap: spacing.space3,
  },
  heading: {
    margin: 0,
    fontSize: typography.fontLabel,
    fontWeight: typography.weightNormal,
    color: colors.muted,
    textTransform: "uppercase",
  },
  list: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gap: spacing.space6,
    padding: 0,
  },
  title: {
    margin: 0,
    fontSize: typography.fontSm,
    lineHeight: typography.leadingSm,
    fontWeight: typography.weightBold,
  },
  link: {
    display: "inline-flex",
    minHeight: { default: dimensions.sizeTouch, [conditions.wide]: 0 },
    alignItems: "center",
  },
  description: {
    margin: 0,
    color: colors.muted,
  },
});

export function SkillsPage() {
  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_skills()}</PageTitle>
      <div {...stylex.attrs(styles.intro)}>
        <p {...stylex.attrs(styles.paragraph)}>
          <LocalizedMessage message={m.skills_intro} />
        </p>
        <p {...stylex.attrs(styles.note)}>{m.skills_status()}</p>
      </div>
      <For each={portfolio_agent_skill_groups()}>
        {(group) => (
          <section aria-labelledby={`${group.id}-heading`} {...stylex.attrs(styles.section)}>
            <h2 id={`${group.id}-heading`} {...stylex.attrs(styles.heading)}>
              {group.label}
            </h2>
            <Show when={group.description}>
              <p {...stylex.attrs(styles.note)}>{group.description}</p>
            </Show>
            <ul {...stylex.attrs(styles.list)}>
              <For each={group.skills}>
                {(skill) => (
                  <li>
                    <Entry.Root id={skill.name}>
                      <h3 {...stylex.attrs(styles.title)}>
                        <a
                          href={`https://github.com/Frantss/frantss-skills/blob/main/skills/${skill.name}/SKILL.md`}
                          {...links_openInNewTab}
                          {...stylex.attrs(styles.link)}
                        >
                          {skill.name.replace(/^frantss-/, "")}
                        </a>
                      </h3>
                      <p {...stylex.attrs(styles.description)}>{skill.description}</p>
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
