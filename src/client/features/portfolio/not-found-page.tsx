import { Link, useLocation } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { Facts } from "@/client/ui/facts";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { analytics_autocapture } from "@/client/analytics/analytics";

export function NotFoundPage() {
  const location = useLocation();
  const inWriting = () => location().pathname.startsWith("/writing/");

  return (
    <Page class="max-w-[60ch]">
      <PageTitle>{m.not_found_title()}</PageTitle>
      <Facts.List>
        <Facts.Item label={m.not_found_status()}>404</Facts.Item>
        <Facts.Item label={m.not_found_path()}>
          <code class="break-all text-fg">{location().pathname}</code>
        </Facts.Item>
      </Facts.List>
      <p class="m-0">{inWriting() ? m.not_found_article() : m.not_found_page()}</p>
      <p class="m-0">
        <Show
          when={inWriting()}
          fallback={
            <Link
              to="/"
              class="inline-flex min-h-11 items-center sm:min-h-0"
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
            class="inline-flex min-h-11 items-center sm:min-h-0"
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
