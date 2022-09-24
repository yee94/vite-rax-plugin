/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
"use strict";

/**
 * This takes care of patching the renderer to emit events on the global
 * `Hook`. The returned object has a `.cleanup` method to un-patch everything.
 */
function attachRenderer(hook, rid, renderer) {
  decorateMany(renderer.Reconciler, {
    mountComponent(internalInstance, rootID, transaction, context) {
      hook.emit("mount", { internalInstance, renderer: rid });
    },
    receiveComponent(internalInstance, nextChild, transaction, context) {
      hook.emit("update", {
        internalInstance,
        renderer: rid,
      });
    },
    unmountComponent(internalInstance) {
      hook.emit("unmount", { internalInstance, renderer: rid });
    },
  });
}

function decorate(obj, attr, fn) {
  var old = obj[attr];
  obj[attr] = function (instance) {
    var res = old.apply(this, arguments);
    fn.apply(this, arguments);
    return res;
  };
  return old;
}

function decorateMany(source, fns) {
  var olds = {};
  for (var name in fns) {
    olds[name] = decorate(source, name, fns[name]);
  }
  return olds;
}

module.exports = attachRenderer;
