import { Plugin } from "vite";
import prefresh from "@prefresh/vite";
import filterReplace from "vite-plugin-filter-replace";

export default function raxHmr(): Plugin[] {
  const replacer = filterReplace(
    [
      {
        filter: /rax.js$/,
        replace(source, id) {
          return `
          exports.options = require('${require.resolve(
            "./rax-dev-hook"
          )}').default;

          ${source}
          `;
        },
      },
      {
        filter: "@prefresh/core/src/index.js",
        replace(source) {
          // 替换Rax的更新方式
          source = source.replace(
            "vnode[VNODE_COMPONENT].constructor",
            `
          /* Update To Rax Update */
          vnode[VNODE_COMPONENT].__render = NewType;
          vnode[VNODE_COMPONENT].componentWillMount();
          /* Update To Rax Update End */

          vnode[VNODE_COMPONENT].constructor `
          );

          return source;
        },
      },
      {
        filter: /@prefresh\/core/,
        replace(source, id) {
          source = source.replace(
            /import (.+) from 'preact';/g,
            `import $1 from 'rax';console.log($1);`
          );

          return source;
        },
      },
    ],
    { apply: "serve" }
  );
  return [replacer, prefresh()];
}
