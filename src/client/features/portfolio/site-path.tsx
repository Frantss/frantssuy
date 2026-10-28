import { colors, spacing, typography } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { useLocation } from "@tanstack/solid-router";
import { profile } from "./portfolio.data";

const styles = stylex.create({
  root: {
    margin: 0,
    marginBlockEnd: spacing.space2,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
    overflowWrap: "anywhere",
  },
  current: {
    color: colors.accent,
  },
});

export function sitePath_segments(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.length > 0 ? segments : ["about"];
}

// Shell-style location line; the nav already announces the current page, so it stays decorative.
export function SitePath() {
  const location = useLocation();
  const segments = () => sitePath_segments(location().pathname);
  const parent = () => ["~", profile.handle, ...segments().slice(0, -1), ""].join("/");

  return (
    <p aria-hidden="true" {...stylex.attrs(styles.root)}>
      {parent()}
      <span {...stylex.attrs(styles.current)}>{segments().at(-1)}</span>
    </p>
  );
}
