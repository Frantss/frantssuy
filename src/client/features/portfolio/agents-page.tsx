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
import { createMemo, createSignal, For, Show, type JSX } from "solid-js";
import { IconBrandGithub, IconCheck, IconCopy, IconLink } from "@tabler/icons-solidjs";
import { Button, ButtonLink } from "@/client/ui/button";
import { createClipboardCopy } from "@/client/lib/create-clipboard-copy";
import { links_openInNewTab } from "@/client/lib/links";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import {
  portfolio_agent_install,
  portfolio_agent_sections,
  type AgentExample,
  type AgentSection,
} from "./portfolio.data";

const styles = stylex.create({
  root: {
    maxWidth: dimensions.sizeArticle,
    gap: spacing.space12,
  },
  top: {
    display: "grid",
    gap: spacing.space4,
  },
  paragraph: {
    margin: 0,
  },
  install: {
    display: "grid",
    gap: spacing.space1_5,
  },
  installers: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.space1_5,
  },
  command: {
    display: "flex",
    minHeight: {
      default: dimensions.sizeControl,
      [conditions.coarsePointer]: dimensions.sizeTouch,
    },
    minWidth: 0,
    alignItems: "center",
    gap: spacing.space2,
    borderWidth: borders.borderRule,
    borderBottomWidth: borders.borderEmphasis,
    borderStyle: "solid",
    borderColor: colors.lineStrong,
    borderBottomColor: colors.edge,
    borderRadius: borders.radiusControl,
    paddingBlock: spacing.space1,
    paddingLeft: spacing.space2_5,
    paddingRight: spacing.space1,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
  },
  commandText: {
    display: "grid",
    minWidth: 0,
    flex: "1",
    overflowX: "auto",
    whiteSpace: "nowrap",
    scrollbarWidth: "none",
  },
  commandLine: {
    whiteSpace: "nowrap",
  },
  commandName: {
    color: colors.accent,
  },
  copy: {
    width: dimensions.sizeSmall,
    height: dimensions.sizeSmall,
    flexShrink: 0,
    paddingInline: 0,
  },
  links: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: spacing.space1_5,
  },
  section: {
    display: "grid",
    minWidth: 0,
    gap: spacing.space3,
  },
  heading: {
    position: "relative",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: spacing.space3,
    fontSize: "inherit",
    fontWeight: typography.weightNormal,
  },
  name: {
    fontWeight: typography.weightBold,
    whiteSpace: "nowrap",
    transitionProperty: "color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
    color: {
      default: colors.fg,
      [conditions.hover]: { default: null, ":hover": colors.link },
      ":focus-visible": colors.link,
    },
  },
  // Sits in the gutter left of the heading, so revealing it never moves the text.
  anchorIcon: {
    position: "absolute",
    right: "100%",
    top: "50%",
    display: { default: "inline-flex", [conditions.narrow]: "none" },
    marginRight: spacing.space2,
    translate: "0 -50%",
    color: colors.faint,
    opacity: {
      default: 0,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: 1 },
      [stylex.when.ancestor(":focus-visible")]: 1,
    },
    transitionProperty: { default: null, [conditions.motion]: "opacity" },
    transitionDuration: motion.durationFast,
    transitionTimingFunction: motion.easeOut,
  },
  slash: {
    color: colors.faint,
  },
  hairline: {
    minWidth: spacing.space4,
    flex: "1",
    height: borders.borderRule,
    backgroundColor: colors.line,
  },
  note: {
    flexShrink: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
  },
  noteEmphasis: {
    color: colors.accent,
  },
  prose: {
    margin: 0,
    color: colors.muted,
  },
  term: {
    fontWeight: typography.weightMedium,
    color: colors.fg,
  },
  example: {
    margin: 0,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: colors.line,
    borderRadius: borders.radiusControl,
    paddingBlock: spacing.space3,
    paddingInline: spacing.space4,
    overflowX: "auto",
    fontFamily: "inherit",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  prompt: {
    color: colors.fg,
  },
  promptMark: {
    color: colors.accent,
  },
  steps: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    padding: 0,
  },
  step: {
    display: "grid",
    gridTemplateColumns: `${dimensions.sizeSmall} minmax(0,1fr)`,
    columnGap: spacing.space3,
    paddingBottom: { default: spacing.space3, ":last-child": 0 },
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
    marginBottom: `calc(-1 * ${spacing.space3})`,
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
  stepText: {
    display: "flex",
    flexWrap: "wrap",
    minHeight: dimensions.sizeSmall,
    alignItems: "center",
    columnGap: spacing.space2,
  },
  stepLink: {
    fontWeight: typography.weightBold,
    color: {
      default: colors.fg,
      [conditions.hover]: { default: null, ":hover": colors.link },
      ":focus-visible": colors.link,
    },
  },
  stepOutput: {
    color: colors.faint,
  },
  arrow: {
    color: colors.accent,
  },
  srOnly: {
    position: "absolute",
    width: dimensions.sizeScreenReader,
    height: dimensions.sizeScreenReader,
    padding: 0,
    margin: spacing.screenReaderOffset,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
});

export function AgentsPage() {
  return (
    <Page styles={styles.root}>
      <div {...stylex.attrs(styles.top)}>
        <PageTitle>{m.page_agents()}</PageTitle>
        <p {...stylex.attrs(styles.paragraph)}>{m.agents_intro()}</p>
        <Install />
      </div>
      <For each={portfolio_agent_sections()}>{(section) => <Section {...section} />}</For>
    </Page>
  );
}

function Install() {
  const install = portfolio_agent_install();
  const [installerId, setInstallerId] = createSignal(install.installers[0].id);
  const installer = () =>
    install.installers.find((option) => option.id === installerId()) ?? install.installers[0];
  const clipboard = createClipboardCopy();
  const status = () =>
    ({ idle: "", copied: m.agents_command_copied(), failed: m.agents_copy_command_failed() })[
      clipboard.state()
    ];

  return (
    <div {...stylex.attrs(styles.install)}>
      <div role="group" aria-label={m.agents_installer()} {...stylex.attrs(styles.installers)}>
        <For each={install.installers}>
          {(option) => (
            <Button
              variant="toggle"
              aria-pressed={option.id === installerId()}
              onClick={() => setInstallerId(option.id)}
            >
              {option.label}
            </Button>
          )}
        </For>
      </div>
      <div {...stylex.attrs(styles.command)}>
        <code {...stylex.attrs(styles.commandText)}>
          <For each={installer().commands}>
            {(command) => {
              const [program, ...args] = command.split(" ");

              return (
                <span {...stylex.attrs(styles.commandLine)}>
                  <span {...stylex.attrs(styles.commandName)}>{program}</span> {args.join(" ")}
                </span>
              );
            }}
          </For>
        </code>
        <Button
          variant="quiet"
          aria-label={m.agents_copy_command()}
          styles={styles.copy}
          onClick={() => void clipboard.copy(installer().commands.join("\n"))}
        >
          <Show
            when={clipboard.state() === "copied"}
            fallback={<IconCopy size={16} aria-hidden="true" />}
          >
            <IconCheck size={16} aria-hidden="true" />
          </Show>
        </Button>
        <span role="status" {...stylex.attrs(styles.srOnly)}>
          {status()}
        </span>
      </div>
      <div {...stylex.attrs(styles.links)}>
        <For each={install.links}>
          {(link) => (
            <ButtonLink variant="secondary" href={link.href} {...links_openInNewTab}>
              <IconBrandGithub size={16} aria-hidden="true" />
              {link.label}
            </ButtonLink>
          )}
        </For>
      </div>
    </div>
  );
}

function Section(props: AgentSection) {
  return (
    <section aria-labelledby={props.id} {...stylex.attrs(styles.section)}>
      <h2 id={props.id} {...stylex.attrs(styles.heading)}>
        <a href={`#${props.id}`} {...stylex.attrs(styles.name, stylex.defaultMarker())}>
          <IconLink size={16} aria-hidden="true" {...stylex.attrs(styles.anchorIcon)} />
          <span aria-hidden="true" {...stylex.attrs(styles.slash)}>
            /
          </span>
          {props.name}
        </a>
        <span aria-hidden="true" {...stylex.attrs(styles.hairline)} />
        <Show when={props.note}>
          {(note) => (
            <span {...stylex.attrs(styles.note, note().emphasis && styles.noteEmphasis)}>
              {note().text}
            </span>
          )}
        </Show>
      </h2>
      <p {...stylex.attrs(styles.prose)}>
        <Emphasis text={props.description} />
      </p>
      <Show when={props.example}>{(example) => <Example example={example()} />}</Show>
    </section>
  );
}

// Renders **marked** terms as emphasis, so translations keep control of which words stand out.
function Emphasis(props: { text: string }) {
  return (
    <For each={props.text.split("**")}>
      {(part, index) => (
        <Show when={index() % 2 === 1} fallback={part}>
          <strong {...stylex.attrs(styles.term)}>{part}</strong>
        </Show>
      )}
    </For>
  );
}

function Example(props: { example: AgentExample }) {
  const example = props.example;

  if (example.kind === "steps") return <Steps steps={example.steps} />;

  return (
    <pre {...stylex.attrs(styles.example)}>
      <Show when={example.prompt}>
        {(prompt) => (
          <span {...stylex.attrs(styles.prompt)}>
            <span aria-hidden="true" {...stylex.attrs(styles.promptMark)}>
              {"> "}
            </span>
            {prompt()}
            {"\n"}
          </span>
        )}
      </Show>
      {example.lines.join("\n")}
    </pre>
  );
}

type Step = Extract<AgentExample, { kind: "steps" }>["steps"][number];

// The path lights steps 0..to. Segment k joins steps k and k + 1. Changes cascade one
// segment at a time away from the previous end of the path, so only the segments that
// change are delayed.
function Steps(props: { steps: Step[] }) {
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
      {...stylex.attrs(styles.steps)}
      onPointerLeave={() => setHovered(-1)}
      onFocusOut={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(-1);
      }}
    >
      <For each={props.steps}>
        {(step, index) => (
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
              <Show when={index() < props.steps.length - 1}>
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
            <span {...stylex.attrs(styles.stepText)}>
              <a href={step.href} {...links_openInNewTab} {...stylex.attrs(styles.stepLink)}>
                /{step.name}
              </a>
              <span {...stylex.attrs(styles.stepOutput)}>
                <span aria-hidden="true" {...stylex.attrs(styles.arrow)}>
                  →{" "}
                </span>
                {step.output}
              </span>
            </span>
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
