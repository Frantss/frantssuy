import { fileURLToPath } from "node:url";
import { defineConfig, lazyPlugins } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";
import { varlockVitePlugin } from "@varlock/vite-integration";
import { stylexPlugin } from "./stylex.config";
import posthog from "@posthog/rollup-plugin";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

import { tanstackStart } from "@tanstack/solid-start/plugin/vite";

import solidPlugin from "vite-plugin-solid";
import { cloudflare } from "@cloudflare/vite-plugin";
import paraglideOptions from "./paraglide.config";
import { mdxPlugins } from "./mdx.config";

function posthogSourceMapsPlugin() {
  const personalApiKey = process.env.POSTHOG_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();

  if (!personalApiKey || !projectId) return;

  return Object.assign(
    posthog({
      personalApiKey,
      projectId,
      host: process.env.POSTHOG_HOST,
      sourcemaps: { deleteAfterUpload: true },
    }),
    {
      apply: "build" as const,
      applyToEnvironment: ({ name }: { name: string }) => name === "client",
    },
  );
}

export default defineConfig(({ mode }) => ({
  server: { preTransformRequests: mode !== "test" },
  optimizeDeps: { include: ["@inlang/paraglide-js/urlpattern-polyfill"] },
  test: {
    fileParallelism: false,
    environment: "node",
    projects: [
      {
        test: {
          name: "node",
          include: [
            "src/server/**/*.test.ts",
            "src/shared/**/*.test.ts",
            "lib/articles/**/*.test.ts",
          ],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          setupFiles: ["./src/client/tests/styles.setup.ts"],
          include: ["src/client/**/*.test.{ts,tsx}"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
  fmt: {
    ignorePatterns: [
      "src/routeTree.gen.ts",
      "src/paraglide/**",
      "env.d.ts",
      "AGENTS.md",
      "ORCHESTRATION.md",
    ],
  },
  lint: {
    jsPlugins: [
      { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
      "@stylistic/eslint-plugin",
      "@stylexjs/eslint-plugin",
    ],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "@stylexjs/valid-styles": [
        "error",
        {
          propLimits: {
            "*Color": {
              limit: ["transparent", "currentColor", "inherit"],
              reason: "Use a color variable from theme.stylex.ts.",
            },
            color: {
              limit: ["transparent", "currentColor", "inherit"],
              reason: "Use a color variable from theme.stylex.ts.",
            },
            "+(padding|margin)*": {
              limit: [0, "auto"],
              reason: "Use a spacing variable from theme.stylex.ts.",
            },
            "+(gap|rowGap|columnGap)": {
              limit: [0, "normal"],
              reason: "Use a spacing variable from theme.stylex.ts.",
            },
            fontSize: {
              limit: ["inherit"],
              reason: "Use a typography variable from theme.stylex.ts.",
            },
            fontWeight: {
              limit: ["inherit", "normal", "bolder"],
              reason: "Use a typography variable from theme.stylex.ts.",
            },
            "+(width|height|minWidth|minHeight|maxWidth|maxHeight)": {
              limit: [
                0,
                "auto",
                "none",
                "100%",
                "100dvh",
                "fit-content",
                "min-content",
                "max-content",
              ],
              reason: "Use a dimension variable from theme.stylex.ts.",
            },
            "+(border*Width|outlineWidth|outlineOffset)": {
              limit: [0],
              reason: "Use a border variable from theme.stylex.ts.",
            },
            "+(animation|transition)Duration": {
              limit: [0],
              reason: "Use a motion variable from theme.stylex.ts.",
            },
          },
        },
      ],
      "@stylexjs/valid-shorthands": "error",
      "@stylexjs/no-unused": "error",
      "@stylexjs/enforce-extension": ["error", { themeFileExtension: ".stylex.ts" }],
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
      ],
    },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ["src/paraglide/**"],
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@/lib": fileURLToPath(new URL("./lib", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: lazyPlugins(() => [
    varlockVitePlugin({ ssrInjectMode: "init-only" }),
    ...(mode === "test"
      ? []
      : cloudflare({
          viteEnvironment: { name: "ssr" },
          remoteBindings: false,
          types: { includeRuntime: false },
        })),
    stylexPlugin(),
    paraglideVitePlugin(paraglideOptions),
    ...mdxPlugins,
    tanstackStart({ server: { build: { inlineCss: true } } }),
    posthogSourceMapsPlugin(),
    solidPlugin({ ssr: mode !== "test", extensions: [".md", ".mdx"] }),
  ]),
}));
