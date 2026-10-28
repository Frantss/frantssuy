import { colors, spacing, dimensions, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";
import { IconLink } from "@tabler/icons-solidjs";
import { links_openInNewTab } from "@/client/lib/links";
import { Entry } from "@/client/ui/entry";
import { Tags } from "@/client/ui/tags";
import { m } from "@/paraglide/messages";
import { JobDuration } from "./job-duration";
import type { Job } from "./portfolio.data";

const styles = stylex.create({
  root: {
    scrollMarginTop: spacing.space6,
  },
  heading: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.space2,
  },
  permalink: {
    display: "grid",
    width: { default: dimensions.sizeTouch, [conditions.wide]: spacing.space5 },
    height: { default: dimensions.sizeTouch, [conditions.wide]: spacing.space5 },
    flexShrink: 0,
    placeItems: "center",
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
    },
  },
});

export function JobEntry(props: { job: Job }) {
  const id = () =>
    `${props.job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${props.job.start.replace(".", "-")}`;

  return (
    <Entry.Root id={id()} styles={styles.root}>
      <Entry.Header>
        <Entry.Title>
          <span {...stylex.attrs(styles.heading)}>
            <span>
              {props.job.role} ·{" "}
              <Show when={props.job.href} fallback={props.job.company}>
                <a href={props.job.href} {...links_openInNewTab}>
                  {props.job.company}
                </a>
              </Show>
            </span>
            <a
              href={`#${id()}`}
              aria-label={`${props.job.company} · ${props.job.role} · ${props.job.start}`}
              {...stylex.attrs(styles.permalink)}
            >
              <IconLink size={14} aria-hidden="true" />
            </a>
          </span>
        </Entry.Title>
        <Entry.Aside>
          {props.job.start}–{props.job.end === "∞" ? m.job_present() : props.job.end}
        </Entry.Aside>
      </Entry.Header>
      <Entry.Meta>
        <span>{props.job.type}</span>
        <span>{props.job.location}</span>
        <JobDuration start={props.job.start} end={props.job.end} />
      </Entry.Meta>
      <Show when={props.job.bullets.length > 0}>
        <Entry.Bullets>
          <For each={props.job.bullets}>{(bullet) => <Entry.Bullet>{bullet}</Entry.Bullet>}</For>
        </Entry.Bullets>
      </Show>
      <Show when={props.job.stack.length > 0}>
        <Tags.List>
          <For each={props.job.stack}>{(tech) => <Tags.Item>{tech}</Tags.Item>}</For>
        </Tags.List>
      </Show>
    </Entry.Root>
  );
}
