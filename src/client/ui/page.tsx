import { colors, spacing, typography, borders, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For, type ParentProps } from "solid-js";
import { cn } from "@/client/lib/cn";

const styles = stylex.create({
  root: {
    display: "grid",
    gap: spacing.space5,
  },

  // Print keeps the compact accent-bar title the CV PDF is laid out around.
  title: {
    margin: 0,
    borderLeftWidth: { default: 0, [conditions.print]: borders.borderEmphasis },
    borderLeftStyle: "solid",
    borderColor: colors.accent,
    paddingLeft: { default: 0, [conditions.print]: spacing.space3 },
    fontSize: { default: typography.fontTitle, [conditions.print]: typography.fontSm },
    lineHeight: { default: typography.leadingTitle, [conditions.print]: typography.leadingSm },
    fontWeight: { default: typography.weightMedium, [conditions.print]: typography.weightBold },
    letterSpacing: { default: typography.trackingTitle, [conditions.print]: "normal" },
    textWrap: { default: "balance", [conditions.print]: "wrap" },
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
