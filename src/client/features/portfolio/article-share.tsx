import { spacing, dimensions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";
import { IconCheck, IconLink } from "@tabler/icons-solidjs";
import { Button } from "@/client/ui/button";
import { createClipboardCopy } from "@/client/lib/create-clipboard-copy";
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
  const clipboard = createClipboardCopy();

  const url = () => `${site.origin}/writing/${encodeURIComponent(props.article.slug)}`;

  const copyLink = async () => {
    if (!(await clipboard.copy(url()))) return;
    analytics_capture("article_shared", {
      article_slug: props.article.slug,
      locale: getLocale(),
      method: "copy",
    });
  };

  const status = () =>
    ({ idle: "", copied: m.article_link_copied(), failed: m.article_copy_failed() })[
      clipboard.state()
    ];

  return (
    <>
      <Tooltip label={m.article_copy_link()}>
        {(triggerProps) => (
          <Button
            {...triggerProps({ onClick: copyLink })}
            variant="icon"
            aria-label={m.article_copy_link()}
          >
            <Show
              when={clipboard.state() === "copied"}
              fallback={<IconLink size={18} aria-hidden="true" />}
            >
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
