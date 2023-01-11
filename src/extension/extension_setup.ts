import { ComputedRef, Ref, UnwrapNestedRefs } from "@/base/vueTypes";
import { AssertionError } from "assert";
import { assert } from "console";

import { InvalidUsageError, NotImplementedError } from "~/base/baseExceptions";
import { CallableDelegate, LazyHolder } from "~/utils/lazy";
import { assertMsg } from "..";

export type ExtSetupOption = {
  reactive: any;
  computed: any;
  ref: any;
};
let computedMethod = new CallableDelegate<<T>() => ComputedRef<T>>(() => {
  throw new InvalidUsageError("computed method used before setup. Please inject computed method with setupComputed first!");
});
let reactiveMethod = new CallableDelegate<<T>(arg: T) => UnwrapNestedRefs<T>>(
  () => {
    throw new InvalidUsageError("reactive method used before setup. Please inject reactive method with setupReactive first!");
  }
);
let refMethod = new CallableDelegate<<T>(arg?: T) => Ref<T>>(() => {
  throw new InvalidUsageError("ref method used before setup. Please inject ref method with setupRef first!");
});
let watchMethod = new CallableDelegate(() => {
  throw new InvalidUsageError("watch method used before setup. Please inject watch method with setupWatch first!");
});

type TEnv = "develop" | "production" | "release" | "test";
let _env: { value: TEnv | undefined } = { value: "develop" };

/**
 * @internal 由外部注入 computed method  - 如 vue 的 computed
 * @see {@link setupComputed}
 */
export const _computed = computedMethod;

/**
 * @internal 由外部注入 watch method - 如 vue 的 watch
 * @see {@link setupWatch}
 * */
export const _watch = watchMethod;

/**
 * @internal 由外部注入 reactive method - 如 vue 的 reactive
 * @see {@link setupReactive}
 * */
export const _reactive = reactiveMethod;

/**
 * @internal 由外部注入 ref method - 如 vue 的 ref
 * @see {@link setupRef}
 * */
export const _ref = refMethod;

/**
 * @internal 由外部注入當前 env
 * @see {@link setupCurrentEnv}
 *  */
export const _currentEnv = LazyHolder(() => {
  if (_env.value == undefined) {
    throw new InvalidUsageError("currentEnv not specified. Please inject env with setupCurrentEnv first!");
  }
  return _env;
});

/**
 * 用於外部注入 vue RefImpl constructor
 * @param refConstructor RefImpl
 */
export function setupRef(refConstructor: any) {
  refMethod.delegate = refConstructor;
}

/**
 * 用於外部注入 vue ComputedRef constructor
 * @param computedConstructor ComputedRef
 */
export function setupComputed(computedConstructor: any) {
  computedMethod.delegate = computedConstructor;
}

/**
 * 用於外部注入 vue UnWrappedRef constructor
 * @param reactiveConstructor UnWrappedRef
 */
export function setupReactive(reactiveConstructor: any) {
  reactiveMethod.delegate = reactiveConstructor;
}

/**
 * 用於外部注入 vue watch constructor
 * @param watchConstructor UnWrappedRef
 */
export function setupWatch(watchConstructor: any) {
  watchMethod.delegate = watchConstructor;
}

/**
 * 用於外部注入開發環境
 * @param env - develop | production | release | test {@link TEnv}
 */
export function setupCurrentEnv(env: TEnv) {
  _env.value = env;
}
