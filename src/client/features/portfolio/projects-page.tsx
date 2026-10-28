import {
  borders,
  colors,
  spacing,
  typography,
  motion,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  IconBrandOpenSource,
  IconBriefcase,
  IconCode,
  IconDots,
  IconFlask,
} from "@tabler/icons-solidjs";
import { links_openInNewTab } from "@/client/lib/links";
import { IndexList } from "@/client/ui/index-list";
import { Page, PageTitle } from "@/client/ui/page";
import { Tooltip } from "@/client/ui/tooltip";
import {
  portfolio_featured_projects,
  portfolio_other_projects,
  portfolio_project_kind_label,
  type Project,
  type ProjectKind,
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
  heading: {
    margin: 0,
    fontSize: typography.fontLabel,
    fontWeight: typography.weightNormal,
    textTransform: "uppercase",
    color: colors.faint,
  },
  featured: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gridTemplateColumns: {
      default: "minmax(0,1fr)",
      [conditions.wide]: "repeat(3, minmax(0,1fr))",
    },
    gap: spacing.space3,
    padding: 0,
  },
  card: {
    display: "grid",
    height: "100%",
    boxSizing: "border-box",
    alignContent: "start",
    gap: spacing.space2,
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.line,
      [conditions.hover]: { default: null, ":hover": colors.lineStrong },
      ":focus-visible": colors.lineStrong,
    },
    padding: spacing.space4,
    color: colors.fg,
    textDecoration: "none",
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
  kindIcon: {
    display: "inline-flex",
    marginInlineEnd: spacing.space1_5,
    verticalAlign: "-0.125em",
  },
  name: {
    minWidth: 0,
    fontWeight: typography.weightBold,
    overflowWrap: "break-word",
    transitionProperty: "color",
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
  link: {
    color: {
      default: colors.fg,
      [conditions.hover]: { default: null, ":hover": colors.link },
      ":focus-visible": colors.link,
    },
  },
});

const kindIcons = {
  oss: IconBrandOpenSource,
  client: IconBriefcase,
  experiments: IconFlask,
  snippets: IconCode,
  misc: IconDots,
} satisfies Record<ProjectKind, unknown>;

function ProjectKindIcon(props: { kind: ProjectKind }) {
  const label = () => portfolio_project_kind_label(props.kind);

  return (
    <Tooltip label={label()}>
      {(triggerProps) => (
        <span
          {...triggerProps()}
          role="img"
          aria-label={label()}
          {...stylex.attrs(styles.kindIcon)}
        >
          <Dynamic component={kindIcons[props.kind]} size={14} aria-hidden="true" />
        </span>
      )}
    </Tooltip>
  );
}

function captureProjectClick(project: Project) {
  analytics_capture("project_clicked", {
    locale: getLocale(),
    project_id: project.name,
    project_kind: project.kind,
  });
}

export function ProjectsPage() {
  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_projects()}</PageTitle>
      <section aria-labelledby="featured-heading" {...stylex.attrs(styles.section)}>
        <h2 id="featured-heading" {...stylex.attrs(styles.heading)}>
          {m.project_featured_heading()}
        </h2>
        <ul {...stylex.attrs(styles.featured)}>
          <For each={portfolio_featured_projects()}>
            {(project) => (
              <li>
                <a
                  href={project.href}
                  {...links_openInNewTab}
                  onClick={() => captureProjectClick(project)}
                  {...stylex.attrs(styles.card, stylex.defaultMarker())}
                >
                  <span {...stylex.attrs(styles.cardHeader)}>
                    <span {...stylex.attrs(styles.name)}>{project.name}</span>
                    <span {...stylex.attrs(styles.year)}>
                      <ProjectKindIcon kind={project.kind} />
                      {project.year}
                    </span>
                  </span>
                  <span {...stylex.attrs(styles.description)}>{project.description}</span>
                </a>
              </li>
            )}
          </For>
        </ul>
      </section>
      <section id="more" aria-labelledby="more-heading" {...stylex.attrs(styles.section)}>
        <h2 id="more-heading" {...stylex.attrs(styles.heading)}>
          {m.project_more_heading()}
        </h2>
        <IndexList.Root>
          <For each={portfolio_other_projects()}>
            {(project) => (
              <IndexList.Row>
                <span>
                  <ProjectKindIcon kind={project.kind} />
                  <a
                    href={project.href}
                    {...links_openInNewTab}
                    onClick={() => captureProjectClick(project)}
                    {...stylex.attrs(styles.link)}
                  >
                    {project.name}
                  </a>
                </span>
                <IndexList.Leader />
                <IndexList.Value>{project.year}</IndexList.Value>
              </IndexList.Row>
            )}
          </For>
        </IndexList.Root>
      </section>
    </Page>
  );
}
