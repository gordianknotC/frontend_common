"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCurrentEnv = exports.setupWatch = exports.setupReactive = exports.setupComputed = exports.setupRef = exports.currentEnv = exports.ref = exports.reactive = exports.watch = exports.computed = void 0;
const lazy_1 = require("../utils/lazy");
let computedMethod = new lazy_1.CallableDelegate(() => {
    throw new Error("computed method used before setup");
});
let reactiveMethod = new lazy_1.CallableDelegate(() => {
    throw new Error("reactive method used before setup");
});
let refMethod = new lazy_1.CallableDelegate(() => {
    throw new Error("reactive method used before setup");
});
let watchMethod = new lazy_1.CallableDelegate(() => {
    throw new Error("watch method used before setup");
});
let _env = { value: undefined };
exports.computed = computedMethod;
exports.watch = watchMethod;
exports.reactive = reactiveMethod;
exports.ref = refMethod;
exports.currentEnv = (0, lazy_1.LazyHolder)(() => {
    if (_env.value == undefined) {
        throw new Error("currentEnv not specified");
    }
    return _env;
});
/**
 * 用於外部注入 vue RefImpl constructor
 * @param refConstructor RefImpl
 */
function setupRef(refConstructor) {
    refMethod.delegate = refConstructor;
}
exports.setupRef = setupRef;
/**
 * 用於外部注入 vue ComputedRef constructor
 * @param computedConstructor ComputedRef
 */
function setupComputed(computedConstructor) {
    computedMethod.delegate = computedConstructor;
}
exports.setupComputed = setupComputed;
/**
 * 用於外部注入 vue UnWrappedRef constructor
 * @param reactiveConstructor UnWrappedRef
 */
function setupReactive(reactiveConstructor) {
    reactiveMethod.delegate = reactiveConstructor;
}
exports.setupReactive = setupReactive;
/**
 * 用於外部注入 vue watch constructor
 * @param watchConstructor UnWrappedRef
 */
function setupWatch(watchConstructor) {
    watchMethod.delegate = watchConstructor;
}
exports.setupWatch = setupWatch;
function setupCurrentEnv(env) {
    _env.value = env;
}
exports.setupCurrentEnv = setupCurrentEnv;
//# sourceMappingURL=extension_setup.js.map