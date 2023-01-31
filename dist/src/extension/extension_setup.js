"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCurrentEnv = exports.setupWatch = exports.setupReactive = exports.setupComputed = exports.setupRef = exports._currentEnv = exports._ref = exports._reactive = exports._watch = exports._computed = void 0;
const baseExceptions_1 = require("~/base/baseExceptions");
const lazy_1 = require("~/utils/lazy");
let computedMethod = new lazy_1.CallableDelegate(() => {
    throw new baseExceptions_1.InvalidUsageError("computed method used before setup. Please inject computed method with setupComputed first!");
});
let reactiveMethod = new lazy_1.CallableDelegate(() => {
    throw new baseExceptions_1.InvalidUsageError("reactive method used before setup. Please inject reactive method with setupReactive first!");
});
let refMethod = new lazy_1.CallableDelegate(() => {
    throw new baseExceptions_1.InvalidUsageError("ref method used before setup. Please inject ref method with setupRef first!");
});
let watchMethod = new lazy_1.CallableDelegate(() => {
    throw new baseExceptions_1.InvalidUsageError("watch method used before setup. Please inject watch method with setupWatch first!");
});
let _env = { value: "develop" };
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
        throw new baseExceptions_1.InvalidUsageError("currentEnv not specified. Please inject env with setupCurrentEnv first!");
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
 * @param env - develop | production | release | test {@link Env}
 */
function setupCurrentEnv(env) {
    _env.value = env;
}
exports.setupCurrentEnv = setupCurrentEnv;
//# sourceMappingURL=extension_setup.js.map