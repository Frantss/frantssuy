import { expect, test } from "@playwright/test";

// The server-rendered search field accepts typing before the app has started in the browser.
// Holding back the client entry, which starts the app, recreates that window reliably.
test("searches for text typed before the app started", async ({ page }) => {
  let release!: () => void;
  const entryHeld = new Promise<void>((resolve) => (release = resolve));

  await page.route("**/*", async (route) => {
    if (route.request().url().includes("client-entry")) await entryHeld;
    await route.continue();
  });

  await page.goto("/writing", { waitUntil: "commit" });
  const search = page.getByRole("searchbox");

  await search.pressSequentially("log");
  release();

  // A cold dev server can take several seconds to compile the app before it starts.
  await expect(page).toHaveURL(/[?&]q=log\b/, { timeout: 20_000 });
  await expect(search).toHaveValue("log");
});
