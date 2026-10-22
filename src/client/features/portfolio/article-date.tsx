import * as stylex from "@stylexjs/stylex";
import { cn } from "@/client/lib/cn";
// Article dates are stored as YYYY.MM.DD; <time> needs the ISO form.
export function ArticleDate(props: { date: string; class?: string; styles?: stylex.StyleXStyles }) {
  return (
    <time
      dateTime={props.date.replaceAll(".", "-")}
      {...stylex.attrs(props.styles)}
      class={cn(stylex.attrs(props.styles).class, props.class)}
    >
      {props.date}
    </time>
  );
}
