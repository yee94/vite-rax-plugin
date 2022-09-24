const options: any = {};
import inject from "./installGlobalHook";
import attachRenderer from "./attachRenderer";

const hook = inject(globalThis);

hook.on("mount", ({ internalInstance, ...args }) => {
  const element = internalInstance.__currentElement;
  if (typeof element?.type === "function") {
    element["__c"] = internalInstance._instance;
    element["__e"] =
      internalInstance?._renderedComponent?._instance?.context?.current;
    options.vnode?.(element);
  }
});

hook.on("renderer", ({ id, renderer }) => {
  attachRenderer(hook, id, renderer);
});

export default options;
