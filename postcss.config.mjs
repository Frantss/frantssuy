import { stylexOptions } from "./stylex.config.ts";

export default {
  plugins: {
    "@stylexjs/postcss-plugin": {
      include: ["./src/**/*.{ts,tsx}"],
      exclude: process.env.NODE_ENV === "test" ? [] : ["./src/**/tests/**"],
      babelConfig: {
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ["typescript", "jsx"] },
        plugins: [["@stylexjs/babel-plugin", stylexOptions]],
      },
      useCSSLayers: { prefix: "stylex" },
    },
  },
};
