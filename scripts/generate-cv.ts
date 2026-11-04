import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const port = 3334;
const origin = `http://localhost:${port}`;

const server = spawn("pnpm", ["exec", "vp", "dev", "--port", String(port), "--strictPort"], {
  env: { ...process.env, APP_ENV: "test" },
  stdio: ["ignore", "ignore", "inherit"],
  detached: true,
});

try {
  await waitForServer();
  await mkdir("public", { recursive: true });

  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({ reducedMotion: "reduce", colorScheme: "light" });
    const page = await context.newPage();

    await page.goto(`${origin}/cv`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: "public/cv-en.pdf",
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      outline: true,
    });
    await context.close();
    console.log("public/cv-en.pdf");
  } finally {
    await browser.close();
  }
} finally {
  if (server.pid) process.kill(-server.pid);
}

async function waitForServer() {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`dev server exited with ${server.exitCode}`);
    try {
      if ((await fetch(`${origin}/cv`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`dev server did not respond at ${origin}`);
}
