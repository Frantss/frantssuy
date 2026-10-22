import { colors, spacing, typography } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { profile } from "./portfolio.data";

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
  return (
    <footer {...stylex.attrs(styles.root)}>
      <span>© 2026 {profile.name}</span>
      <span>Fig. 1.</span>
    </footer>
  );
}
