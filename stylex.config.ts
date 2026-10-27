import { fileURLToPath } from "node:url";
import { transformAsync } from "@babel/core";
import type { Options } from "@stylexjs/babel-plugin";
import type { Plugin } from "vite-plus";

export const stylexOptions = {
  dev: false,
  runtimeInjection: false,
  sxPropName: false,
  treeshakeCompensation: true,
  aliases: { "@/*": [fileURLToPath(new URL("./src/*", import.meta.url))] },
  unstable_moduleResolution: {
    type: "commonJS",
    rootDir: fileURLToPath(new URL(".", import.meta.url)),
  },
} satisfies Partial<Options>;

export function stylexPlugin(): Plugin {
  return {
    name: "stylex-transform",
    enforce: "pre",
    handleHotUpdate(context) {
      if (!context.file.endsWith(".stylex.ts")) return;

      for (const environment of Object.values(context.server.environments)) {
        environment.moduleGraph.invalidateAll();
        environment.hot.send({ type: "full-reload" });
      }

      return [];
    },
    async transform(source, id) {
      if (!/\.[cm]?[jt]sx?$/.test(id) || !source.includes("@stylexjs/stylex")) return;
      const result = await transformAsync(source, {
        filename: id,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [["@stylexjs/babel-plugin", stylexOptions]],
        sourceMaps: true,
      });

      if (!result?.code) return;

      return { code: result.code, map: result.map ? JSON.stringify(result.map) : null };
    },
  };
}
