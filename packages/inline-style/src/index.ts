import { PluginOption } from "vite";
import _styleSheetLoader from "stylesheet-loader";

const isCSSRequest = (request: string): boolean =>
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\?)/.test(request);
const isNodeModulesRequest = (request: string): boolean =>
  /node_modules/.test(request);

const quotesExp = /"(.*)"/;

const styleSheetLoader = (source) => {
  return _styleSheetLoader(source).replace(
    /module\.exports +=/,
    "export default "
  );
};

export default function inlineStylePlugin(): PluginOption {
  let isDev = false;

  return {
    name: "vite-rax-inline-style",
    enforce: "post",

    config(c) {
      c.css.modules = false;
      return c;
    },
    configResolved(resolvedConfig) {
      isDev = resolvedConfig.command === "serve";
    },

    transform(code, id) {
      // rax组件兼容处理
      if (isNodeModulesRequest(id) || /\?html-proxy/.test(id)) {
        return code;
      }

      if (!isCSSRequest(id)) {
        return code;
      }

      // css文件需要css string 转换 css module
      if (isDev) {
        let targetIndex = 0;

        // 解析成数组方便操作
        const codeArr = code.split("\n");

        // 找出默认导出的位置
        const deleteIndex = codeArr.findIndex((item, index) => {
          return item.startsWith("export default __vite__css");
        });

        // 找出css string
        const cssCode = codeArr.find((item, index) => {
          targetIndex = index;
          // 兼容 2.7.4改动 https://github.com/vitejs/vite/pull/5873
          return (
            item.startsWith("const __vite__css = ") ||
            item.startsWith("const css = ")
          );
        });

        // css string to css modules
        const result = cssCode.match(quotesExp)[1].split("\\n").join("\n");

        if (deleteIndex) {
          codeArr[deleteIndex] = styleSheetLoader(result);
        } else {
          codeArr.push(styleSheetLoader(result));
        }

        return codeArr.join("\n");
      } else {
        // TODO
      }
      return null;
    },
  };
}
