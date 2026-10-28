import * as stylex from "@stylexjs/stylex";
import { cn } from "@/client/lib/cn";
// Article dates are stored as YYYY.MM.DD; <time> needs the ISO form.
// `short` drops the year where a heading already shows it.
export function ArticleDate(props: {
  date: string;
  short?: boolean;
  class?: string;
  styles?: stylex.StyleXStyles;
}) {
  return (
    <time
      dateTime={props.date.replaceAll(".", "-")}
      {...stylex.attrs(props.styles)}
      class={cn(stylex.attrs(props.styles).class, props.class)}
    >
      {props.short ? props.date.slice(5) : props.date}
    </time>
  );
}
