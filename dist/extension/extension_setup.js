"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCurrentEnv = exports.setupWatch = exports.setupReactive = exports.setupComputed = exports.setupRef = exports._currentEnv = exports._ref = exports._reactive = exports._watch = exports._computed = void 0;
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
/**
 * @internal 由外部注入 computed method  - 如 vue 的 computed
 * @see {@link setupComputed}
 */
exports._computed = computedMethod;
/**
 * @internal 由外部注入 watch method - 如 vue 的 watch
 * @see {@link setupWatch}
 * */
exports._watch = watchMethod;
/**
 * @internal 由外部注入 reactive method - 如 vue 的 reactive
 * @see {@link setupReactive}
 * */
exports._reactive = reactiveMethod;
/**
 * @internal 由外部注入 ref method - 如 vue 的 ref
 * @see {@link setupRef}
 * */
exports._ref = refMethod;
/**
 * @internal 由外部注入當前 env
 * @see {@link setupCurrentEnv}
 *  */
exports._currentEnv = (0, lazy_1.LazyHolder)(() => {
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
/**
 * 用於外部注入開發環境
 * @param env - develop | production | release
 */
function setupCurrentEnv(env) {
    _env.value = env;
}
exports.setupCurrentEnv = setupCurrentEnv;
//# sourceMappingURL=extension_setup.js.map