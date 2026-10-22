import { colors, spacing, typography, borders } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For, type ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

const styles = stylex.create({
  root: {
    display: "grid",
    gap: spacing.space5,
  },

  title: {
    margin: 0,
    borderLeftWidth: borders.borderEmphasis,
    borderLeftStyle: "solid",
    borderColor: colors.accent,
    paddingLeft: spacing.space3,
    fontSize: typography.fontSm,
    lineHeight: typography.leadingSm,
    fontWeight: typography.weightBold,
  },
  paragraph: {
    margin: 0,
  },
});

// Vertical rhythm for a page body.
export function Page(props: ParentProps<{ class?: string; styles?: stylex.StyleXStyles }>) {
  return (
    <div
      {...stylex.attrs(styles.root, props.styles)}
      class={cn("page-content", stylex.attrs(styles.root, props.styles).class, props.class)}
    >
      {props.children}
    </div>
  );
}

export function PageTitle(props: ParentProps) {
  return <h1 {...stylex.attrs(styles.title)}>{props.children}</h1>;
}

export function Paragraphs(props: { items: string[] }) {
  return (
    <For each={props.items}>
      {(paragraph) => <p {...stylex.attrs(styles.paragraph)}>{paragraph}</p>}
    </For>
  );
}
