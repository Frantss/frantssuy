import {
  colors,
  spacing,
  typography,
  dimensions,
  motion,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For, Match, Switch } from "solid-js";
import {
  IconBrandOpenSource,
  IconBriefcase,
  IconCode,
  IconDots,
  IconFlask,
} from "@tabler/icons-solidjs";
import { links_openInNewTab } from "@/client/lib/links";
import { Page, PageTitle } from "@/client/ui/page";
import { portfolio_project_groups } from "./portfolio.data";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { analytics_capture } from "@/client/analytics/analytics";

const styles = stylex.create({
  root: {
    gap: spacing.space8,
  },
  section: {
    display: "grid",
    minWidth: 0,
    scrollMarginTop: spacing.space6,
    gridTemplateColumns: "minmax(0,1fr)",
    gap: spacing.space3,
  },
  heading: {
    margin: 0,
    fontSize: typography.fontLabel,
    fontWeight: typography.weightNormal,
    textTransform: "uppercase",
  },
  anchor: {
    display: "flex",
    minHeight: { default: dimensions.sizeTouch, [conditions.wide]: 0 },
    width: "fit-content",
    alignItems: "center",
    gap: spacing.space2,
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
    },
  },
  icon: {
    flexShrink: 0,
    color: {
      default: colors.muted,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.fg },
      [stylex.when.ancestor(":focus-visible")]: colors.fg,
    },
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
  },
  staticIcon: {
    flexShrink: 0,
    color: colors.muted,
  },
  list: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gridTemplateColumns: "minmax(0,1fr)",
    gap: spacing.space4,
    padding: 0,
  },
  project: {
    display: "grid",
    gap: spacing.space1,
    color: colors.fg,
    textDecoration: "none",
  },
  details: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.space3,
  },
  name: {
    minWidth: 0,
    fontWeight: typography.weightBold,
    overflowWrap: "break-word",
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
    color: {
      default: null,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.link },
      [stylex.when.ancestor(":focus-visible")]: colors.link,
    },
  },
  year: {
    flexShrink: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
    fontVariantNumeric: "tabular-nums",
  },
  description: {
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
});

export function ProjectsPage() {
  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_projects()}</PageTitle>
      <For each={portfolio_project_groups()}>
        {(group) => (
          <section id={group.kind} {...stylex.attrs(styles.section)}>
            <h2
              id={group.kind === "misc" ? "miscellaneous" : undefined}
              {...stylex.attrs(styles.heading)}
            >
              <a href={`#${group.kind}`} {...stylex.attrs(styles.anchor, stylex.defaultMarker())}>
                <Switch>
                  <Match when={group.kind === "oss"}>
                    <IconBrandOpenSource
                      size={14}
                      aria-hidden="true"
                      {...stylex.attrs(styles.icon)}
                    />
                  </Match>
                  <Match when={group.kind === "client"}>
                    <IconBriefcase size={14} aria-hidden="true" {...stylex.attrs(styles.icon)} />
                  </Match>
                  <Match when={group.kind === "experiments"}>
                    <IconFlask size={14} aria-hidden="true" {...stylex.attrs(styles.icon)} />
                  </Match>
                  <Match when={group.kind === "snippets"}>
                    <IconCode size={14} aria-hidden="true" {...stylex.attrs(styles.staticIcon)} />
                  </Match>
                  <Match when={group.kind === "misc"}>
                    <IconDots size={14} aria-hidden="true" {...stylex.attrs(styles.icon)} />
                  </Match>
                </Switch>
                {group.label}
              </a>
            </h2>
            <ul {...stylex.attrs(styles.list)}>
              <For each={group.projects}>
                {(project) => (
                  <li>
                    <a
                      href={project.href}
                      {...links_openInNewTab}
                      onClick={() =>
                        analytics_capture("project_clicked", {
                          locale: getLocale(),
                          project_id: project.name,
                          project_kind: project.kind,
                        })
                      }
                      {...stylex.attrs(styles.project, stylex.defaultMarker())}
                    >
                      <span {...stylex.attrs(styles.details)}>
                        <span {...stylex.attrs(styles.name)}>{project.name}</span>
                        <span {...stylex.attrs(styles.year)}>{project.year}</span>
                      </span>
                      <span {...stylex.attrs(styles.description)}>{project.description}</span>
                    </a>
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
