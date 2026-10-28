import { dimensions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { useLocation, useRouterState } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { createActiveSection } from "@/client/lib/create-active-section";
import { Frame } from "@/client/ui/frame";
import { LocaleToggle } from "@/client/features/localization/locale-toggle";
import { ThemeToggle } from "@/client/features/theme/theme-toggle";
import { Dock } from "@/client/ui/dock";
import { Rail } from "@/client/ui/rail";
import { m } from "@/paraglide/messages";
import { analytics_autocapture } from "@/client/analytics/analytics";
import { portfolio_agents_outline } from "./portfolio.data";

const styles = stylex.create({
  touch: {
    width: dimensions.sizeTouch,
    height: dimensions.sizeTouch,
  },
});

const pages = [
  { to: "/", label: m.nav_about },
  { to: "/work", label: m.nav_work },
  { to: "/education", label: m.nav_education },
  { to: "/projects", label: m.nav_projects },
  { to: "/agents", label: m.nav_agents, outline: portfolio_agents_outline },
  { to: "/writing", label: m.nav_writing },
] as const;

type OutlineItem = { id: string; label: string; nested: boolean };

function page_isCurrent(page: (typeof pages)[number], pathname: string) {
  return page.to === "/"
    ? pathname === "/"
    : pathname === page.to || pathname.startsWith(`${page.to}/`);
}

function pageOutline(page: (typeof pages)[number]) {
  return "outline" in page ? page.outline : undefined;
}

// Shows the page's section links while that page is open, marking the one in view.
function PageOutline(props: {
  outline: () => OutlineItem[];
  container: typeof Rail.Outline;
  link: typeof Rail.OutlineLink;
}) {
  const items = () => props.outline();
  const active = createActiveSection(() => items().map((item) => item.id), Frame.fillSelector);

  return (
    <props.container label={m.nav_outline()}>
      <For each={items()}>
        {(item) => (
          <props.link href={`#${item.id}`} nested={item.nested} current={active() === item.id}>
            {item.label}
          </props.link>
        )}
      </For>
    </props.container>
  );
}

export function SiteNav() {
  // The resolved location changes inside the router's view transition, so the rail's before and
  // after snapshots differ and the marker can travel. The pending location changes too early.
  const pathname = useRouterState({
    select: (state) => (state.resolvedLocation ?? state.location).pathname,
  });

  return (
    <Rail.Nav label={m.nav_pages()}>
      <For each={pages}>
        {(page) => (
          <>
            <Rail.Link
              to={page.to}
              current={page_isCurrent(page, pathname())}
              {...analytics_autocapture({
                id: "nav-link",
                destination: page.to,
                placement: "sidebar",
              })}
            >
              {page.label()}
            </Rail.Link>
            <Show when={pathname() === page.to && pageOutline(page)}>
              {(outline) => (
                <PageOutline outline={outline()} container={Rail.Outline} link={Rail.OutlineLink} />
              )}
            </Show>
          </>
        )}
      </For>
    </Rail.Nav>
  );
}

export function SiteDock() {
  const location = useLocation();
  const current = () => pages.find((page) => page_isCurrent(page, location().pathname));

  return (
    <Dock.Root>
      <Dock.Bar>
        <Dock.Trigger
          {...analytics_autocapture({ id: "mobile-menu-toggle" })}
          menuLabel={m.dock_menu()}
          closeLabel={m.dock_close()}
        >
          ❯ {current()?.label()}
        </Dock.Trigger>
      </Dock.Bar>
      <Dock.Sheet label={m.nav_pages()}>
        <Dock.List>
          <For each={pages}>
            {(page) => (
              <>
                <Dock.Link
                  to={page.to}
                  activeOptions={{ exact: page.to === "/" }}
                  {...analytics_autocapture({
                    id: "nav-link",
                    destination: page.to,
                    placement: "dock",
                  })}
                >
                  {page.label()}
                </Dock.Link>
                <Show when={location().pathname === page.to && pageOutline(page)}>
                  {(outline) => (
                    <PageOutline
                      outline={outline()}
                      container={Dock.Outline}
                      link={Dock.OutlineLink}
                    />
                  )}
                </Show>
              </>
            )}
          </For>
        </Dock.List>
        <Dock.Footer>
          <LocaleToggle styles={styles.touch} placement="dock" />
          <ThemeToggle styles={styles.touch} />
        </Dock.Footer>
      </Dock.Sheet>
    </Dock.Root>
  );
}
