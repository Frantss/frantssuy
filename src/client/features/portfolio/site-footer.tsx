import { colors, spacing, typography } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { useLocation } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { profile } from "./portfolio.data";
import { page_findCurrentIndex, page_label } from "./site-nav";

const styles = stylex.create({
  root: {
    display: "flex",
    justifyContent: "space-between",
    paddingInline: spacing.space4,
    paddingBlock: spacing.space3,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
  },
});

export function SiteFooter() {
  const location = useLocation();
  const currentIndex = () => page_findCurrentIndex(location().pathname);

  return (
    <footer {...stylex.attrs(styles.root)}>
      <span>© 2026 {profile.name}</span>
      <Show when={currentIndex() !== -1}>
        <span>
          Fig. {currentIndex() + 1}. {page_label(currentIndex())}
        </span>
      </Show>
    </footer>
  );
}
