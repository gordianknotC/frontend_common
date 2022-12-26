import { ComputedRef, Ref, UnwrapNestedRefs } from "@/base/vueTypes";
import { CallableDelegate } from "~/utils/lazy";
export declare type ExtSetupOption = {
    reactive: any;
    computed: any;
    ref: any;
};
declare type TEnv = "develop" | "production" | "release";
/**
 * @internal 由外部注入 computed method  - 如 vue 的 computed
 * @see {@link setupComputed}
 */
export declare const _computed: CallableDelegate<(<T>() => ComputedRef<T>)>;
/**
 * @internal 由外部注入 watch method - 如 vue 的 watch
 * @see {@link setupWatch}
 * */
export declare const _watch: CallableDelegate<() => never>;
/**
 * @internal 由外部注入 reactive method - 如 vue 的 reactive
 * @see {@link setupReactive}
 * */
export declare const _reactive: CallableDelegate<(<T>(arg: T) => UnwrapNestedRefs<T>)>;
/**
 * @internal 由外部注入 ref method - 如 vue 的 ref
 * @see {@link setupRef}
 * */
export declare const _ref: CallableDelegate<(<T>(arg?: T) => Ref<T>)>;
/**
 * @internal 由外部注入當前 env
 * @see {@link setupCurrentEnv}
 *  */
export declare const _currentEnv: {
    value: TEnv | undefined;
};
/**
 * 用於外部注入 vue RefImpl constructor
 * @param refConstructor RefImpl
 */
export declare function setupRef(refConstructor: any): void;
/**
 * 用於外部注入 vue ComputedRef constructor
 * @param computedConstructor ComputedRef
 */
export declare function setupComputed(computedConstructor: any): void;
/**
 * 用於外部注入 vue UnWrappedRef constructor
 * @param reactiveConstructor UnWrappedRef
 */
export declare function setupReactive(reactiveConstructor: any): void;
/**
 * 用於外部注入 vue watch constructor
 * @param watchConstructor UnWrappedRef
 */
export declare function setupWatch(watchConstructor: any): void;
/**
 * 用於外部注入開發環境
 * @param env - develop | production | release
 */
export declare function setupCurrentEnv(env: "develop" | "production" | "release"): void;
export {};
