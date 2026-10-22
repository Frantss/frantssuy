import {
  colors,
  spacing,
  typography,
  dimensions,
  borders,
  motion,
  conditions,
} from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/solid-router";
import { ThemeToggle } from "@/client/features/theme/theme-toggle";
import { LocaleToggle } from "@/client/features/localization/locale-toggle";
import { ButtonLink } from "@/client/ui/button-link";
import { portfolio_cv, profile } from "./portfolio.data";
import { m } from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { analytics_capture } from "@/client/analytics/analytics";

const styles = stylex.create({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: { default: spacing.space2, [conditions.wide]: spacing.space4 },
    paddingInline: spacing.space4,
    paddingBlock: spacing.space3,
  },
  brand: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: spacing.space3,
    color: colors.fg,
    textDecoration: "none",
  },
  monogram: {
    display: "grid",
    width: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeMonogram },
    height: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeMonogram },
    flexShrink: 0,
    placeItems: "center",
    borderWidth: borders.borderRule,
    borderStyle: "solid",
    borderColor: {
      default: colors.lineStrong,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.faint },
      [stylex.when.ancestor(":focus-visible")]: colors.faint,
    },
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    fontWeight: typography.weightBold,
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
  },
  handle: {
    fontWeight: typography.weightBold,
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionDuration: motion.durationColor,
    transitionTimingFunction: motion.easeColor,
    color: {
      default: null,
      [conditions.hover]: { default: null, [stylex.when.ancestor(":hover")]: colors.link },
      [stylex.when.ancestor(":focus-visible")]: colors.link,
    },
    display: { default: null, [conditions.narrow]: "none" },
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.space2,
  },
  desktopControl: {
    display: { default: "grid", [conditions.narrow]: "none" },
  },
  desktop: {
    display: { default: "inline", [conditions.narrow]: "none" },
  },
});

export function SiteHeader() {
  // Phones drop the file extension so the header fits at 320px.
  const cv = () => m.header_cv().replace(/\.pdf$/, "");

  return (
    <header {...stylex.attrs(styles.root)}>
      <Link to="/" {...stylex.attrs(styles.brand, stylex.defaultMarker())}>
        <span {...stylex.attrs(styles.monogram)}>FB</span>
        <span {...stylex.attrs(styles.handle)}>{profile.handle}</span>
      </Link>
      <div {...stylex.attrs(styles.actions)}>
        <ThemeToggle styles={styles.desktopControl} />
        <LocaleToggle styles={styles.desktopControl} placement="header" />
        <ButtonLink.Outline
          href={portfolio_cv(getLocale()).href}
          download={portfolio_cv(getLocale()).filename}
          onClick={() =>
            analytics_capture("cv_download_clicked", {
              locale: getLocale(),
              cv_locale: getLocale(),
              placement: "header",
            })
          }
        >
          {cv()}
          <span {...stylex.attrs(styles.desktop)}>.pdf</span>
        </ButtonLink.Outline>
        <ButtonLink.Solid
          href={`mailto:${profile.email}`}
          onClick={() =>
            analytics_capture("contact_clicked", { locale: getLocale(), placement: "header" })
          }
        >
          {m.header_contact()}
        </ButtonLink.Solid>
      </div>
    </header>
  );
}
