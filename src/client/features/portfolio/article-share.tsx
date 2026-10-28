import { spacing, dimensions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { createSignal, onCleanup, Show } from "solid-js";
import { IconCheck, IconLink } from "@tabler/icons-solidjs";
import { Button } from "@/client/ui/button";
import { Tooltip } from "@/client/ui/tooltip";
import { analytics_capture } from "@/client/analytics/analytics";
import type { Article } from "@/lib/articles/article-metadata";
import { site } from "@/shared/seo/site";
import { getLocale } from "@/paraglide/runtime";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  status: {
    position: "absolute",
    width: dimensions.sizeScreenReader,
    height: dimensions.sizeScreenReader,
    padding: 0,
    margin: spacing.screenReaderOffset,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
});

export function ArticleShare(props: { article: Article }) {
  const [copy, setCopy] = createSignal<"idle" | "copied" | "failed">("idle");
  let reset: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => clearTimeout(reset));

  const url = () => `${site.origin}/writing/${encodeURIComponent(props.article.slug)}`;

  const copyLink = async () => {
    clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(url());
      setCopy("copied");
      analytics_capture("article_shared", {
        article_slug: props.article.slug,
        locale: getLocale(),
        method: "copy",
      });
    } catch {
      setCopy("failed");
    }
    reset = setTimeout(() => setCopy("idle"), 2000);
  };

  const status = () =>
    ({ idle: "", copied: m.article_link_copied(), failed: m.article_copy_failed() })[copy()];

  return (
    <>
      <Tooltip label={m.article_copy_link()}>
        {(triggerProps) => (
          <Button
            {...triggerProps({ onClick: copyLink })}
            variant="icon"
            aria-label={m.article_copy_link()}
          >
            <Show when={copy() === "copied"} fallback={<IconLink size={18} aria-hidden="true" />}>
              <IconCheck size={18} aria-hidden="true" />
            </Show>
          </Button>
        )}
      </Tooltip>
      <span role="status" {...stylex.attrs(styles.status)}>
        {status()}
      </span>
    </>
  );
}
