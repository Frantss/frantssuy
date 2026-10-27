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
import { createMemo, createSignal, For, Show, type Component, type JSX } from "solid-js";
import { IconFileText, IconPuzzle } from "@tabler/icons-solidjs";
import { Dynamic } from "solid-js/web";
import { Tooltip } from "@/client/ui/tooltip";
import { links_openInNewTab } from "@/client/lib/links";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { CopyCommand } from "./copy-command";
import { portfolio_agent_instructions, portfolio_agent_skill_groups } from "./portfolio.data";

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
  icon: {
    display: "inline-flex",
    flexShrink: 0,
    alignSelf: "center",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    font: "inherit",
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.muted },
      ":focus-visible": colors.muted,
    },
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
    minHeight: { default: dimensions.sizeControl, [conditions.wide]: 0 },
    alignItems: "center",
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
  plugin: {
    display: "grid",
    minWidth: 0,
    gap: spacing.space3,
    marginTop: spacing.space2,
    paddingTop: spacing.space4,
  },
  title: {
    margin: 0,
    display: "inline-flex",
    minWidth: 0,
    alignItems: "center",
    gap: spacing.space2,
    fontSize: "inherit",
  },
  titleText: {
    fontWeight: typography.weightBold,
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

  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_agents()}</PageTitle>
      <p {...stylex.attrs(styles.paragraph)}>{m.agents_intro()}</p>

      <section aria-labelledby="instructions-heading" {...stylex.attrs(styles.section)}>
        <Heading
          level="h2"
          id="instructions-heading"
          name={instructions.name}
          href={instructions.href}
          value={instructions.license}
          kind={m.agents_instructions()}
          icon={IconFileText}
        />
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

      <section id="skills" aria-label={m.agents_skills()} {...stylex.attrs(styles.section)}>
        <For each={portfolio_agent_skill_groups()}>
          {(group) => (
            <section aria-labelledby={group.id} {...stylex.attrs(styles.plugin)}>
              <Heading
                level="h3"
                id={group.id}
                name={group.label}
                value={m.agents_plugin_skill_count({ count: group.members.length })}
                kind={m.agents_skills()}
                icon={IconPuzzle}
              />
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
            </section>
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

// A section title: optionally what kind of thing it is (icon with a tooltip), its name, and a
// trailing note.
function Heading(props: {
  level: "h2" | "h3";
  id: string;
  name: string;
  href?: string;
  value: JSX.Element;
  kind?: string;
  icon?: Component<{ size?: number; "aria-hidden"?: boolean | "true" }>;
}) {
  return (
    <div {...stylex.attrs(styles.repo)}>
      <Dynamic component={props.level} id={props.id} {...stylex.attrs(styles.title)}>
        <Show when={props.kind && props.icon}>
          <Tooltip label={props.kind!}>
            {(triggerProps) => (
              <button
                {...triggerProps()}
                type="button"
                aria-label={props.kind}
                {...stylex.attrs(styles.icon)}
              >
                <Dynamic component={props.icon} size={14} aria-hidden="true" />
              </button>
            )}
          </Tooltip>
        </Show>
        <Show
          when={props.href}
          fallback={<span {...stylex.attrs(styles.titleText)}>{props.name}</span>}
        >
          {(href) => (
            <a href={href()} {...links_openInNewTab} {...stylex.attrs(styles.repoLink)}>
              {props.name}
            </a>
          )}
        </Show>
      </Dynamic>
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
