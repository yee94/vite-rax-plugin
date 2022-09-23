import { mergeConfig, Plugin } from "vite";
import filterReplace from "vite-plugin-filter-replace";
import rpx2vw from "postcss-plugin-rpx2vw";
import tsconfigPaths from "vite-tsconfig-paths";

import { UserConfig } from "vitest";
import raxHmr from "./hmr";
import { promises as fs } from "fs";
import path from "path";

export default function viteTransformCSSModulesPlugin(): Plugin[] {
  const virtualId = "virtual:rad-html";
  return [
    ...raxHmr(),
    filterReplace([
      {
        filter: /rax-.+\.js$/,
        replace(source) {
          return source.replace(/= +?indexStyleSheet.*/g, "= {};");
        },
      },
    ]),
    tsconfigPaths(),
    {
      name: "vite-plugin-rax",

      transformIndexHtml: {
        enforce: "pre",
        async transform(html) {
          const currentHtml = await fs.readFile(
            path.resolve(__dirname, "./index.html"),
            "utf-8"
          );

          return html.replace("</head>", `${currentHtml}</head>`);
        },
      },

      async config(config, env) {
        return mergeConfig(config, {
          css: {
            postcss: {
              plugins: [rpx2vw()],
            },
          },
        } as UserConfig);
      },
    },
  ];
}
