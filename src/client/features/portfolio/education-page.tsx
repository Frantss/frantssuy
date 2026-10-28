import { colors, spacing, dimensions } from "@/client/styles/theme.stylex";
import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";
import { Entry } from "@/client/ui/entry";
import { Page, PageTitle } from "@/client/ui/page";
import { m } from "@/paraglide/messages";
import { portfolio_education } from "./portfolio.data";

const styles = stylex.create({
  root: {
    maxWidth: dimensions.sizeArticle,
    gap: spacing.space8,
    overflowWrap: "anywhere",
  },
  description: {
    margin: 0,
    color: colors.muted,
  },
});

export function EducationPage() {
  return (
    <Page styles={styles.root}>
      <PageTitle>{m.page_education()}</PageTitle>
      <For each={portfolio_education()}>
        {(education) => (
          <Entry.Root>
            <Entry.Header>
              <Entry.Title>{education.degree}</Entry.Title>
              <Entry.Aside>{education.years}</Entry.Aside>
            </Entry.Header>
            <Entry.Subtitle>{education.school}</Entry.Subtitle>
            <Entry.Meta>
              <span>{education.level ?? education.field}</span>
            </Entry.Meta>
            <Show when={education.description}>
              <p {...stylex.attrs(styles.description)}>{education.description}</p>
            </Show>
          </Entry.Root>
        )}
      </For>
    </Page>
  );
}
