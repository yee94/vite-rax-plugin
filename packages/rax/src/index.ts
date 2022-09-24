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
  { inlineStyle } = {} as RaxPluginOptions
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
        const isJsxPreserve = await (async () => {
          try {
            const tsconfig = await fs.readFile(
              path.resolve(process.cwd(), "tsconfig.json"),
              "utf-8"
            );
            return JSON.parse(tsconfig)?.compilerOptions?.jsx === "preserve";
          } catch (e) {
            return false;
          }
        })();

        return mergeConfig(config, {
          esbuild: isJsxPreserve
            ? {
                jsxInject: `import { createElement } from 'rax'`,
              }
            : {},
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
