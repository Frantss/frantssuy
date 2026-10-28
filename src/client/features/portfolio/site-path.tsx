import { colors, spacing, typography, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { Link, useLocation } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { profile } from "./portfolio.data";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  root: {
    marginBlockEnd: spacing.space2,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.faint,
    overflowWrap: "anywhere",
  },
  list: {
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
    listStyleType: "none",
    padding: 0,
  },
  link: {
    color: {
      default: colors.faint,
      [conditions.hover]: { default: null, ":hover": colors.fg },
      ":focus-visible": colors.fg,
    },
    textDecorationLine: {
      default: "none",
      [conditions.hover]: { default: null, ":hover": "underline" },
    },
    textUnderlineOffset: "0.2em",
  },
  current: {
    color: colors.accent,
  },
});

// Each crumb links to its own route; the root crumb is the home page, named after it.
// Links match exactly, so a parent crumb never claims aria-current from the router.
export function sitePath_crumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return [{ label: "about", href: "/" }];

  return segments.map((label, index) => ({
    label,
    href: `/${segments.slice(0, index + 1).join("/")}`,
  }));
}

// Shell-style location line that doubles as breadcrumb navigation.
export function SitePath() {
  const location = useLocation();
  const crumbs = () => sitePath_crumbs(location().pathname);
  const atHome = () => location().pathname === "/";

  return (
    <nav aria-label={m.nav_breadcrumb()} {...stylex.attrs(styles.root)}>
      <ol {...stylex.attrs(styles.list)}>
        <li>
          <Show when={!atHome()} fallback={`~/${profile.handle}`}>
            <Link to="/" activeOptions={{ exact: true }} {...stylex.attrs(styles.link)}>
              ~/{profile.handle}
            </Link>
          </Show>
          /
        </li>
        <For each={crumbs()}>
          {(crumb, index) => (
            <li>
              <Show
                when={index() < crumbs().length - 1}
                fallback={
                  <span aria-current="page" {...stylex.attrs(styles.current)}>
                    {crumb.label}
                  </span>
                }
              >
                <Link
                  to={crumb.href}
                  activeOptions={{ exact: true }}
                  {...stylex.attrs(styles.link)}
                >
                  {crumb.label}
                </Link>
                /
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  );
}
