import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  motion,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createMemo, createSignal, For, Show, type JSX, type ParentProps } from "solid-js";
import { IconFileText, IconPuzzle } from "@tabler/icons-solidjs";
import { links_openInNewTab } from "@/client/lib/links";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { CopyCommand } from "./copy-command";
import {
  portfolio_agent_instructions,
  portfolio_agent_skill_groups,
  portfolio_agent_skills,
} from "./portfolio.data";

const styles = stylex.create({
  root: {
    maxWidth: dimensions.sizeArticle,
    gap: spacing.space8,
  },
  paragraph: {
    margin: 0,
  },
  section: {
    display: "grid",
    minWidth: 0,
    gridTemplateColumns: "minmax(0,1fr)",
    gap: spacing.space4,
  },
  heading: {
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.space2,
    fontSize: typography.fontLabel,
    fontWeight: typography.weightNormal,
    textTransform: "uppercase",
  },
  icon: {
    flexShrink: 0,
    color: colors.muted,
  },
  tag: {
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.line,
    paddingInline: spacing.space1_5,
    color: colors.faint,
  },
  repo: {
    display: "flex",
    alignItems: "baseline",
  },
  repoLink: {
    display: "inline-flex",
    minHeight: { default: dimensions.sizeTouch, [conditions.wide]: 0 },
    alignItems: "center",
    fontWeight: typography.weightBold,
  },
  repoValue: {
    flexShrink: 0,
    fontVariantNumeric: "tabular-nums",
    marginLeft: { default: "auto", [conditions.wide]: 0 },
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
  },
  note: {
    margin: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  contents: {
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
  },
  contentsList: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gap: { default: 0, [conditions.wide]: spacing.space1 },
    padding: 0,
  },
  sectionLink: {
    display: "flex",
    minHeight: { default: dimensions.sizeTouch, [conditions.wide]: 0 },
    alignItems: "baseline",
    paddingBlock: { default: spacing.space3, [conditions.wide]: 0 },
    color: colors.fg,
  },
  sectionTitle: {
    minWidth: 0,
    transitionProperty: "color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
    color: {
      default: null,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.link },
      [stylex.when.ancestor(":focus-visible")]: colors.link,
    },
  },
  sectionNumber: {
    transitionProperty: "color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.link },
      [stylex.when.ancestor(":focus-visible")]: colors.link,
    },
  },
  group: {
    display: "grid",
    minWidth: 0,
    gap: spacing.space3,
    marginTop: spacing.space2,
  },
  groupHeading: {
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
    gridTemplateColumns: "minmax(0,1fr)",
    gap: spacing.space4,
    padding: 0,
  },
  steps: {
    gap: 0,
  },
  step: {
    display: "grid",
    gridTemplateColumns: `${dimensions.sizeSmall} minmax(0,1fr)`,
    columnGap: spacing.space3,
    paddingBottom: { default: spacing.space4, ":last-child": 0 },
  },
  marker: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  number: {
    display: "grid",
    width: dimensions.sizeSmall,
    height: dimensions.sizeSmall,
    flexShrink: 0,
    placeItems: "center",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    fontSize: typography.fontLabel,
    color: colors.accent,
    fontVariantNumeric: "tabular-nums",
    transitionProperty: { default: null, [conditions.motion]: "border-color, background-color" },
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeColor,
  },
  numberLit: {
    borderColor: colors.accent,
  },
  numberCurrent: {
    backgroundColor: colors.accentTint,
  },
  rail: {
    flex: "1",
    width: borders.borderRule,
    marginBottom: `calc(-1 * ${spacing.space4})`,
    backgroundColor: colors.line,
  },
  railFill: {
    display: "block",
    height: "100%",
    backgroundColor: colors.accentHover,
    transform: "scaleY(0)",
    transformOrigin: "top",
    transitionProperty: { default: null, [conditions.motion]: "transform" },
    transitionDuration: motion.durationStagger,
    transitionTimingFunction: "linear",
  },
  railDrawn: {
    transform: "scaleY(1)",
  },
  delay: (steps: number) => ({
    transitionDelay: `calc(${Math.max(steps, 0)} * ${motion.durationStagger})`,
  }),
  skill: {
    display: "grid",
    gap: spacing.space1,
    color: colors.fg,
    textDecoration: "none",
  },
  name: {
    fontWeight: typography.weightBold,
    overflowWrap: "anywhere",
    transitionProperty: "color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
    color: {
      default: null,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.link },
      [stylex.when.ancestor(":focus-visible")]: colors.link,
    },
  },
  description: {
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
});

export function AgentsPage() {
  const instructions = portfolio_agent_instructions();
  const skills = portfolio_agent_skills();

  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_agents()}</PageTitle>
      <p {...stylex.attrs(styles.paragraph)}>{m.agents_intro()}</p>

      <section aria-labelledby="instructions-heading" {...stylex.attrs(styles.section)}>
        <SectionHeading id="instructions-heading" tag={m.agents_instructions_tag()}>
          <IconFileText size={14} aria-hidden="true" {...stylex.attrs(styles.icon)} />
          {m.agents_instructions()}
        </SectionHeading>
        <Repo name={instructions.name} href={instructions.href} value={instructions.license} />
        <p {...stylex.attrs(styles.note)}>{instructions.description}</p>
        <nav aria-label={m.agents_instructions_contents()} {...stylex.attrs(styles.contents)}>
          <ol {...stylex.attrs(styles.contentsList)}>
            <For each={instructions.sections}>
              {(section, index) => (
                <li>
                  <a
                    href={`${instructions.fileHref}#${section.anchor}`}
                    {...links_openInNewTab}
                    {...stylex.attrs(styles.sectionLink, stylex.defaultMarker())}
                  >
                    <span {...stylex.attrs(styles.sectionTitle)}>{section.title}</span>
                    <IndexList.Leader />
                    <span
                      aria-hidden="true"
                      {...stylex.attrs(styles.repoValue, styles.sectionNumber)}
                    >
                      {String(index() + 1).padStart(2, "0")}
                    </span>
                  </a>
                </li>
              )}
            </For>
          </ol>
        </nav>
        <CopyCommand command={instructions.command} />
      </section>

      <section aria-labelledby="skills-heading" {...stylex.attrs(styles.section)}>
        <SectionHeading id="skills-heading" tag={m.agents_skills_tag()}>
          <IconPuzzle size={14} aria-hidden="true" {...stylex.attrs(styles.icon)} />
          {m.agents_skills()}
        </SectionHeading>
        <Repo name={skills.name} href={skills.href} value={m.agents_skills_status()} />
        <CopyCommand command={skills.command} />
        <For each={portfolio_agent_skill_groups()}>
          {(group) => (
            <div {...stylex.attrs(styles.group)}>
              <h3 id={group.id} {...stylex.attrs(styles.groupHeading)}>
                {group.label}
              </h3>
              <p {...stylex.attrs(styles.note)}>{group.description}</p>
              <Show
                when={group.kind === "steps"}
                fallback={
                  <ul {...stylex.attrs(styles.list)}>
                    <For each={group.skills}>
                      {(skill) => (
                        <li>
                          <Skill plugin={group.plugin} {...skill} />
                        </li>
                      )}
                    </For>
                  </ul>
                }
              >
                <SkillSteps plugin={group.plugin} skills={group.skills} />
              </Show>
            </div>
          )}
        </For>
      </section>
    </Page>
  );
}

type SkillEntry = { name: string; label: string; description: string };

// The path lights steps 0..to. Segment k joins steps k and k + 1. Changes cascade one
// segment at a time away from the previous end of the path, so only the segments that
// change are delayed.
function SkillSteps(props: { plugin: string; skills: readonly SkillEntry[] }) {
  const [hovered, setHovered] = createSignal(-1);
  const [focused, setFocused] = createSignal(-1);
  const path = createMemo<{ from: number; to: number }>(
    (previous) => ({ from: previous.to, to: hovered() >= 0 ? hovered() : focused() }),
    { from: -1, to: -1 },
  );

  const growing = () => path().to > path().from;
  const start = () => Math.max(path().from, 0);
  const segmentDelay = (k: number) => (growing() ? k - start() : path().from - 1 - k);
  const numberDelay = (k: number) => (growing() ? k - start() : path().from - k);

  return (
    <ol
      {...stylex.attrs(styles.list, styles.steps)}
      onPointerLeave={() => setHovered(-1)}
      onFocusOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(-1);
      }}
    >
      <For each={props.skills}>
        {(skill, index) => (
          <li
            {...stylex.attrs(styles.step)}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") setHovered(index());
            }}
            onFocusIn={(event) => {
              if ((event.target as Element).matches(":focus-visible")) setFocused(index());
            }}
          >
            <span aria-hidden="true" {...stylex.attrs(styles.marker)}>
              <span
                {...dynamicAttrs(
                  styles.number,
                  index() <= path().to && styles.numberLit,
                  index() === path().to && styles.numberCurrent,
                  styles.delay(numberDelay(index())),
                )}
              >
                {index() + 1}
              </span>
              <Show when={index() < props.skills.length - 1}>
                <span {...stylex.attrs(styles.rail)}>
                  <span
                    {...dynamicAttrs(
                      styles.railFill,
                      index() < path().to && styles.railDrawn,
                      styles.delay(segmentDelay(index())),
                    )}
                  />
                </span>
              </Show>
            </span>
            <Skill plugin={props.plugin} {...skill} />
          </li>
        )}
      </For>
    </ol>
  );
}

// stylex.attrs kebab-cases the custom properties behind dynamic styles, so the compiled
// rule never reads them; props keeps their names.
function dynamicAttrs(...styles: stylex.StyleXStyles[]) {
  const { className, style } = stylex.props(...styles);

  return { class: className, style: style as JSX.CSSProperties | undefined };
}

function SectionHeading(props: ParentProps<{ id: string; tag: string }>) {
  return (
    <h2 id={props.id} {...stylex.attrs(styles.heading)}>
      {props.children}
      <span {...stylex.attrs(styles.tag)}>{props.tag}</span>
    </h2>
  );
}

function Repo(props: { name: string; href: string; value: string }) {
  return (
    <div {...stylex.attrs(styles.repo)}>
      <a href={props.href} {...links_openInNewTab} {...stylex.attrs(styles.repoLink)}>
        {props.name}
      </a>
      <IndexList.Leader />
      <span {...stylex.attrs(styles.repoValue)}>{props.value}</span>
    </div>
  );
}

function Skill(props: SkillEntry & { plugin: string }) {
  return (
    <a
      id={props.name}
      href={`https://github.com/Frantss/frantss-skills/blob/main/plugins/${props.plugin}/skills/${props.name}/SKILL.md`}
      {...links_openInNewTab}
      {...stylex.attrs(styles.skill, stylex.defaultMarker())}
    >
      <span {...stylex.attrs(styles.name)}>{props.label}</span>
      <span {...stylex.attrs(styles.description)}>{props.description}</span>
    </a>
  );
}
