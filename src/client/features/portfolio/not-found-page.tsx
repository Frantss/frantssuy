import { colors, dimensions, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { Link, useLocation } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { Facts } from "@/client/ui/facts";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { analytics_autocapture } from "@/client/analytics/analytics";

const styles = stylex.create({
  root: {
    maxWidth: dimensions.sizeProse,
  },
  path: {
    wordBreak: "break-all",
    color: colors.fg,
  },
  paragraph: {
    margin: 0,
  },
  link: {
    display: "inline-flex",
    minHeight: { default: dimensions.sizeTouch, [conditions.wide]: 0 },
    alignItems: "center",
  },
});

export function NotFoundPage() {
  const location = useLocation();
  const inWriting = () => location().pathname.startsWith("/writing/");

  return (
    <Page styles={styles.root}>
      <PageTitle>{m.not_found_title()}</PageTitle>
      <Facts.List>
        <Facts.Item label={m.not_found_status()}>404</Facts.Item>
        <Facts.Item label={m.not_found_path()}>
          <code {...stylex.attrs(styles.path)}>{location().pathname}</code>
        </Facts.Item>
      </Facts.List>
      <p {...stylex.attrs(styles.paragraph)}>
        {inWriting() ? m.not_found_article() : m.not_found_page()}
      </p>
      <p {...stylex.attrs(styles.paragraph)}>
        <Show
          when={inWriting()}
          fallback={
            <Link
              to="/"
              {...stylex.attrs(styles.link)}
              {...analytics_autocapture({
                id: "nav-link",
                destination: "/",
                placement: "not-found",
              })}
            >
              {m.not_found_home()}
            </Link>
          }
        >
          <Link
            to="/writing"
            {...stylex.attrs(styles.link)}
            {...analytics_autocapture({
              id: "nav-link",
              destination: "/writing",
              placement: "not-found",
            })}
          >
            {m.not_found_writing()}
          </Link>
        </Show>
      </p>
    </Page>
  );
}
