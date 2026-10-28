import {
  borders,
  colors,
  dimensions,
  spacing,
  typography,
  motion,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";
import { links_openInNewTab } from "@/client/lib/links";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { SectionLabel } from "@/client/ui/section-label";
import {
  portfolio_featured_projects,
  portfolio_other_project_groups,
  type Project,
} from "./portfolio.data";
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
  featured: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 14rem), 1fr))",
    gap: spacing.space3,
    padding: 0,
  },
  card: {
    position: "relative",
    display: "grid",
    height: "100%",
    boxSizing: "border-box",
    alignContent: "start",
    gap: spacing.space2,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.line,
      [conditions.hover]: { default: null, ":hover": colors.accent },
      [stylex.when.descendant(":focus-visible")]: colors.accent,
    },
    padding: spacing.space4,
    transitionProperty: "border-color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
  },
  cardHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing.space3,
  },
  groups: {
    display: "grid",
    gap: spacing.space5,
  },
  group: {
    display: "grid",
    gap: spacing.space1,
  },
  groupHeading: {
    margin: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    fontWeight: typography.weightNormal,
    color: colors.muted,
  },
  index: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gap: spacing.space1,
    padding: 0,
  },
  entry: {
    position: "relative",
    display: "grid",
    minHeight: dimensions.sizeTouch,
    boxSizing: "border-box",
    alignContent: "center",
    paddingBlock: spacing.space1,
  },
  entryHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  // Stretches the primary link over its card or row, so the whole block stays clickable.
  stretchedLink: {
    textDecoration: "none",
    "::after": {
      content: "''",
      position: "absolute",
      inset: 0,
    },
  },
  raised: {
    position: "relative",
    zIndex: 1,
  },
  links: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: spacing.space4,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
  },
  website: {
    color: colors.muted,
  },
  sourceLink: {
    display: "inline-flex",
    minHeight: { default: dimensions.sizeTouch, [conditions.wide]: 0 },
    alignItems: "center",
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.link },
      ":focus-visible": colors.link,
    },
  },
  name: {
    minWidth: 0,
    overflowWrap: "break-word",
    transitionProperty: "color",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
    color: {
      default: colors.fg,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.link },
      ":focus-visible": colors.link,
    },
  },
  cardName: {
    fontWeight: typography.weightBold,
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

function captureProjectClick(project: Project, link: "website" | "source") {
  analytics_capture("project_clicked", {
    locale: getLocale(),
    project_id: project.name,
    project_kind: project.kind,
    project_link: link,
  });
}

function ProjectLink(props: { project: Project; styles?: stylex.StyleXStyles }) {
  return (
    <a
      href={props.project.website ?? props.project.href}
      {...links_openInNewTab}
      onClick={() =>
        captureProjectClick(props.project, props.project.website ? "website" : "source")
      }
      {...stylex.attrs(styles.name, styles.stretchedLink, props.styles, stylex.defaultMarker())}
    >
      {props.project.name}
    </a>
  );
}

function ProjectWebsite(props: { project: Project }) {
  return (
    <Show when={props.project.website}>
      {(website) => (
        <span {...stylex.attrs(styles.links)}>
          <span {...stylex.attrs(styles.website)}>{new URL(website()).host} ↗</span>
          <a
            href={props.project.href}
            {...links_openInNewTab}
            aria-label={m.project_source_link_label({ name: props.project.name })}
            onClick={() => captureProjectClick(props.project, "source")}
            {...stylex.attrs(styles.sourceLink, styles.raised)}
          >
            {m.project_source_link()}
          </a>
        </span>
      )}
    </Show>
  );
}

export function ProjectsPage() {
  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_projects()}</PageTitle>
      <section aria-labelledby="featured-heading" {...stylex.attrs(styles.section)}>
        <SectionLabel level="h2" id="featured-heading" count={portfolio_featured_projects().length}>
          {m.project_featured_heading()}
        </SectionLabel>
        <ul {...stylex.attrs(styles.featured)}>
          <For each={portfolio_featured_projects()}>
            {(project) => (
              <li {...stylex.attrs(styles.card, stylex.defaultMarker())}>
                <span {...stylex.attrs(styles.cardHeader)}>
                  <ProjectLink project={project} styles={styles.cardName} />
                  <span {...stylex.attrs(styles.year)}>{project.year}</span>
                </span>
                <span {...stylex.attrs(styles.description)}>{project.description}</span>
                <ProjectWebsite project={project} />
              </li>
            )}
          </For>
        </ul>
      </section>
      <section id="more" aria-labelledby="more-heading" {...stylex.attrs(styles.section)}>
        <SectionLabel level="h2" id="more-heading">
          {m.project_more_heading()}
        </SectionLabel>
        <div {...stylex.attrs(styles.groups)}>
          <For each={portfolio_other_project_groups()}>
            {(group) => (
              <div {...stylex.attrs(styles.group)}>
                <h3 {...stylex.attrs(styles.groupHeading)}>
                  {group.label} <span {...stylex.attrs(styles.year)}>{group.projects.length}</span>
                </h3>
                <ul {...stylex.attrs(styles.index)}>
                  <For each={group.projects}>
                    {(project) => (
                      <li {...stylex.attrs(styles.entry, stylex.defaultMarker())}>
                        <span {...stylex.attrs(styles.entryHeader)}>
                          <ProjectLink project={project} />
                          <Show when={project.year}>
                            <IndexList.Leader />
                            <IndexList.Value>{project.year}</IndexList.Value>
                          </Show>
                        </span>
                        <span {...stylex.attrs(styles.description)}>{project.description}</span>
                        <ProjectWebsite project={project} />
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </div>
      </section>
    </Page>
  );
}
