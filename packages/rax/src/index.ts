import { mergeConfig, Plugin, PluginOption } from "vite";
import filterReplace from "vite-plugin-filter-replace";
import raxInline from "vite-plugin-rax-inline-style";
import rpx2vw from "postcss-plugin-rpx2vw";
import tsconfigPaths from "vite-tsconfig-paths";
import px2rem from "postcss-pxtorem";

import { UserConfig } from "vitest";
import raxHmr from "vite-plugin-rax-hmr";
import { promises as fs } from "fs";
import path from "path";

export interface RaxPluginOptions {
  inlineStyle?: boolean;
}

export default function raxPlugin(
  { inlineStyle = true } = {} as RaxPluginOptions
): PluginOption {
  return [
    inlineStyle && raxInline(),
    filterReplace([
      {
        filter: /rax-.+\.js$/,
        replace(source) {
          return source
            .replace(/= _styleSheet.*/g, "= {}")
            .replace(/= +?indexStyleSheet.*/g, "= {};");
        },
      },
      {
        filter: /node_modules.+rax\/lib\/index.js$/,
        replace(source) {
          return `
          exports.default = module.exports;
          ${source}
          `;
        },
      },
    ]),
    raxHmr(),
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
          optimizeDeps: {
            esbuildOptions: {
              loader: {
                ".js": "jsx",
              },
            },
          },
          css: {
            postcss: {
              plugins: [
                rpx2vw(),
                px2rem({
                  rootValue: 16,
                  propList: ["*"],
                }),
              ],
            },
          },
        } as UserConfig);
      },
    },
  ];
}
