import { colors, spacing, typography, dimensions, conditions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { IconHeart, IconHeartFilled, IconRefresh } from "@tabler/icons-solidjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import {
  createSignal,
  createUniqueId,
  ErrorBoundary,
  onMount,
  Show,
  splitProps,
  Suspense,
  type ComponentProps,
} from "solid-js";
import { orpc } from "@/client/orpc/orpc.query";
import { createRateLimitCooldown } from "@/client/orpc/orpc.ratelimit";
import { IconButton } from "@/client/ui/icon-button";
import { Tooltip } from "@/client/ui/tooltip";
import { cn } from "@/client/lib/cn";
import { article_likesQueryOptions } from "@/client/features/portfolio/article-likes.query";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  retry: {
    width: dimensions.sizeTouch,
    height: dimensions.sizeTouch,
    flexShrink: 0,
    cursor: { default: null, ":disabled": "wait" },
  },
  retrySmall: {
    width: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeSmall },
    height: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeSmall },
  },
  retryMedium: {
    width: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    height: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
  },
  button: {
    display: "inline-flex",
    width: "auto",
    alignItems: "center",
    justifyContent: "center",
    cursor: { default: null, ":disabled": "wait" },
  },
  small: {
    height: dimensions.sizeSmall,
    gap: spacing.space1_5,
    paddingInline: spacing.space1_5,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
  },
  medium: {
    height: { default: dimensions.sizeTouch, [conditions.wide]: dimensions.sizeControl },
    gap: spacing.space2,
    paddingInline: spacing.space2,
    fontSize: typography.fontSm,
    lineHeight: typography.leadingSm,
  },
  icon: {
    display: "inline-flex",
    flexShrink: 0,
  },
  iconSmall: {
    width: dimensions.sizeIconSmall,
    height: dimensions.sizeIconSmall,
  },
  iconMedium: {
    width: dimensions.sizeIcon,
    height: dimensions.sizeIcon,
  },

  error: {
    display: "flex",
    minWidth: 0,
    alignItems: "center",
    gap: spacing.space2,
  },
  loadError: {
    margin: 0,
    maxWidth: dimensions.sizeLoadError,
    textAlign: "right",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  counter: {
    display: "grid",
    justifyItems: "end",
    gap: spacing.space2,
  },
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
  saveError: {
    margin: 0,
    maxWidth: dimensions.sizeSaveError,
    textAlign: "right",
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    color: colors.muted,
  },
  liked: {
    color: colors.liked,
  },
  count: {
    fontVariantNumeric: "tabular-nums",
  },
});

export function ArticleLikeButton(props: { slug: string; size?: "sm" | "md" }) {
  return (
    <Show when={props.slug} keyed>
      {(slug) => (
        <ErrorBoundary
          fallback={(error, reset) => (
            <ArticleLikesError error={error} reset={reset} size={props.size} />
          )}
        >
          <Suspense
            fallback={
              <LikeButton size={props.size} disabled aria-label={m.article_likes_loading()}>
                …
              </LikeButton>
            }
          >
            <ArticleLikeCounter slug={slug} size={props.size} />
          </Suspense>
        </ErrorBoundary>
      )}
    </Show>
  );
}

function ArticleLikesError(props: { error: unknown; reset: () => void; size?: "sm" | "md" }) {
  const cooldown = createRateLimitCooldown();
  const errorId = createUniqueId();

  onMount(() => cooldown.handle(props.error));

  return (
    <div {...stylex.attrs(styles.error)}>
      <Show when={!cooldown.limited()}>
        <p id={errorId} role="alert" {...stylex.attrs(styles.loadError)}>
          {m.article_likes_load_error()}
        </p>
      </Show>
      <Tooltip label={m.article_likes_retry()}>
        {(triggerProps) => (
          <IconButton
            {...triggerProps({ onClick: props.reset })}
            disabled={cooldown.remaining() > 0}
            aria-label={m.article_likes_retry()}
            aria-describedby={!cooldown.limited() ? errorId : undefined}
            styles={[styles.retry, props.size === "sm" ? styles.retrySmall : styles.retryMedium]}
          >
            <IconRefresh size={props.size === "sm" ? 14 : 18} aria-hidden="true" />
          </IconButton>
        )}
      </Tooltip>
    </div>
  );
}

function ArticleLikeCounter(props: { slug: string; size?: "sm" | "md" }) {
  const queryClient = useQueryClient();
  const cooldown = createRateLimitCooldown();
  const [failed, setFailed] = createSignal(false);
  const [liked, setLiked] = createSignal(false);
  const [animationKey, setAnimationKey] = createSignal(1);
  const errorId = createUniqueId();
  const query = useQuery(() => article_likesQueryOptions(props.slug));
  const mutation = useMutation(() => orpc.articles.likes.add.mutationOptions({ retry: false }));

  onMount(() => {
    try {
      setLiked(localStorage.getItem(`article:liked:${props.slug}`) === "true");
    } catch {
      setLiked(false);
    }
  });

  async function addLike() {
    if (cooldown.remaining()) return;
    const input = { slug: props.slug };
    const queryKey = orpc.articles.likes.get.queryKey({ input });

    setFailed(false);
    try {
      await queryClient.cancelQueries({ queryKey });
      const output = await mutation.mutateAsync(input);

      queryClient.setQueryData(queryKey, (previous) => ({
        count: Math.max(previous?.count ?? 0, output.count),
      }));
    } catch (error) {
      setFailed(!cooldown.handle(error));

      return;
    }
    setLiked(true);
    setAnimationKey((key) => key + 1);
    try {
      localStorage.setItem(`article:liked:${input.slug}`, "true");
    } catch {
      // A saved like still applies to this visit when browser storage is unavailable.
    }
  }

  return (
    <div {...stylex.attrs(styles.counter)}>
      <LikeButton
        size={props.size}
        liked={liked()}
        animationKey={animationKey()}
        disabled={cooldown.remaining() > 0}
        aria-label={m.article_like({ count: query.data?.count ?? 0 })}
        aria-describedby={failed() ? errorId : undefined}
        onClick={addLike}
      >
        {query.data?.count}
      </LikeButton>
      <span role="status" {...stylex.attrs(styles.status)}>
        {m.article_likes_count({ count: query.data?.count ?? 0 })}
      </span>
      <Show when={failed()}>
        <p id={errorId} role="alert" {...stylex.attrs(styles.saveError)}>
          {m.article_likes_save_error()}
        </p>
      </Show>
    </div>
  );
}

function LikeButton(
  props: ComponentProps<"button"> & {
    "aria-label": string;
    liked?: boolean;
    animationKey?: number;
    size?: "sm" | "md";
  },
) {
  const [local, rest] = splitProps(props, ["children", "liked", "animationKey", "size"]);

  return (
    <IconButton
      {...rest}
      styles={[styles.button, local.size === "sm" ? styles.small : styles.medium]}
    >
      <Show when={local.animationKey ?? 1} keyed>
        {(key) => (
          <span
            {...stylex.attrs(
              styles.icon,
              local.size === "sm" ? styles.iconSmall : styles.iconMedium,
            )}
            class={cn(
              stylex.attrs(styles.icon, local.size === "sm" ? styles.iconSmall : styles.iconMedium)
                .class,
              key > 1 && "article-like-heart",
            )}
            aria-hidden="true"
          >
            <Show when={local.liked} fallback={<IconHeart size={local.size === "sm" ? 14 : 18} />}>
              <IconHeartFilled
                size={local.size === "sm" ? 14 : 18}
                {...stylex.attrs(styles.liked)}
              />
            </Show>
          </span>
        )}
      </Show>
      <span {...stylex.attrs(styles.count)} aria-hidden="true">
        {local.children}
      </span>
    </IconButton>
  );
}
