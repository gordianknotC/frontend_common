import { CallableDelegate, LazyHolder } from "../utils/lazy";
let computedMethod = new CallableDelegate(() => {
    throw new Error("computed method used before setup");
});
let reactiveMethod = new CallableDelegate(() => {
    throw new Error("reactive method used before setup");
});
let refMethod = new CallableDelegate(() => {
    throw new Error("reactive method used before setup");
});
let watchMethod = new CallableDelegate(() => {
    throw new Error("watch method used before setup");
});
let _env = { value: undefined };
export const computed = computedMethod;
export const watch = watchMethod;
export const reactive = reactiveMethod;
export const ref = refMethod;
export const currentEnv = LazyHolder(() => {
    if (_env.value == undefined) {
        throw new Error("currentEnv not specified");
    }
    return _env;
});
/**
 * 用於外部注入 vue RefImpl constructor
 * @param refConstructor RefImpl
 */
export function setupRef(refConstructor) {
    refMethod.delegate = refConstructor;
}
/**
 * 用於外部注入 vue ComputedRef constructor
 * @param computedConstructor ComputedRef
 */
export function setupComputed(computedConstructor) {
    computedMethod.delegate = computedConstructor;
}
/**
 * 用於外部注入 vue UnWrappedRef constructor
 * @param reactiveConstructor UnWrappedRef
 */
export function setupReactive(reactiveConstructor) {
    reactiveMethod.delegate = reactiveConstructor;
}
/**
 * 用於外部注入 vue watch constructor
 * @param watchConstructor UnWrappedRef
 */
export function setupWatch(watchConstructor) {
    watchMethod.delegate = watchConstructor;
}
export function setupCurrentEnv(env) {
    _env.value = env;
}
//# sourceMappingURL=extension_setup.js.map