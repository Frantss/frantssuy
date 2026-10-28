import { typography } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@/client/ui/button";
import { Tooltip } from "@/client/ui/tooltip";
import { m } from "@/paraglide/messages";
import { getLocale, setLocale } from "@/paraglide/runtime";
import { analytics_autocapture } from "@/client/analytics/analytics";

const styles = stylex.create({
  root: {
    flexShrink: 0,
    fontSize: typography.fontXs,
    lineHeight: typography.leadingXs,
    fontWeight: typography.weightBold,
  },
});

export function LocaleToggle(props: {
  class?: string;
  styles?: stylex.StyleXStyles;
  placement: "header" | "dock";
}) {
  const toggle = () => {
    void setLocale(getLocale() === "en" ? "es" : "en");
  };

  const label = () => (getLocale() === "en" ? m.locale_spanish() : m.locale_english());

  return (
    <Tooltip label={label()}>
      {(triggerProps) => (
        <Button
          variant="icon"
          {...triggerProps({ onClick: toggle })}
          {...analytics_autocapture({ id: "locale-toggle", placement: props.placement })}
          class={props.class}
          styles={[styles.root, props.styles]}
          aria-label={label()}
        >
          <span aria-hidden="true">{getLocale().toUpperCase()}</span>
        </Button>
      )}
    </Tooltip>
  );
}
