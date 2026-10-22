import { spacing, dimensions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For } from "solid-js";
import { Page, PageTitle } from "@/client/ui/page";
import { JobEntry } from "./job-entry";
import { portfolio_jobs } from "./portfolio.data";
import { m } from "@/paraglide/messages";

const styles = stylex.create({
  root: {
    maxWidth: dimensions.sizeArticle,
    gap: spacing.space8,
  },
});

export function WorkPage() {
  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_work()}</PageTitle>
      <For each={portfolio_jobs()}>{(job) => <JobEntry job={job} />}</For>
    </Page>
  );
}
