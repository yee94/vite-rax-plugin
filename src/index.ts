import { mergeConfig, Plugin } from "vite";
import filterReplace from "vite-plugin-filter-replace";
import rpx2vw from "postcss-plugin-rpx2vw";
import { UserConfig } from "vitest";

export default function viteTransformCSSModulesPlugin(): Plugin {
  const replacePlugin = filterReplace([
    {
      filter: /rax-.+\.js$/,
      replace(source) {
        return source
          .replace(/(indexStyleSheet.*?from)/g, "")
          .replace(/(indexStyleSheet.*)/g, "{}");
      },
    },
  ]);

  return {
    ...replacePlugin,
    name: "vite-plugin-rax",
    async config(config, env) {
      if (typeof replacePlugin.config === "function") {
        const nextConfig = await replacePlugin.config(config, env);
        if (nextConfig) {
          config = nextConfig;
        }
      }

      return mergeConfig(config, {
        css: {
          postcss: {
            plugins: [rpx2vw() as any],
          },
        },
      } as UserConfig);
    },
  };
}
