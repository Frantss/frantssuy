import { colors, spacing, typography } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import type { ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

const styles = stylex.create({
  root: {
    display: "grid",
    gap: spacing.space2,
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    justifyContent: "space-between",
    columnGap: spacing.space4,
  },
  title: {
    margin: 0,
    fontSize: typography.fontSm,
    lineHeight: typography.leadingSm,
    fontWeight: typography.weightBold,
  },
  aside: {
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  bullets: {
    margin: 0,
    display: "grid",
    listStyleType: "none",
    gap: spacing.space1,
    padding: 0,
    color: colors.muted,
  },
  bullet: {
    display: "flex",
    gap: spacing.space2,
  },
  marker: {
    color: colors.accent,
  },
});

// A titled record (job, role, education): header row, subtitle, meta line, bullets.
function EntryRoot(
  props: ParentProps<{ id?: string; class?: string; styles?: stylex.StyleXStyles }>,
) {
  return (
    <article
      id={props.id}
      {...stylex.attrs(styles.root, props.styles)}
      class={cn(stylex.attrs(styles.root, props.styles).class, props.class)}
    >
      {props.children}
    </article>
  );
}

function EntryHeader(props: ParentProps) {
  return <div {...stylex.attrs(styles.header)}>{props.children}</div>;
}

function EntryTitle(props: ParentProps) {
  return <h2 {...stylex.attrs(styles.title)}>{props.children}</h2>;
}

function EntryAside(props: ParentProps) {
  return <span {...stylex.attrs(styles.aside)}>{props.children}</span>;
}

function EntrySubtitle(props: ParentProps) {
  return <div>{props.children}</div>;
}

// Children are separated by a faint pipe.
function EntryMeta(props: ParentProps) {
  return (
    <div {...stylex.attrs(styles.meta)} class={cn("entry-meta", stylex.attrs(styles.meta).class)}>
      {props.children}
    </div>
  );
}

function EntryBullets(props: ParentProps) {
  return <ul {...stylex.attrs(styles.bullets)}>{props.children}</ul>;
}

function EntryBullet(props: ParentProps) {
  return (
    <li {...stylex.attrs(styles.bullet)}>
      <span {...stylex.attrs(styles.marker)} aria-hidden="true">
        ›
      </span>
      <span>{props.children}</span>
    </li>
  );
}

export const Entry = {
  Root: EntryRoot,
  Header: EntryHeader,
  Title: EntryTitle,
  Aside: EntryAside,
  Subtitle: EntrySubtitle,
  Meta: EntryMeta,
  Bullets: EntryBullets,
  Bullet: EntryBullet,
};
